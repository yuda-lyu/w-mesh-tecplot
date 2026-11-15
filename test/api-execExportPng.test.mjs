import fs from 'fs'
import path from 'path'
import cp from 'child_process'
import assert from 'assert'
import { mock } from 'node:test'
import execExportPng from '../src/execExportPng.mjs'
import { buildFakeTecplot } from './tools/fakeTecplot.mjs'


//spec(Gitea #148, 使用端提出):
//  S1 fpOut已存在時覆寫為新產出之png(不靜默保留舊圖); fpOut不存在時行為不變
//  S2 產出之png無法移至fpOut時throw, 訊息含`can not move exported png to fpOut`, 且暫存巨集與暫存png皆清除
//  S3 Tecplot未產出png時throw, 前綴維持`can not export fpOut[`, 若本次執行有寫cwd之batch.log則附其Err開頭之行
//  S4 暫存巨集與暫存png於失敗路徑(含Tecplot離開碼非0)亦清除


//測試之臨時檔, after刪除
let fdBase = path.resolve('./test/_tmp/api-execExportPng')

let pngWidth = (fp) => fs.readFileSync(fp).readUInt32BE(16) //IHDR之寬
let pngHeight = (fp) => fs.readFileSync(fp).readUInt32BE(20) //IHDR之高(替身以lay檔案位元組數填入, 可區分lay內容不同之輸出)

//驗證錯誤為Error且訊息以指定前綴開頭
let isErrWithPrefix = (prefix) => {
    return (err) => {
        assert.strict.equal(err instanceof Error, true)
        assert.strict.equal(err.message.startsWith(prefix), true, `message[${err.message}]`)
        return true
    }
}

//列出資料夾內殘留之暫存巨集(_tecplot_export_)、cwd暫存png(_tecplot_pic_)與fpOut同資料夾之暫存複本(_tecplot_out_)
let listTemp = (fd) => fs.readdirSync(fd).filter((v) => /^_tecplot_(pic|export|out)_/.test(v))

//是否為fpOut同資料夾之暫存複本
let isCopyName = (p) => path.basename(String(p)).startsWith('_tecplot_out_')

//故障注入: 於Node fs層(作業系統邊界)使符合isTarget之fs[name]呼叫失敗, 其餘呼叫照舊; execExportPng與wsemi皆走真實路徑, 只有該次系統呼叫之結果被改變
//  opt.after為true時先真實執行再拋錯(模擬複製到一半失敗而留下殘檔)
//  回傳還原函數, 其屬性hits為被注入失敗之呼叫引數陣列、calls為該方法全部呼叫之引數陣列(供斷言注入確實命中, 避免注入未命中而斷言仍因他故成立)
let injectFs = (name, isTarget, opt = {}) => {
    let orig = fs[name]
    let hits = []
    let calls = []
    fs[name] = function(...args) {
        calls.push(args)
        if (isTarget(...args)) {
            hits.push(args)
            if (opt.after) {
                orig.apply(this, args)
            }
            let err = new Error(`${opt.code || 'EIO'}: injected failure of fs.${name}`)
            err.code = opt.code || 'EIO'
            throw err
        }
        return orig.apply(this, args)
    }
    let restore = () => {
        fs[name] = orig
    }
    restore.hits = hits
    restore.calls = calls
    return restore
}

//設定環境變數並回傳還原函數
let setEnv = (kvs) => {
    let old = {}
    for (let k of Object.keys(kvs)) {
        old[k] = process.env[k]
        process.env[k] = kvs[k]
    }
    return () => {
        for (let k of Object.keys(old)) {
            if (old[k] === undefined) {
                delete process.env[k]
            }
            else {
                process.env[k] = old[k]
            }
        }
    }
}


describe('execExportPng', function() {

    after(function() {
        //清除本檔之臨時資料夾, 上層test/_tmp為空時一併移除(非空則保留)
        fs.rmSync(fdBase, { recursive: true, force: true })
        try {
            fs.rmdirSync(path.dirname(fdBase))
        }
        catch (err) {}
    })

    //以本機替代執行檔模擬Tecplot批次模式, 實跑execExportPng之spawn、改名、清除與batch.log擷取(不替身execExportPng之任何接縫); 非Windows或無csc.exe時略過
    describe('以替代執行檔模擬Tecplot', function() {

        let cwd0
        let fpExe
        let fdRun
        let fpLay
        let n = 0

        before(function() {
            this.timeout(60000)
            let fd = path.join(fdBase, 'fake')
            fs.rmSync(fd, { recursive: true, force: true })
            fs.mkdirSync(fd, { recursive: true })
            fpExe = buildFakeTecplot(fd)
            if (!fpExe) {
                this.skip()
            }
            cwd0 = process.cwd()
        })

        beforeEach(function() {
            //每案獨立之cwd(暫存巨集、暫存png與batch.log皆落在cwd)
            n++
            fdRun = path.join(fdBase, 'fake', `run${n}`)
            fs.mkdirSync(fdRun, { recursive: true })
            process.chdir(fdRun)
            fpLay = path.join(fdRun, 'in.lay')
            fs.writeFileSync(fpLay, 'dummy lay', 'utf8')
        })

        afterEach(function() {
            process.chdir(cwd0)
        })

        after(function() {
            if (cwd0) {
                process.chdir(cwd0)
            }
            fs.rmSync(path.join(fdBase, 'fake'), { recursive: true, force: true })
        })

        it('fpOut不存在時產出png(行為不變)', async function() {
            let restore = setEnv({ FAKE_TEC_MODE: 'png' })
            try {
                let fpOut = path.join(fdRun, 'sub', 'a.png') //連同不存在之上層資料夾
                let r = await execExportPng(fpLay, fpOut, { fpExe, widthPic: 200 })
                assert.strict.equal(r, undefined) //spec S1: resolve undefined
                assert.strict.equal(pngWidth(fpOut), 200) //spec S1: 產出至fpOut
                assert.strict.deepEqual(listTemp(fdRun), []) //spec S4: 暫存已清
            }
            finally {
                restore()
            }
        })

        it('fpOut已存在時覆寫為新產出之png(同寬但lay內容改變)', async function() {
            let restore = setEnv({ FAKE_TEC_MODE: 'png' })
            try {
                let fpOut = path.join(fdRun, 'a.png')
                await execExportPng(fpLay, fpOut, { fpExe, widthPic: 200 })
                let h1 = pngHeight(fpOut)
                assert.strict.equal(h1, fs.statSync(fpLay).size)
                fs.writeFileSync(fpLay, 'dummy lay with changed view settings', 'utf8') //改視角後重產至同名png(原使用情境)
                await execExportPng(fpLay, fpOut, { fpExe, widthPic: 200 })
                assert.strict.equal(pngWidth(fpOut), 200)
                assert.strict.equal(pngHeight(fpOut), fs.statSync(fpLay).size) //spec S1; 修前: 改名失敗被忽略, 仍為舊圖且未拋錯
                assert.strict.notEqual(pngHeight(fpOut), h1)
                assert.strict.deepEqual(listTemp(fdRun), []) //spec S4
            }
            finally {
                restore()
            }
        })

        it('fpOut已存在時覆寫為新產出之png(不同寬)', async function() {
            let restore = setEnv({ FAKE_TEC_MODE: 'png' })
            try {
                let fpOut = path.join(fdRun, 'a.png')
                await execExportPng(fpLay, fpOut, { fpExe, widthPic: 200 })
                assert.strict.equal(pngWidth(fpOut), 200)
                await execExportPng(fpLay, fpOut, { fpExe, widthPic: 300 })
                assert.strict.equal(pngWidth(fpOut), 300) //spec S1; 修前: 仍為200且未拋錯
            }
            finally {
                restore()
            }
        })

        it('fpLay與fpOut為相對路徑時, 傳給Tecplot之lay為絕對路徑, 且等待期間cwd改變不影響覆寫之目的檔', async function() {
            let restore = setEnv({ FAKE_TEC_MODE: 'png' })
            let fdOther = path.join(fdBase, 'fake', `other${n}`)
            try {
                fs.mkdirSync(fdOther, { recursive: true })
                fs.writeFileSync(path.join(fdOther, 'rel.png'), 'B-original', 'utf8') //另一資料夾之同名檔不得被動到
                fs.writeFileSync(path.join(fdRun, 'rel.png'), 'A-old', 'utf8') //cwd下之舊檔應被覆寫
                let pm = execExportPng('./in.lay', './rel.png', { fpExe, widthPic: 200 }) //spec S1; 替身檢核傳入之lay為絕對路徑(否則離開碼3)
                process.chdir(fdOther) //execExportPng已spawn並停在await, 此時改cwd
                await pm
                process.chdir(fdRun)
                assert.strict.equal(pngWidth(path.join(fdRun, 'rel.png')), 200) //spec S1: 覆寫之目的檔為呼叫當時cwd下之檔
                assert.strict.equal(fs.readFileSync(path.join(fdOther, 'rel.png'), 'utf8'), 'B-original') //修前: 改cwd後之相對路徑指向他處
                assert.strict.deepEqual(listTemp(fdRun), []) //spec S4
                assert.strict.deepEqual(listTemp(fdOther), [])
            }
            finally {
                process.chdir(fdRun)
                restore()
            }
        })

        it('產出之png無法移至fpOut時throw並清暫存(fpOut為資料夾)', async function() {
            let restore = setEnv({ FAKE_TEC_MODE: 'png' })
            try {
                let fpOut = path.join(fdRun, 'isFolder.png')
                fs.mkdirSync(fpOut)
                await assert.rejects(
                    execExportPng(fpLay, fpOut, { fpExe, widthPic: 200 }),
                    isErrWithPrefix('can not move exported png to fpOut[') //spec S2; 修前: 回報成功
                )
                assert.strict.equal(fs.statSync(fpOut).isDirectory(), true) //資料夾未被動到
                assert.strict.deepEqual(listTemp(fdRun), []) //spec S2, S4: 暫存已清
            }
            finally {
                restore()
            }
        })

        it('舊fpOut被其他程式鎖住無法覆寫時throw並清暫存且舊檔內容不變', async function() {
            this.timeout(30000)
            let fpOut = path.join(fdRun, 'locked.png')
            let fpStop = path.join(fdRun, 'stop.flag')
            let restore = setEnv({ FAKE_TEC_MODE: 'png' })
            let holder = null
            let pmHolder = null
            try {

                //舊圖(寬200)
                await execExportPng(fpLay, fpOut, { fpExe, widthPic: 200 })
                assert.strict.equal(pngWidth(fpOut), 200)

                //另起一個行程以FileShare.None鎖住舊圖, 等其stdout印出locked(以事件同步, 不以延時)
                holder = cp.spawn(fpExe, [], {
                    windowsHide: true,
                    env: { ...process.env, FAKE_TEC_MODE: 'hold', FAKE_TEC_HOLD: fpOut, FAKE_TEC_STOP: fpStop },
                })
                pmHolder = new Promise((resolve) => {
                    holder.on('close', resolve)
                })
                await new Promise((resolve, reject) => {
                    holder.on('error', reject)
                    holder.on('close', () => {
                        reject(new Error('holder exited before locking fpOut'))
                    })
                    holder.stdout.on('data', (d) => {
                        if (String(d).indexOf('locked') >= 0) {
                            resolve()
                        }
                    })
                })

                //鎖住時重產至同名: spec S2
                await assert.rejects(
                    execExportPng(fpLay, fpOut, { fpExe, widthPic: 300 }),
                    (err) => {
                        isErrWithPrefix('can not move exported png to fpOut[')(err) //修前: 回報成功
                        assert.strict.equal(err.message.indexOf('can not overwrite existing file') > 0, true)
                        return true
                    }
                )
                assert.strict.deepEqual(listTemp(fdRun), []) //spec S2, S4

                //解除鎖定後, 舊檔內容仍為寬200(刪除失敗時舊檔未被破壞)
                fs.writeFileSync(fpStop, '', 'utf8')
                await pmHolder
                pmHolder = null
                assert.strict.equal(pngWidth(fpOut), 200)

                //解除鎖定後可再覆寫
                await execExportPng(fpLay, fpOut, { fpExe, widthPic: 300 })
                assert.strict.equal(pngWidth(fpOut), 300)

            }
            finally {
                restore()
                fs.writeFileSync(fpStop, '', 'utf8')
                if (pmHolder) {
                    await pmHolder
                }
            }
        })

        it('步驟1複製失敗(含複製到一半留下殘檔)時throw, 舊fpOut不動, 暫存複本清除', async function() {
            let restore = setEnv({ FAKE_TEC_MODE: 'png' })
            let restoreFs = null
            try {
                let fpOut = path.join(fdRun, 'a.png')
                await execExportPng(fpLay, fpOut, { fpExe, widthPic: 200 })
                restoreFs = injectFs('copyFileSync', (src, tar) => isCopyName(tar), { after: true })
                await assert.rejects(
                    execExportPng(fpLay, fpOut, { fpExe, widthPic: 300 }),
                    (err) => {
                        isErrWithPrefix('can not move exported png to fpOut[')(err) //裁定1: 複製失敗即throw
                        assert.strict.equal(err.message.indexOf('can not copy exported png to') > 0, true)
                        return true
                    }
                )
                assert.strict.equal(restoreFs.hits.length, 1) //注入確實命中一次, 目的為fpOut同資料夾之暫存複本
                assert.strict.equal(path.dirname(restoreFs.hits[0][1]), fdRun)
                assert.strict.equal(isCopyName(restoreFs.hits[0][1]), true)
                restoreFs()
                restoreFs = null
                assert.strict.equal(pngWidth(fpOut), 200) //裁定1: 舊fpOut不動
                assert.strict.deepEqual(listTemp(fdRun), []) //裁定1: 殘檔與暫存複本皆清除
            }
            finally {
                if (restoreFs) {
                    restoreFs()
                }
                restore()
            }
        })

        it('fpOut之上層路徑為檔案而無法複製時throw(不靜默成功)', async function() {
            let restore = setEnv({ FAKE_TEC_MODE: 'png' })
            try {
                let fpFile = path.join(fdRun, 'notFolder')
                fs.writeFileSync(fpFile, 'x', 'utf8')
                await assert.rejects(
                    execExportPng(fpLay, path.join(fpFile, 'a.png'), { fpExe, widthPic: 200 }),
                    isErrWithPrefix('can not move exported png to fpOut[') //裁定1: 複製失敗即throw
                )
                assert.strict.equal(fs.readFileSync(fpFile, 'utf8'), 'x')
                assert.strict.deepEqual(listTemp(fdRun), [])
            }
            finally {
                restore()
            }
        })

        it('步驟3改名失敗而舊檔已刪時, 保留暫存複本(新圖)並於訊息寫明其路徑', async function() {
            let restore = setEnv({ FAKE_TEC_MODE: 'png' })
            let restoreFs = null
            try {
                let fpOut = path.join(fdRun, 'a.png')
                await execExportPng(fpLay, fpOut, { fpExe, widthPic: 200 })
                restoreFs = injectFs('renameSync', (fpOld) => isCopyName(fpOld)) //只讓「暫存複本→fpOut」之改名失敗
                let msg = ''
                await assert.rejects(
                    execExportPng(fpLay, fpOut, { fpExe, widthPic: 300 }),
                    (err) => {
                        isErrWithPrefix('can not move exported png to fpOut[')(err)
                        msg = err.message
                        return true
                    }
                )
                let hits = restoreFs.hits
                restoreFs()
                restoreFs = null
                let m = msg.match(/the exported png is kept at \[(.+)\]$/) //裁定1: 路徑寫入訊息
                assert.strict.notEqual(m, null, `message[${msg}]`)
                let fpKept = m[1]
                assert.strict.equal(hits.length, 1) //注入確實命中一次: 來源為保留之暫存複本、目的為fpOut
                assert.strict.equal(hits[0][0], fpKept)
                assert.strict.equal(hits[0][1], fpOut)
                assert.strict.equal(path.dirname(fpKept), fdRun)
                assert.strict.equal(isCopyName(fpKept), true)
                assert.strict.equal(pngWidth(fpKept), 300) //裁定1: 保留者為新圖
                assert.strict.equal(fs.existsSync(fpOut), false) //舊檔已刪
                assert.strict.deepEqual(listTemp(fdRun), [path.basename(fpKept)]) //cwd暫存已清, 只剩保留之新圖
            }
            finally {
                if (restoreFs) {
                    restoreFs()
                }
                restore()
            }
        })

        it('步驟3改名失敗而無舊檔被刪時(fpOut不存在), 不保留暫存複本', async function() {
            let restore = setEnv({ FAKE_TEC_MODE: 'png' })
            let restoreFs = injectFs('renameSync', (fpOld) => isCopyName(fpOld))
            try {
                let fpOut = path.join(fdRun, 'b.png')
                await assert.rejects(
                    execExportPng(fpLay, fpOut, { fpExe, widthPic: 200 }),
                    (err) => {
                        isErrWithPrefix('can not move exported png to fpOut[')(err)
                        assert.strict.equal(err.message.indexOf('is kept at') < 0, true) //未刪舊檔, 不須保留
                        return true
                    }
                )
                assert.strict.equal(restoreFs.hits.length, 1) //注入確實命中一次
                assert.strict.equal(fs.existsSync(fpOut), false)
                assert.strict.deepEqual(listTemp(fdRun), []) //裁定1: 暫存複本清除
            }
            finally {
                restoreFs()
                restore()
            }
        })

        it('步驟2判斷fpOut是否為檔案時遭他行程競爭(lstat拋ENOENT)仍以搬移前綴throw, 舊檔不動、暫存複本清除', async function() {
            let restore = setEnv({ FAKE_TEC_MODE: 'png' })
            let restoreFs = null
            try {
                let fpOut = path.join(fdRun, 'a.png')
                await execExportPng(fpLay, fpOut, { fpExe, widthPic: 200 })
                restoreFs = injectFs('lstatSync', (p) => p === fpOut, { code: 'ENOENT' }) //fsIsFile於stat成功後lstat時檔案被移走
                await assert.rejects(
                    execExportPng(fpLay, fpOut, { fpExe, widthPic: 300 }),
                    isErrWithPrefix('can not move exported png to fpOut[') //修前(本輪起點版本): lstat之ENOENT直接外拋, 無前綴且暫存複本殘留
                )
                assert.strict.equal(restoreFs.hits.length >= 1, true) //注入確實命中
                restoreFs()
                restoreFs = null
                assert.strict.equal(pngWidth(fpOut), 200) //舊檔不動(視為非檔案而未刪, 步驟3因目的已存在而失敗並清除複本)
                assert.strict.deepEqual(listTemp(fdRun), [])
            }
            finally {
                if (restoreFs) {
                    restoreFs()
                }
                restore()
            }
        })

        it('暫存複本無法清除時, 訊息寫明其路徑與原因', async function() {
            let restore = setEnv({ FAKE_TEC_MODE: 'png' })
            let restoreCopy = null
            let restoreUnlink = null
            try {
                let fpOut = path.join(fdRun, 'a.png')
                restoreCopy = injectFs('copyFileSync', (src, tar) => isCopyName(tar), { after: true }) //複製到一半失敗而留下殘檔
                restoreUnlink = injectFs('unlinkSync', (p) => isCopyName(p)) //且該殘檔無法刪除
                let msg = ''
                await assert.rejects(
                    execExportPng(fpLay, fpOut, { fpExe, widthPic: 200 }),
                    (err) => {
                        isErrWithPrefix('can not move exported png to fpOut[')(err)
                        msg = err.message
                        return true
                    }
                )
                assert.strict.equal(restoreCopy.hits.length, 1)
                assert.strict.equal(restoreUnlink.hits.length >= 1, true)
                restoreCopy()
                restoreCopy = null
                restoreUnlink()
                restoreUnlink = null
                let m = msg.match(/the temporary copy \[(.+)\] could not be removed: /)
                assert.strict.notEqual(m, null, `message[${msg}]`)
                assert.strict.equal(fs.existsSync(m[1]), true) //訊息所指之殘留確實存在
                assert.strict.deepEqual(listTemp(fdRun), [path.basename(m[1])]) //cwd暫存已清, 只剩該殘留
            }
            finally {
                if (restoreCopy) {
                    restoreCopy()
                }
                if (restoreUnlink) {
                    restoreUnlink()
                }
                restore()
            }
        })

        it('fpOut與cwd不同磁碟時(模擬renameSync僅同資料夾可用)仍可覆寫fpOut', async function() {
            let restore = setEnv({ FAKE_TEC_MODE: 'png' })
            let fdOut = path.join(fdBase, 'fake', `outdir${n}`)
            let restoreFs = injectFs('renameSync', (fpOld, fpNew) => path.dirname(path.resolve(fpOld)) !== path.dirname(path.resolve(fpNew)), { code: 'EXDEV' })
            try {
                fs.mkdirSync(fdOut, { recursive: true })
                let fpOut = path.join(fdOut, 'a.png')
                fs.writeFileSync(fpOut, 'old image', 'utf8')
                await execExportPng(fpLay, fpOut, { fpExe, widthPic: 300 }) //修前: 先刪舊檔再改名失敗(EXDEV), 舊檔已失
                assert.strict.equal(pngWidth(fpOut), 300) //裁定1: 以複製再同資料夾改名, 可跨磁碟
                assert.strict.equal(restoreFs.hits.length, 0) //未嘗試任何跨資料夾改名
                assert.strict.equal(restoreFs.calls.length, 1) //只有一次改名: 同資料夾內暫存複本→fpOut
                assert.strict.equal(path.dirname(restoreFs.calls[0][0]), fdOut)
                assert.strict.equal(restoreFs.calls[0][1], fpOut)
                assert.strict.deepEqual(listTemp(fdRun), [])
                assert.strict.deepEqual(listTemp(fdOut), [])
            }
            finally {
                restoreFs()
                restore()
            }
        })

        it('同一cwd同時執行多個execExportPng(同資料夾不同fpOut、不同寬)時, 各自產出正確寬度且互不覆蓋', async function() {
            let fdBarrier = path.join(fdRun, 'barrier')
            fs.mkdirSync(fdBarrier)
            let restore = setEnv({ FAKE_TEC_MODE: 'png', FAKE_TEC_BARRIER: fdBarrier, FAKE_TEC_BARRIER_N: '3' }) //替身於登記數達3才讀巨集、寫png, 使3個呼叫確定重疊
            mock.timers.enable({ apis: ['Date'], now: new Date('2026-01-01T00:00:00+08:00') }) //凍結時間, 秒級時間戳必相同, 不因跨秒而使修前偶然通過
            try {
                let ws = [200, 300, 400]
                let fps = ws.map((w) => path.join(fdRun, `c${w}.png`))
                await Promise.all(ws.map((w, i) => execExportPng(fpLay, fps[i], { fpExe, widthPic: w }))) //裁定2; 修前: 同秒撞名而共用暫存巨集與暫存png, 後到者找不到png或寬度錯
                ws.forEach((w, i) => {
                    assert.strict.equal(pngWidth(fps[i]), w)
                })
                assert.strict.deepEqual(listTemp(fdRun), [])
                assert.strict.equal(fs.readdirSync(fdBarrier).length, 3) //3個替身皆已登記(確實同時存活)
            }
            finally {
                mock.timers.reset()
                restore()
            }
        })

        it('Tecplot未產出png且本次有寫batch.log時訊息附Err開頭之行', async function() {
            let restore = setEnv({ FAKE_TEC_MODE: 'logonly' })
            try {
                let fpOut = path.join(fdRun, 'b.png')
                await assert.rejects(
                    execExportPng(fpLay, fpOut, { fpExe, widthPic: 200 }),
                    (err) => {
                        assert.strict.equal(err instanceof Error, true)
                        //spec S3: 前綴維持, 附本次batch.log之Err行(依序, 以' | '串接), 不含非Err行
                        assert.strict.equal(err.message, `can not export fpOut[${fpOut}], batch.log: Err: Cannot find font input file | Err: second error`) //修前: 只有can not export fpOut[...]
                        return true
                    }
                )
                assert.strict.equal(fs.existsSync(fpOut), false)
                assert.strict.deepEqual(listTemp(fdRun), []) //spec S4
            }
            finally {
                restore()
            }
        })

        it('batch.log於執行前已存在且本次內容被覆寫時, 只附本次之Err行', async function() {
            let restore = setEnv({ FAKE_TEC_MODE: 'logonly' })
            try {
                fs.writeFileSync(path.join(fdRun, 'batch.log'), 'Err: old error of previous run\r\n', 'utf8')
                await assert.rejects(
                    execExportPng(fpLay, path.join(fdRun, 'b.png'), { fpExe, widthPic: 200 }),
                    (err) => {
                        assert.strict.equal(err.message.indexOf('Err: Cannot find font input file | Err: second error') >= 0, true) //spec S3
                        assert.strict.equal(err.message.indexOf('old error') < 0, true) //舊內容已被本次覆寫
                        return true
                    }
                )
            }
            finally {
                restore()
            }
        })

        it('batch.log被覆寫但修改時間未變(僅大小改變)時, 仍視為本次所寫而附Err行', async function() {
            let restore = setEnv({ FAKE_TEC_MODE: 'logsamemtime' })
            try {
                fs.writeFileSync(path.join(fdRun, 'batch.log'), 'Err: old error of previous run, longer than the new content\r\n', 'utf8')
                let fpOut = path.join(fdRun, 'b.png')
                await assert.rejects(
                    execExportPng(fpLay, fpOut, { fpExe, widthPic: 200 }),
                    (err) => {
                        assert.strict.equal(err.message, `can not export fpOut[${fpOut}], batch.log: Err: Cannot find font input file`) //spec S3; 單以修改時間判斷會漏附
                        return true
                    }
                )
            }
            finally {
                restore()
            }
        })

        it('Tecplot未產出png且本次未寫batch.log時, 不附舊batch.log之Err行', async function() {
            let restore = setEnv({ FAKE_TEC_MODE: 'none' })
            try {
                fs.writeFileSync(path.join(fdRun, 'batch.log'), 'Err: old error of previous run\r\n', 'utf8')
                let fpOut = path.join(fdRun, 'b.png')
                await assert.rejects(
                    execExportPng(fpLay, fpOut, { fpExe, widthPic: 200 }),
                    (err) => {
                        assert.strict.equal(err.message, `can not export fpOut[${fpOut}]`) //spec S3: 本次未寫則不附(前綴與格式不變)
                        return true
                    }
                )
            }
            finally {
                restore()
            }
        })

        it('Tecplot未產出png且無batch.log時, 訊息維持can not export fpOut[...]', async function() {
            let restore = setEnv({ FAKE_TEC_MODE: 'none' })
            try {
                let fpOut = path.join(fdRun, 'b.png')
                await assert.rejects(
                    execExportPng(fpLay, fpOut, { fpExe, widthPic: 200 }),
                    (err) => {
                        assert.strict.equal(err.message, `can not export fpOut[${fpOut}]`) //spec S3
                        return true
                    }
                )
                assert.strict.deepEqual(listTemp(fdRun), []) //spec S4
            }
            finally {
                restore()
            }
        })

        it('Tecplot離開碼非0時原樣reject字串並清暫存巨集', async function() {
            let restore = setEnv({ FAKE_TEC_MODE: 'exit1' })
            try {
                await assert.rejects(
                    execExportPng(fpLay, path.join(fdRun, 'b.png'), { fpExe, widthPic: 200 }),
                    (err) => {
                        //execProcess之reject字串原樣(不包成Error、不截斷): code[離開碼]:\n子行程輸出
                        assert.strict.equal(err, 'code[1]:\nfake tecplot failed\r\n')
                        return true
                    }
                )
                assert.strict.deepEqual(listTemp(fdRun), []) //spec S4; 修前: 暫存巨集殘留
            }
            finally {
                restore()
            }
        })

    })

    //須本機有Tecplot 360 2013R1才實跑, 否則略過; 執行檔位置可由環境變數W_MESH_TECPLOT_EXE指定
    describe('以本機Tecplot實跑', function() {

        let fpExe = process.env.W_MESH_TECPLOT_EXE || 'C:\\Program Files\\Tecplot\\Tec360 2013R1\\bin\\tec360.exe'
        let fdRoot = path.join(fdBase, 'real')
        let cwd0
        let fdRun
        let fpLay

        //fixture: 合成之極小網格(virt、orig各1個brick), 以內建mesh範本填入視角
        let mkFixture = (fd) => {
            let brick = (x0, y0, z0, d, m) => {
                let ps = [
                    [x0, y0, z0], [x0 + d, y0, z0], [x0 + d, y0 + d, z0], [x0, y0 + d, z0],
                    [x0, y0, z0 + d / 10], [x0 + d, y0, z0 + d / 10], [x0 + d, y0 + d, z0 + d / 10], [x0, y0 + d, z0 + d / 10],
                ]
                return ps.map((p) => `${p[0]} ${p[1]} ${p[2]} ${m} 0`).join('\n') + '\n1 2 3 4 5 6 7 8\n'
            }
            let dat = 'TITLE = "Mesh" VARIABLES = "X", "Y", "Z", "M", "TYPE"\n'
            dat += 'ZONE T="virt",N=8, E=1, F=fepoint, ET=brick\n' + brick(0, 0, -10, 100, 3)
            dat += 'ZONE T="orig",N=8, E=1, F=fepoint, ET=brick\n' + brick(20, 20, -10, 20, 5)
            fs.writeFileSync(path.join(fd, 'fx.dat'), dat, 'utf8')
            let kp = {
                XDETAIL_RANGEMIN: -5,
                XDETAIL_RANGEMAX: 105,
                XDETAIL_GRSPACING: 20,
                YDETAIL_RANGEMIN: -5,
                YDETAIL_RANGEMAX: 105,
                YDETAIL_GRSPACING: 20,
                ZDETAIL_RANGEMIN: -12,
                ZDETAIL_RANGEMAX: 2,
                ZDETAIL_GRSPACING: 5,
                ROTATEORIGIN_X: 50,
                ROTATEORIGIN_Y: 50,
                ROTATEORIGIN_Z: -5,
                PSIANGLE: 45,
                THETAANGLE: -30,
                ALPHAANGLE: 0,
                VIEWERPOSITION_X: 550,
                VIEWERPOSITION_Y: -816,
                VIEWERPOSITION_Z: 702,
                VIEWWIDTH: 220,
                fn: 'fx.dat',
            }
            let c = fs.readFileSync(path.resolve('./src/_tecplot_simple_mesh.lay.tmp'), 'utf8')
            for (let k of Object.keys(kp)) {
                c = c.replaceAll(`{${k}}`, String(kp[k]))
            }
            let fp = path.join(fd, 'fx.lay')
            fs.writeFileSync(fp, c, 'utf8')
            return fp
        }

        before(function() {
            if (!fs.existsSync(fpExe)) {
                this.skip()
            }
            cwd0 = process.cwd()
            fs.rmSync(fdRoot, { recursive: true, force: true })
            fs.mkdirSync(path.join(fdRoot, 'fx'), { recursive: true })
            fs.mkdirSync(path.join(fdRoot, 'run'), { recursive: true })
            fpLay = mkFixture(path.join(fdRoot, 'fx'))
            fdRun = path.join(fdRoot, 'run')
            process.chdir(fdRun) //暫存巨集、暫存png與Tecplot之batch.log皆落在cwd
        })

        after(function() {
            if (cwd0) {
                process.chdir(cwd0)
                fs.rmSync(fdRoot, { recursive: true, force: true })
            }
        })

        it('fpOut已存在時覆寫', async function() {
            let fpOut = path.join(fdRun, 'a.png')
            await execExportPng(fpLay, fpOut, { fpExe, widthPic: 200 })
            assert.strict.equal(pngWidth(fpOut), 200)
            await execExportPng(fpLay, fpOut, { fpExe, widthPic: 300 })
            assert.strict.equal(pngWidth(fpOut), 300) //修前: 改名失敗被忽略, 仍為200且未拋錯
        })

        it('產出之png無法移至fpOut時throw(fpOut為資料夾)', async function() {
            let fpOut = path.join(fdRun, 'isFolder.png')
            fs.mkdirSync(fpOut)
            await assert.rejects(
                execExportPng(fpLay, fpOut, { fpExe, widthPic: 200 }),
                /can not move exported png to fpOut/ //修前: 回報成功
            )
            assert.strict.deepEqual(listTemp(fdRun), []) //暫存檔已清
        })

        it('Tecplot產圖失敗時訊息附batch.log之錯誤行', async function() {
            let fdNoHome = path.join(fdRoot, 'nohome')
            fs.mkdirSync(fdNoHome, { recursive: true })
            //無字型檔之安裝目錄, Tecplot寫Err: Cannot find font input file
            let restore = setEnv({ TEC_360_2013R1: fdNoHome })
            try {
                await assert.rejects(
                    execExportPng(fpLay, path.join(fdRun, 'b.png'), { fpExe, widthPic: 200 }),
                    /can not export fpOut\[.*\], batch\.log: Err/ //修前: 只有can not export
                )
            }
            finally {
                restore()
            }
        })

    })

})
