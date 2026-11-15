import fs from 'fs'
import path from 'path'
import cp from 'child_process'


//替代Tecplot之測試用執行檔(僅Windows, 以本機.NET Framework之csc.exe編譯下方原始碼, 不下載任何執行檔)
//
//execExportPng以spawn(不經shell)呼叫`<fpExe> -b <lay> -p <mcr>`, Tecplot不在本機時, 以此執行檔模擬批次模式之可觀察行為:
//  引數檢核(hold模式除外): 須為`-b <lay之絕對路徑且檔案存在> -p <mcr>`, 否則stderr輸出bad args並以離開碼3結束(用以偵測execExportPng是否傳了相對路徑、漏傳旗標)
//  依環境變數FAKE_TEC_MODE決定行為(於呼叫execExportPng前設定於process.env, 子行程繼承):
//    png(預設): 讀巨集之IMAGEWIDTH與EXPORTFNAME, 於EXPORTFNAME寫出僅含檔頭之假png(IHDR之寬為IMAGEWIDTH, 高為lay檔案位元組數, 使「同寬但lay內容不同」之輸出可區分), 並於cwd寫batch.log(Info行)
//    logonly: 不產出png, 於cwd覆寫batch.log(含Info行與2行Err開頭之行, 例如Err: Cannot find font input file), 離開碼0
//    logsamemtime: 不產出png, 覆寫既有batch.log為不同大小之內容後把修改時間還原為覆寫前(模擬同毫秒覆寫: 修改時間不變而大小改變), 離開碼0
//    none: 不產出png, 不碰batch.log, 離開碼0
//  png模式另可設FAKE_TEC_BARRIER(資料夾)與FAKE_TEC_BARRIER_N: 各替身先於該資料夾登記後, 等到登記數達N才讀巨集與寫png(使N個同時呼叫確定重疊, 不靠時序)
//    exit1: 離開碼1(stderr輸出一行fake tecplot failed)
//    hold: 不依巨集, 以FileShare.None鎖住FAKE_TEC_HOLD所指之檔案並於stdout印出locked, 直到FAKE_TEC_STOP所指之檔案出現才離開(模擬舊圖被其他程式開啟中)
let src = `
using System;
using System.IO;
using System.Text;
using System.Threading;
using System.Text.RegularExpressions;

public class FakeTecplot {
    static int Main(string[] args) {
        string mode = Environment.GetEnvironmentVariable("FAKE_TEC_MODE");
        if (mode == null || mode == "") { mode = "png"; }
        if (mode == "hold") {
            string fpHold = Environment.GetEnvironmentVariable("FAKE_TEC_HOLD");
            string fpStop = Environment.GetEnvironmentVariable("FAKE_TEC_STOP");
            using (FileStream fs = new FileStream(fpHold, FileMode.Open, FileAccess.Read, FileShare.None)) {
                Console.Out.WriteLine("locked");
                Console.Out.Flush();
                while (!File.Exists(fpStop)) { Thread.Sleep(20); }
            }
            return 0;
        }
        if (args.Length != 4 || args[0] != "-b" || !Path.IsPathRooted(args[1]) || !File.Exists(args[1]) || args[2] != "-p") {
            Console.Error.WriteLine("bad args");
            return 3;
        }
        if (mode == "exit1") {
            Console.Error.WriteLine("fake tecplot failed");
            return 1;
        }
        if (mode == "logonly") {
            File.WriteAllText("batch.log", "Info: start\\r\\nErr: Cannot find font input file\\r\\nErr: second error\\r\\n");
            return 0;
        }
        if (mode == "logsamemtime") {
            DateTime t0 = File.GetLastWriteTimeUtc("batch.log");
            File.WriteAllText("batch.log", "Err: Cannot find font input file\\r\\n");
            File.SetLastWriteTimeUtc("batch.log", t0);
            return 0;
        }
        if (mode == "none") {
            return 0;
        }
        string fpBarrier = Environment.GetEnvironmentVariable("FAKE_TEC_BARRIER");
        if (fpBarrier != null && fpBarrier != "") {
            int nBarrier = int.Parse(Environment.GetEnvironmentVariable("FAKE_TEC_BARRIER_N"));
            File.WriteAllText(Path.Combine(fpBarrier, Guid.NewGuid().ToString() + ".started"), "");
            DateTime tEnd = DateTime.UtcNow.AddSeconds(30);
            while (Directory.GetFiles(fpBarrier, "*.started").Length < nBarrier) {
                if (DateTime.UtcNow > tEnd) { Console.Error.WriteLine("barrier timeout"); return 4; }
                Thread.Sleep(10);
            }
        }
        string t = File.ReadAllText(args[3]);
        Match mw = Regex.Match(t, "IMAGEWIDTH = (\\\\d+)");
        Match mf = Regex.Match(t, "EXPORTFNAME = '([^']*)'");
        uint w = uint.Parse(mw.Groups[1].Value);
        uint h = (uint)new FileInfo(args[1]).Length;
        byte[] b = new byte[33];
        byte[] sig = new byte[] { 137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82 };
        Array.Copy(sig, b, sig.Length);
        b[16] = (byte)(w >> 24); b[17] = (byte)(w >> 16); b[18] = (byte)(w >> 8); b[19] = (byte)w;
        b[20] = (byte)(h >> 24); b[21] = (byte)(h >> 16); b[22] = (byte)(h >> 8); b[23] = (byte)h;
        File.WriteAllBytes(mf.Groups[1].Value, b);
        try { File.WriteAllText("batch.log", "Info: ok\\r\\n"); } catch (IOException) { } //同cwd並發時batch.log可能被另一替身寫入中, 與實際Tecplot同樣共用此檔
        return 0;
    }
}
`


/**
 * 編譯替代Tecplot之測試用執行檔
 *
 * @param {String} fd 輸入輸出資料夾(須已存在)
 * @return {String|null} 回傳執行檔絕對路徑；非Windows或找不到csc.exe時回傳null(呼叫端應略過測試)；找得到csc.exe但編譯失敗時throw(替身本身壞了不得被當成略過)
 */
let buildFakeTecplot = (fd) => {
    if (process.platform !== 'win32') {
        return null
    }
    let dirWin = process.env.windir || 'C:\\Windows'
    let csc = ['Framework64', 'Framework']
        .map((v) => path.join(dirWin, 'Microsoft.NET', v, 'v4.0.30319', 'csc.exe'))
        .find((v) => fs.existsSync(v))
    if (!csc) {
        return null
    }
    let fpSrc = path.resolve(fd, 'faketec.cs')
    let fpExe = path.resolve(fd, 'faketec.exe')
    fs.writeFileSync(fpSrc, src, 'utf8')
    try {
        cp.execFileSync(csc, ['/nologo', '/target:exe', `/out:${fpExe}`, fpSrc], { windowsHide: true, stdio: 'pipe' })
    }
    catch (err) {
        throw new Error(`can not compile fake tecplot: ${String(err.stdout || '')}${String(err.stderr || '')}${err.message}`)
    }
    return fpExe
}


export { buildFakeTecplot }
export default buildFakeTecplot
