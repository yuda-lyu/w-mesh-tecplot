import path from 'path'
import fs from 'fs'
import get from 'lodash-es/get.js'
import trim from 'lodash-es/trim.js'
import isestr from 'wsemi/src/isestr.mjs'
import isnum from 'wsemi/src/isnum.mjs'
import now2strp from 'wsemi/src/now2strp.mjs'
import execProcess from 'wsemi/src/execProcess.mjs'
import fsIsFile from 'wsemi/src/fsIsFile.mjs'
import fsRenameFile from 'wsemi/src/fsRenameFile.mjs'
import fsDeleteFile from 'wsemi/src/fsDeleteFile.mjs'


let execExportPng = async(fpLay, fpOut, opt = {}) => {
    //呼叫Tecplot執行檔, 執行巨集(*.mcr), 藉此輸出(export)圖png

    //d
    let head = get(opt, 'head', '')
    if (!isestr(head)) {
        head = `#!MC 1400`
    }

    //fpExe
    let fpExe = get(opt, 'fpExe', '')
    if (!isestr(fpExe)) {
        fpExe = `C:\\Program Files\\Tecplot\\Tec360 2013R1\\bin\\tec360.exe`
    }
    if (!fsIsFile(fpExe)) {
        throw new Error(`opt.fpExe[${fpExe}] does not exist`)
    }

    //widthPic
    let widthPic = get(opt, 'widthPic')
    if (!isnum(widthPic)) {
        widthPic = 1000
    }

    //fpLay
    fpLay = path.resolve(fpLay)

    //fpTempPng
    let fpTempPng = `./_tecplot_pic_${now2strp()}.png`
    fpTempPng = path.resolve(fpTempPng)

    //fpTempMcr
    let fpTempMcr = `./_tecplot_export_${now2strp()}.mcr`
    fpTempMcr = path.resolve(fpTempMcr)

    if (true) {

        let t = `
        
${head}
# Created by Tecplot

$!EXPORTSETUP EXPORTFORMAT = PNG
$!EXPORTSETUP IMAGEWIDTH = ${widthPic}
$!EXPORTSETUP EXPORTFNAME = '${fpTempPng}'
$!EXPORT 
  EXPORTREGION = CURRENTFRAME

        `
        t = trim(t) //head要放第一列, 故需要trim

        fs.writeFileSync(fpTempMcr, t, 'utf8')

    }

    //execProcess
    let prog = fpExe
    let args = ['-b', fpLay, '-p', fpTempMcr]
    await execProcess(prog, args) //預設spawn

    //b
    let b = fsIsFile(fpTempPng)

    //fsRenameFile
    if (b) {
        fsRenameFile(fpTempPng, fpOut)
    }

    //fsDeleteFile
    fsDeleteFile(fpTempPng)
    fsDeleteFile(fpTempMcr)

    //check
    if (!b) {
        throw new Error(`can not export fpOut[${fpOut}]`)
    }

}


export default execExportPng
