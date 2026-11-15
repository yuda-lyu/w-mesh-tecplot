# 規則帳本

本檔為套件設計與開發階段之規則帳本,為要求程式碼須長成什麼樣,或由規格產出之測試(項目/說明/流程)有哪些,包含軸、單一擁有者、已知限制、破壞性變更紀錄,以及對應是哪些測試檔案或指令等,由agent自行編列、擴充與維護.

## execExportPng(Gitea #148)

需求出處:使用端於重產展示圖時發現(Gitea #148)。覆寫為使用者裁定(重產至同名 png 為常見用法),不採「已存在即拋錯」。wsemi 之 `fsRenameFile` 於目的檔已存在時回 error 而不改名,屬 wsemi 設計,不改、不繞。

### R-EXPNG-01 fpOut 為檔案時覆寫,移檔分三步、結果必檢查(主控裁定,2026-11-15)

- 規則:產出之 png(位於 cwd)移至 fpOut 時,因 wsemi `fsRenameFile` 以 `fs.renameSync` 改名(Windows 跨磁碟必失敗)且目的檔已存在時回 error 不改名,分三步,每步回傳之 `error` 皆須檢查:
  1. 以 wsemi `fsCopyFile` 複製到 fpOut 同資料夾之暫存複本 `_tecplot_out_<id>.png`(上層資料夾不存在時由 `fsCopyFile` 建立,維持「上層資料夾自動建立」);失敗即 throw、清除可能之殘檔,舊 fpOut 不動。
  2. fpOut 為檔案則 `fsDeleteFile`(覆寫);失敗即 throw、清除暫存複本,舊 fpOut 不動。
  3. 同資料夾內 `fsRenameFile` 暫存複本 → fpOut;失敗即 throw:**舊檔已於步驟 2 刪除者保留暫存複本(新圖)並把其路徑寫入訊息(`the exported png is kept at [<路徑>]`,置於訊息末)**;舊檔未被刪者(fpOut 不存在、為資料夾等)清除暫存複本。
  步驟 2 之「fpOut 是否為檔案」以 `isFileSafe` 判斷:wsemi `fsIsFile` 先 `stat` 再 `lstat`,他行程於兩者之間移走檔案時 `lstat` 拋 ENOENT,視為非檔案,不外拋(否則錯誤無前綴且暫存複本殘留)。暫存複本應清除而清除失敗(`rmCopy` 取得 `fsDeleteFile` 之 error)時,於訊息末寫明 `; the temporary copy [<路徑>] could not be removed: <原因>`。
  所有分支之訊息皆以 `can not move exported png to fpOut[` 開頭。Tecplot 巨集內之匯出路徑維持 cwd 下之暫存 png(fpOut 資料夾可能含非 ASCII 字元,Tecplot 2013 之處理本機無法驗證,不改)。暫存複本之名與 cwd 暫存 png(`_tecplot_pic_`)不同前綴,使 fpOut 位於 cwd 時兩者不相撞。
- 路徑:`fpLay` 與 `fpOut` 於第一次 `await` 前即以 `path.resolve` 固定為絕對路徑(`fpOutAbs`;訊息仍顯示呼叫端給定之字串),`await` 期間 cwd 被改動不得使覆寫(含刪舊檔)落在別的資料夾;`fpOut` 非字串者不 resolve,`moveToOut` 回 `…: fpOut must be a non-empty string` 而 throw。
- 盤點:`rg -n "fsCopyFile\(|fsRenameFile\(|fsDeleteFile\(|path.resolve\(" src/execExportPng.mjs`
- 站點全集:`src/execExportPng.mjs` 之 `moveToOut`:複製 1 處、刪舊檔 1 處、改名 1 處(皆用 `fpOutAbs`)——已套 3/3;`moveToOut` 內另有 3 處 `fsDeleteFile(fpCopy)` 為暫存複本之清除(步驟 1 失敗、步驟 2 失敗、步驟 3 失敗且舊檔未刪);`execExportPng` 之 `finally` 內 2 處為 cwd 暫存之清除(見 R-EXPNG-03)。
- 狀態:已套。
- 未涵蓋(依 wsemi 原始碼推演,未測):`fpOut` 為符號連結——指向既有檔者 `fsIsFile` 判為非檔案,步驟 3 因目的已存在而 throw(不覆寫連結目標);懸空連結由底層 rename 取代連結本身;FIFO/socket 等特殊檔被 `fsIsFile` 判為檔案而會被覆寫(Windows 上無此類檔,不處理)。真實跨磁碟(本 VM 僅單一磁碟)以模擬 `renameSync` 僅同資料夾可用(EXDEV)驗證。
- 測試(`test/api-execExportPng.test.mjs`):「fpOut不存在時產出png(行為不變)」「fpOut已存在時覆寫為新產出之png(同寬但lay內容改變)」「…(不同寬)」「fpLay與fpOut為相對路徑時…cwd改變不影響覆寫之目的檔」「產出之png無法移至fpOut時throw並清暫存(fpOut為資料夾)」「舊fpOut被其他程式鎖住無法覆寫時throw並清暫存且舊檔內容不變」(步驟 2,真實鎖檔)「步驟1複製失敗(含複製到一半留下殘檔)時throw…」「fpOut之上層路徑為檔案而無法複製時throw」「步驟3改名失敗而舊檔已刪時,保留暫存複本…」「步驟3改名失敗而無舊檔被刪時…不保留暫存複本」「步驟2判斷fpOut是否為檔案時遭他行程競爭(lstat拋ENOENT)仍以搬移前綴throw…」「暫存複本無法清除時, 訊息寫明其路徑與原因」「fpOut與cwd不同磁碟時(模擬renameSync僅同資料夾可用)仍可覆寫fpOut」;真機同名 2 案。

### R-EXPNG-02 失敗訊息之前綴契約

- 規則:Tecplot 未產出 png → `Error`,訊息以 `can not export fpOut[<fpOut>]` 開頭(此前綴為既有契約,不得改);產出之 png 無法移入 → `Error`,訊息以 `can not move exported png to fpOut[` 開頭;Tecplot 啟動失敗或離開碼非 0 → 原樣 reject `execProcess` 回傳之字串(`spawn[...]:`、`code[N]:`),不包成 Error。
- 盤點:`rg -n "can not export|can not move|throw " src/execExportPng.mjs`
- 狀態:已套。
- 測試:同檔「Tecplot未產出png…」4 案與「Tecplot離開碼非0時…」(斷言完整字串 `code[1]:\nfake tecplot failed\r\n`)。

### R-EXPNG-03 暫存巨集與暫存 png 於所有離開路徑清除

- 規則:`_tecplot_export_*.mcr` 與 `_tecplot_pic_*.png`(皆於 cwd)於成功、未產出、無法移入、`execProcess` reject、巨集寫入失敗皆須清除;巨集之寫入與清除皆在同一 `try/finally` 內。同資料夾暫存複本 `_tecplot_out_*.png` 之清除見 R-EXPNG-01(唯一保留者:步驟 3 失敗而舊檔已刪,其路徑在錯誤訊息中)。清除為盡力而為(`fsDeleteFile` 之 error 不外拋,被鎖住時殘留,與修前相同)。
- 盤點:`rg -n "fpTempPng|fpTempMcr" src/execExportPng.mjs`;判準:`writeFileSync(fpTempMcr` 位於 `try` 內,`fsDeleteFile(fpTempPng)`、`fsDeleteFile(fpTempMcr)` 位於 `finally` 內。
- 狀態:已套(修前 `execProcess` reject 時巨集殘留)。
- 測試:同檔各案之 `listTemp` 斷言;「Tecplot離開碼非0時…」為修前紅。巨集部分寫入失敗之路徑未測(無法穩定製造)。

### R-EXPNG-04 失敗訊息附 batch.log 之 Err 行

- 規則:未產出 png 時,若本次執行有寫 cwd 之 `batch.log`,訊息尾附 `, batch.log: ` 與該檔以 `Err` 開頭之行(去前後空白,以 ` | ` 串接);「本次有寫」判準為執行前後 `mtimeMs` 或 `size` 任一不同(或執行前不存在而現存在);本次未寫則不附(舊內容之錯誤不得附入)。`batch.log` 路徑於呼叫初始以 `path.resolve('./batch.log')` 定下,不隨 await 期間 cwd 變動。
- 殘餘:同毫秒且同大小之覆寫漏附(只影響訊息);若 Tecplot 以附加方式寫入,舊 `Err` 行會一併附入(未驗證)。
- 盤點:`rg -n "batch.log|statFile|getErrOfBatchLog" src/execExportPng.mjs`
- 狀態:已套。
- 測試:同檔「…本次有寫batch.log時訊息附Err開頭之行」「batch.log於執行前已存在且本次內容被覆寫時…」「batch.log被覆寫但修改時間未變(僅大小改變)時…」(替身 `logsamemtime` 模式,隔離 size 比較)「…本次未寫batch.log時,不附舊batch.log之Err行」「…無batch.log時…」;真機第 3 案。

### R-EXPNG-05 測試不下載執行檔;無 Tecplot 時以本機替身實跑

- 規則:本庫測試不下載任何執行檔;替身找得到 csc.exe 而編譯失敗時須 throw(測試轉紅),不得當成略過;替身檢核引數為 `-b <絕對路徑且存在之lay> -p <mcr>`(傳相對路徑或漏旗標時離開碼 3)。`execExportPng` 以 `spawn`(不經 shell)啟動 `fpExe -b <lay> -p <mcr>`,Windows 上 node 無法當替身(`node -b` 回 bad option),`.cmd/.bat` 在 spawn 不經 shell 時 node 拒絕(EINVAL);故以本機 .NET Framework 之 `csc.exe` 編譯一支小替身(`test/tools/fakeTecplot.mjs`),依環境變數 `FAKE_TEC_MODE` 模擬 Tecplot 批次模式之可觀察行為。非 Windows 或無 csc 時該組略過。真機案以 `W_MESH_TECPLOT_EXE` 或預設安裝路徑判斷是否略過。
- 測試之臨時檔放 `test/_tmp/api-execExportPng/`,`after` 清除(上層 `test/_tmp` 為空時一併移除)。
- 無法以真實環境穩定製造之系統呼叫失敗(複製失敗、複製到一半留殘檔、步驟 3 改名失敗、跨磁碟 EXDEV),以「Node fs 層之故障注入」製造:測試暫時改寫 `fs.copyFileSync`/`fs.renameSync`(wsemi 與本函數皆以同一 `fs` 物件於呼叫時取用),只讓符合條件(檔名前綴 `_tecplot_out_`、或新舊路徑不同資料夾)之呼叫失敗,其餘委派原函數,`finally` 還原;`execExportPng`、`moveToOut`、wsemi 皆走真實路徑,不替身任何套件內部接縫。注入函數記錄 `hits`(被注入失敗之呼叫引數)與 `calls`(該方法全部呼叫),每案須斷言注入確實命中(及命中之來源/目的),避免注入未生效而斷言仍因他故成立(外審 #7)。
- 狀態:已套。

### R-EXPNG-06 `batch.log` 位置(主控裁定維持現況,2026-11-15)

- 現況:Tecplot 批次模式把 `batch.log` 寫於 spawn 時之 cwd(即呼叫端 cwd);成功時亦寫,故呼叫端於專案根目錄執行即在根目錄留下此檔。
- 裁定:維持現況(README 已註明),不改。可行改法與代價見 `sgud/exp/experience.md`〈batch.log 位置之分析〉;方案 A(私有工作夾)須先於有 Tecplot 之機器驗證 lay 內相對資料路徑不受 cwd 影響才可實作。
- 狀態:不做(維持現況)。

### R-EXPNG-07 暫存名唯一(主控裁定,2026-11-15)

- 規則:暫存巨集 `_tecplot_export_<id>.mcr`、cwd 暫存 png `_tecplot_pic_<id>.png`、同資料夾暫存複本 `_tecplot_out_<id>.png` 之 `<id>` 為 `now2strp()`(秒級時間戳)加 `_` 與 wsemi `genID(8)`(62 字元集 8 碼,同一秒內碰撞機率約 1/62^8)。同一行程與跨行程(同 cwd)同時呼叫皆不相撞。`batch.log` 於並發時仍共用,「本次是否寫入」之啟發式(R-EXPNG-04)維持,README 已註明。
- 盤點:`rg -n "now2strp\(\)|genID\(" src/execExportPng.mjs`;站點全集:1 處(`id`),已套 1/1;`rg -n "_tecplot_(pic|export|out)_" src/execExportPng.mjs` 之 3 處皆以 `${id}` 組成。
- 狀態:已套。跨行程以隨機碼保證(與行程無關),未另起行程測;同一行程並發以測試證明。
- 殘餘:唯一性為機率保證(隨機碼為 `Math.random`、無排他建立與撞名重試;Windows 檔名大小寫不敏感時同秒兩次碰撞率約 6×10⁻¹³);`fpOut` 恰等於本次暫存路徑(須預測隨機碼)不處理。
- 測試:「同一cwd同時執行多個execExportPng(同資料夾不同fpOut、不同寬)時,各自產出正確寬度且互不覆蓋」——替身以 `FAKE_TEC_BARRIER`(登記數達 3 才讀巨集、寫 png)使 3 個呼叫確定重疊,並以 `mock.timers`(`node:test`)凍結 `Date` 使秒級時間戳必相同,不靠時序;修前 5/5 紅、修後 10/10 綠。
