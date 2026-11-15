# 狀態(現況)

本檔只記現況(各功能做到哪裡、對應之規則帳本條目與測試檔、已知缺口與待辦、最近一次驗證),不寫過程(過程見 `sgud/exp/experience.md`)。接續工作先讀本檔。

最近更新:2026-11-15(Gitea #148 修正輪二:移檔改三步、暫存名唯一;本輪未提交、未發布,版本仍為 package.json 之 1.0.52)。

## 一、功能現況

| 功能 | 檔 | 現況 | 規則帳本 | 測試 |
|---|---|---|---|---|
| 讀取 Tecplot ASCII 檔 | `src/WMeshTecplot.mjs`(readTecplot) | 既有,本輪未動 | 無 | `test/read.test.mjs` 為占位(檔案過大不自動化,恆為 1=1) |
| 輸出 Tecplot ASCII 檔 | `src/WMeshTecplot.mjs`(writeTecplot) | 既有,本輪未動 | 無 | `test/write.test.mjs` 為占位 |
| 柱狀元素轉 brick 節點與元素 | `src/convertColumn.mjs` | 既有,本輪未動 | 無 | 無 |
| lay 套範本另存展示用 lay | `src/convertLay.mjs`、`src/parseViewData.mjs`、`src/parseSliceData.mjs`、`src/_tecplot_simple_*.lay.tmp` | 既有,本輪未動 | 無 | 無 |
| lay 輸出 png(呼叫 Tecplot 批次模式) | `src/execExportPng.mjs` | #148 已修:移至 fpOut 分三步(複製到 fpOut 同資料夾之暫存複本→fpOut 為檔案則刪除→同資料夾內改名),可跨磁碟;步驟 1、2 失敗時舊 fpOut 不動,步驟 3 失敗而舊檔已刪時保留暫存複本並於訊息寫明路徑;失敗訊息附本次 `batch.log` 之 `Err` 行;所有離開路徑清除 cwd 暫存巨集與暫存 png;暫存名含隨機碼,同 cwd 並發不相撞。主入口(`WMeshTecplot`)未匯出此函數,使用端自 `w-mesh-tecplot/src/execExportPng.mjs` 引用 | R-EXPNG-01~07 | `test/api-execExportPng.test.mjs`(替身 20 案本機實跑;真機 3 案須 Tecplot,無則略過) |

## 二、execExportPng 之驗證現況

- 替身 20 案(本機以 csc.exe 編譯替代執行檔,實呼 execExportPng,不替身其內部接縫;系統呼叫失敗以 Node fs 層故障注入製造並斷言注入命中,見 R-EXPNG-05):本輪新增 8 案(步驟 1 複製失敗含殘檔、上層為檔案、步驟 3 失敗保留新圖、步驟 3 失敗不保留、步驟 2 判斷時 lstat 競爭、暫存複本無法清除、模擬跨磁碟、同 cwd 並發),對本輪起點版本 7 紅(上層為檔案一案為護欄,本就綠)、修後 20 綠;對修後原始碼之 8 種變異(去掉保留暫存複本、去掉唯一碼、去掉複製殘檔清除、去掉步驟 2 失敗之複本清除、無條件保留複本、步驟 3 改回由 cwd 暫存 png 改名、`isFileSafe` 改回 `fsIsFile`、`rmCopy` 不回報)與前輪 6 種變異(去掉「本次是否寫入」判斷、去掉刪舊檔、忽略改名錯誤、去掉 `fpLay` 絕對化、`moveToOut` 改用未固定之 `fpOut`、去掉 size 比較)皆使至少 1 案轉紅。
- 並發案穩定度(替身以 barrier 使 3 個呼叫確定重疊、凍結 `Date` 使秒級時間戳必相同):修後 10/10 綠;本輪起點版本 0/5 綠、去掉唯一碼之變異 0/5 綠。
- 真機 3 案(`W_MESH_TECPLOT_EXE` 指定或預設安裝路徑存在才跑):**未在有 Tecplot 之機器實跑過本庫版本**;其夾具(範本佔位符 19 項加 `fn`)已靜態核對、並以替身執行檔跑過前 2 案之夾具產生與流程。第 3 案(`TEC_360_2013R1` 指向空資料夾)只能真機驗。發布後由主控於 Gitea 請提出端以 Tecplot 實跑。
- 全套(2026-11-15):`npm test` 22 passing、3 pending(替身 20 案 + 既有 read/write 占位 2 案;3 pending 為上述真機案)。

## 三、已知缺口與待辦

- `batch.log` 由 Tecplot 寫於呼叫端 cwd(成功時亦然):主控裁定維持現況(README 已註明);若日後要根治,方案 A(私有工作夾)須先於有 Tecplot 之機器驗證 lay 內相對資料路徑不受 cwd 影響,見 R-EXPNG-06。
- 並發時 `batch.log` 仍共用,「本次是否寫入」為啟發式(mtime 或 size 變動),可能誤附他次之 `Err` 行(只影響訊息);README 已註明。
- CI(Ubuntu)上替身組與真機組皆略過;替身目前僅 Windows(csc.exe)。若要於 CI 實跑,需另寫 shell 替身(spawn 可直接執行含 shebang 之腳本),本輪無 Linux 環境可驗,未做。
- Tecplot 離開碼 0 但留下空檔或不完整 png:仍視為成功並覆寫舊圖(需求未要求驗 png 完整性)。
- 跨磁碟以模擬(`renameSync` 僅同資料夾可用)驗證;真實跨磁碟本 VM 無第二磁碟,未實測。
- 步驟 2 刪舊檔成功而步驟 3 改名失敗(例如環境異常)時舊檔已失,但新圖保留於暫存複本、路徑在訊息中。
- `batch.log` 若為 Tecplot 附加寫入(而非覆寫),舊執行之 `Err` 行會一併附入訊息(未驗證,無 Tecplot)。
- 暫存名之唯一性以隨機碼(62 字元集 8 碼,`Math.random`,無排他建立與撞名重試)為機率保證,跨行程未另起行程測;`fpOut` 恰等於本次暫存路徑或 cwd 之 `batch.log` 之極端輸入未處理(外審提出,輸入不現實)。
- 一律先複製,於同磁碟且空間或配額不足以容納第二份 png 時,可能比修前之同磁碟直接改名多一種失敗(主控裁定之設計取捨)。
- 非字串 `fpOut`:數字、null、undefined、空字串以搬移前綴 throw;`Symbol`、`new String` 等契約外輸入不一定有前綴(修前即然)。
