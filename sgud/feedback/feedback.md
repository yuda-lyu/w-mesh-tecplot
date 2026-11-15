# 回饋

本檔記任務中發現之自有套件、全域技能、全域設定之調整與抽提提案,只增不改;處置結果另記一列並寫明承接哪一列。

| 日期 | 類別 | 對象 | 內容 | 依據 |
|---|---|---|---|---|
| 2026-11-15 | 全域技能 | role-coder-for-test | 建議新增一節:被測函數以 `spawn`(不經 shell)啟動外部執行檔、而該執行檔(商用軟體)不在本機時,測試之替身作法。Windows 上 `node` 不吃 `-b` 之類引數、`.cmd/.bat` 在 `shell:false` 下被拒(EINVAL),可行作法為以本機 .NET Framework 之 `csc.exe` 編譯小替身並以環境變數控制行為(不下載);鎖檔須由另一行程以 `FileShare.None` 持有(node 以 FILE_SHARE_DELETE 開檔鎖不住自己);另記「修前紅以 `git archive` 解到 `./tmp` 複本、變異以複本加 Edit」之作法 | `test/tools/fakeTecplot.mjs`;`sgud/exp/experience.md`〈本機無 Tecplot 時,如何實跑 execExportPng 之測試〉;`./tmp/quiet-run` 之 `tec148-pre`、`tec148-m1~m3` 紀錄(修前 6 紅 3 綠、各變異各轉紅) |
| 2026-11-15 | 全域技能 | role-coder-for-test(承接上一列) | 同一節再補兩點:①「真實環境難以穩定造出之系統呼叫失敗」(複製失敗、複製到一半留殘檔、刪除成功後之改名失敗、跨磁碟 EXDEV)可於測試內暫時改寫 Node `fs` 預設匯出物件之方法(符合條件才拋錯,其餘委派原函數,finally 還原),被測函數與其依賴套件皆走真實路徑,只改變最末端系統呼叫之結果,不屬替身接縫;②同 cwd 並發之測試以 `Promise.all` 同時呼叫即可確定性重現秒級時間戳撞名,替身寫共用檔須吞寫檔衝突,否則假紅 | `test/api-execExportPng.test.mjs` 之 `injectFs` 與「步驟3改名失敗而舊檔已刪時…」「同一cwd同時執行多個…」;`sgud/exp/experience.md`〈以 fs 層故障注入製造…〉〈並發測試〉;修前 5 紅、並發案修前 0/5 綠修後 10/10 綠 |
| 2026-11-15 | 全域技能 | role-coder-for-test(承接上一列) | 並發測試要「確定性地」修前紅,不能只靠 `Promise.all` 之時序:①以替身之 barrier(各行程於共用資料夾登記,達 N 才繼續)使 N 個呼叫確定同時存活;②以 `node:test` 之 `mock.timers.enable({ apis: ['Date'] })` 凍結時間,使秒級時間戳必相同,免於跨秒界偶然通過;故障注入函數須記錄命中(`hits`/`calls`)並於每案斷言命中,避免注入未生效而斷言因他故成立(外審 terra 指出) | 外審 `tec148b-evidence/review-terra-output.md` #7、#8;`test/api-execExportPng.test.mjs`「同一cwd同時執行多個…」與 `injectFs`;並發案修前 0/5 綠、修後 10/10 綠 |
