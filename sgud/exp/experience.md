# 累積經驗

本檔為執行工作時特有之累積經驗,留給後續之嘗試、執行與判斷,由agent自行編列、擴充與維護.

## execExportPng(Gitea #148,2026-11-15)

### 本機無 Tecplot 時,如何實跑 execExportPng 之測試

- `execExportPng` 經 wsemi `execProcess` 以 `spawn`(`shell:false`)啟動 `fpExe -b <lay> -p <mcr>`,故替身必須是可直接 spawn 之原生執行檔,且能吃 `-b` 開頭之引數。實測(2026-11-15,本機 Node 24):
  - `node -b x -p y` 回 `bad option: -b`(離開碼 9),node 不能當替身。
  - `spawnSync('x.cmd', [...], { shell: false })` 回 `EINVAL`(Node 對 `.cmd/.bat` 之安全限制),不能用。
  - Git for Windows 之 `bash.exe -b <lay> -p <mcr>` 可把 lay 當腳本跑(實測輸出 `args: -p b`),但依賴 Git 安裝位置,且 `where bash` 可能先命中 WSL 之 `System32\bash.exe`,不採。
  - **採用**:以本機 .NET Framework 之 `C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe` 編譯約 60 行 C# 小程式(`test/tools/fakeTecplot.mjs`,編譯約 1 秒;csc 為 C# 5,不可用字串內插)。不下載任何執行檔;非 Windows 或無 csc 時該組略過。
- 替身依環境變數 `FAKE_TEC_MODE` 變行為,環境變數於呼叫 `execExportPng` 前設於 `process.env`(spawn 預設繼承 `process.env`),測完還原。替身寫之 png 僅含 33 位元組檔頭(IHDR 之寬為巨集之 `IMAGEWIDTH`),測試只讀 `readUInt32BE(16)`。
- 「舊圖被其他程式鎖住」:node 以 `FILE_SHARE_DELETE` 開檔,自己鎖不住自己(實測:`fs.openSync` 開著之檔可被 `unlinkSync` 刪除;設唯讀屬性 `chmod 0o444` 之檔亦可被 `unlinkSync` 刪除)。須另起一個行程以 `FileShare.None` 開檔(替身之 `hold` 模式),以其 stdout 之 `locked` 事件同步、以停止旗標檔收尾。
- mocha `--parallel` 之 worker 為子行程,測試內可 `process.chdir`(`execExportPng` 之暫存巨集、暫存 png、Tecplot 之 `batch.log` 皆相對於 cwd);每案使用獨立 cwd 資料夾,`afterEach` 與 `after` 皆還原 cwd。

### 以 fs 層故障注入製造「真實環境難以穩定造出」之系統呼叫失敗

「刪舊檔成功而改名失敗」「複製到一半留下殘檔」「跨磁碟(EXDEV)」在單一磁碟、單執行緒之同步區段內無法以真實環境穩定造出(目的檔之刪除與改名之間於同步區段內無處可插入動作;鎖檔〔FileShare.None〕只能擋住刪除,使步驟 2 失敗,擋不了「刪除成功之後」之改名;至於他行程以允許刪除之共用模式持有時,刪除後名稱是否立即可再用,實測僅確認 node 自己開著之檔可被 `unlink` 且其後 `existsSync` 為 false,對 Windows 刪檔語意之其餘推論未驗證)。可行作法:測試暫時改寫 `fs.copyFileSync`、`fs.renameSync`——wsemi 之 `fsCopyFile`/`fsRenameFile` 與本函數皆以同一個 `fs` 預設匯出物件於呼叫時取用屬性,故改寫有效;包裝函數只對符合條件之呼叫(目的檔名前綴 `_tecplot_out_`、或新舊路徑不同資料夾)拋錯,其餘委派原函數,`finally` 還原。整條路徑(`execExportPng` → `moveToOut` → wsemi → `fs`)仍為真實,只有最末端系統呼叫之結果被改變;mocha `--parallel` 之 worker 為獨立行程,不影響他檔。`opt.after` 為真時先真實執行再拋錯,用於模擬「複製到一半失敗而留下殘檔」。

### 並發測試

`Promise.all` 同時呼叫 3 次(同 cwd、同資料夾、不同 fpOut 與不同寬)即可重現秒級時間戳撞名(三個呼叫於同一同步時段內寫巨集並啟動替身,後寫者之巨集覆蓋前者,替身讀到同一寬度)。第一版測試修前 5/5 紅,但外審指出不是確定性(三次 spawn 可能跨秒界、替身可能於下一個替身寫巨集前已讀完而偶然通過);改為:替身以 `FAKE_TEC_BARRIER`(資料夾)與 `FAKE_TEC_BARRIER_N` 於登記數達 N 才讀巨集、寫 png,使 N 個呼叫確定同時存活;以 `node:test` 之 `mock.timers.enable({ apis: ['Date'], now })` 凍結 `Date`(wsemi `now2strp` 之 dayjs 取用 `new Date()`),使秒級時間戳必相同;結束 `mock.timers.reset()`。替身寫 `batch.log` 須吞 IOException(同 cwd 並發時兩個替身會同時寫此檔,與實際 Tecplot 相同共用),否則替身因寫檔衝突離開碼非 0 而使測試假紅。

### 修前紅之取得(不 stash、不 checkout)

`git archive HEAD src/execExportPng.mjs | tar -x -C ./tmp/<案名>/pre`,連同新測試與 `test/tools` 複製到同一目錄樹,於 repo 根以 `npx mocha --no-parallel tmp/<案名>/pre/test/<檔>` 跑(`./tmp` 位於 repo 內,`node_modules` 由上層解析,不需目錄連結)。變異驗證同法:複製修後原始碼到 `./tmp/<案名>/m1` 等,以 Edit 改一處後跑。

### 設計取捨

- 覆寫之移檔:第一版(tec148)採「先刪舊檔、再用 wsemi `fsRenameFile` 改名」,缺點是 `fsRenameFile` 以 `renameSync` 改名而 Windows 跨磁碟必失敗,失敗時舊檔已先被刪(修前為靜默不產出,第一版變成先刪舊檔再失敗)。主控裁定(tec148b)改為三步:①`fsCopyFile` 複製到 fpOut 同資料夾之暫存複本 `_tecplot_out_<id>.png`(上層資料夾不存在時 `fsCopyFile` 自動建立);②fpOut 為檔案則刪除;③同資料夾內 `fsRenameFile` 暫存複本 → fpOut。失敗處置:①②失敗舊檔不動並清暫存複本;③失敗而舊檔已刪者保留暫存複本(新圖)並把路徑寫進訊息,未刪者清除複本。保留 wsemi 之公開介面,不以 `fs.renameSync` 繞過其不覆寫設計。暫存複本不可與 cwd 暫存 png 同名(fpOut 位於 cwd 時會相撞),故前綴用 `_tecplot_out_`。
- 刪舊檔失敗(被鎖住)時舊檔內容不變,已有測試。
- `batch.log` 「是否本次所寫」以前後 `mtimeMs` 與 `size` 判斷,比建議檔草案(僅 mtime)多防同毫秒覆寫但大小不同之情形。無法排除:同毫秒且同大小之覆寫(只影響訊息);Tecplot 若以附加方式寫入則舊 `Err` 行會一併附入(無 Tecplot,未驗證)。
- `try/finally` 使 `execProcess` reject(Tecplot 啟動失敗、離開碼非 0)時亦清暫存巨集;reject 值(字串)原樣向外傳,不改包成 Error,以免改變既有呼叫端之判斷。

### batch.log 位置之分析(R-EXPNG-06,供主控裁定,未實作)

現況:Tecplot 批次模式把 `batch.log` 寫於 spawn 時之 cwd,成功時亦寫。可行改法:

| 方案 | 作法 | 好處 | 代價與風險 |
|---|---|---|---|
| A 私有工作夾 | 呼叫 `execProcess(prog, args, { cwd: <私有夾> })`(wsemi `execProcess` 已支援 `opt.cwd`),結束後讀該夾之 `batch.log` 並整夾刪除 | 呼叫端 cwd 不再留 `batch.log`;可確定為本次所寫,免去 mtime/size 啟發式與附加寫入之疑慮 | 改變 Tecplot 之 cwd:若 lay 內相對路徑(資料檔)以 cwd 解析則既有呼叫端會壞(無 Tecplot 無法驗證;建議檔之真機測試把 lay 與資料檔放在 cwd 以外之夾,僅能間接顯示以 lay 位置解析,但空畫面亦可能匯出 png,證據不足);多一個夾之建立與清除(需 finally 清除);暫存巨集與暫存 png 是否一併移入需決定;對「不得改變」之 `opt`/`fpOut` 行為無影響但屬行為變更,須真機驗證後才可上 |
| B 成功後清除自建之 batch.log | 執行前不存在、執行後存在者,讀完 `Err` 行後刪除 | 改動小;根目錄不留檔 | 隱藏 Tecplot 之診斷輸出(成功時之警告亦消失);同 cwd 並發之他行程剛建立之 `batch.log` 可能被誤刪;只解決「新建」不解決「已存在被覆寫」 |
| C 維持現況 | README 已註明 `batch.log` 寫於 cwd | 零風險 | 呼叫端須自行以 cwd 管理(例如先 `process.chdir` 至專用夾) |

建議:先採 C(已於 README 註明);要根治再採 A,但須在有 Tecplot 之機器先驗證「lay 內相對資料檔不受 cwd 影響」後才實作。
