# w-mesh-tecplot
A tool for Tecplot data.

![language](https://img.shields.io/badge/language-JavaScript-orange.svg) 
[![npm version](http://img.shields.io/npm/v/w-mesh-tecplot.svg?style=flat)](https://npmjs.org/package/w-mesh-tecplot) 
[![license](https://img.shields.io/npm/l/w-mesh-tecplot.svg?style=flat)](https://npmjs.org/package/w-mesh-tecplot) 
[![npm download](https://img.shields.io/npm/dt/w-mesh-tecplot.svg)](https://npmjs.org/package/w-mesh-tecplot) 
[![npm download](https://img.shields.io/npm/dm/w-mesh-tecplot.svg)](https://npmjs.org/package/w-mesh-tecplot) 
[![jsdelivr download](https://img.shields.io/jsdelivr/npm/hm/w-mesh-tecplot.svg)](https://www.jsdelivr.com/package/npm/w-mesh-tecplot)

## Documentation
To view documentation or get support, visit [docs](https://yuda-lyu.github.io/w-mesh-tecplot/global.html).

## Installation

### Using npm(ES6 module):
```alias
npm i w-mesh-tecplot
```

#### Example for read:
> **Link:** [[dev source code](https://github.com/yuda-lyu/w-mesh-tecplot/blob/master/g-read.mjs)]
```alias
尚待開發
```

#### Example for write:
> **Link:** [[dev source code](https://github.com/yuda-lyu/w-mesh-tecplot/blob/master/g-write.mjs)]
```alias
import fs from 'fs'
import wmt from './src/WMeshTecplot.mjs'

let fpIn = './_mesh/mesh.json'
let fpOut = './_mesh/cv2tecplot.dat'
let name = 'cv2tecplot'

console.log('reading...')
let j = fs.readFileSync(fpIn, 'utf8')
let m = JSON.parse(j)
// console.log('m', m)

console.log('writing...')
wmt.writeTecplot(name, m.nodes, m.eles, fpOut)
    .then((r) => {
        console.log('finish.')
    })
    .catch((err) => {
        console.log(err)
    })
```

#### Example for export png:
`execExportPng` runs Tecplot in batch mode to export a `.lay` file as a png. It is not exported by the main entry, import it from `src`.
```alias
import execExportPng from 'w-mesh-tecplot/src/execExportPng.mjs'

//opt.fpExe defaults to 'C:\\Program Files\\Tecplot\\Tec360 2013R1\\bin\\tec360.exe'
await execExportPng('./ttt.lay', './out.png', { widthPic: 1000 })
```
- The exported png is moved to `fpOut` in three steps, so `fpOut` may be on another drive than the working directory: (1) copy it to a temporary copy `_tecplot_out_*.png` in the folder of `fpOut` (the folder is created if missing); (2) delete the old `fpOut` if it is a file (overwrite); (3) rename the temporary copy to `fpOut` inside that folder.
- If the exported png cannot be moved to `fpOut` it throws an error starting with `can not move exported png to fpOut[`. If step (1) or (2) fails (for example the old file is locked by another program), the old `fpOut` is left untouched and the temporary copy is removed. If step (3) fails (for example `fpOut` is a folder) the temporary copy is removed too, except when the old file has already been deleted in step (2): then the temporary copy (the new image) is kept and its path is given at the end of the message (`the exported png is kept at [...]`). If a temporary copy that should be removed cannot be removed, its path and the reason are appended to the message (`the temporary copy [...] could not be removed: ...`).
- `fpOut` (and `fpLay`) given as relative paths are resolved against the working directory at the time of the call.
- If Tecplot exits normally (exit code 0) but does not produce the png, it throws an error starting with `can not export fpOut[`. Tecplot batch mode writes its error reason to `batch.log` in the current working directory (on success too); when `batch.log` appears to have been written by this run (its modification time or size changed), the lines starting with `Err` are appended to the message as `, batch.log: Err: ...`. This is a heuristic: it cannot tell a write by another process apart, and a rewrite with the same modification time and size is not noticed.
- If Tecplot cannot be started or exits with a non-zero code, the promise rejects with the string returned by `execProcess` (`spawn[...]:` or `code[N]:` followed by the output); `batch.log` is not appended in this case.
- The temporary macro and png (`_tecplot_export_*.mcr`, `_tecplot_pic_*.png`) are created in the current working directory and removed whether the call succeeds or fails. Their names (and that of the temporary copy) contain a timestamp in seconds plus a random code, so several calls may run at the same time in the same working directory; they still share `batch.log` (see above).
- Requirements of Tecplot 360 2013R1 (observed on the machine where this was reported, not checked by this package):
  - The x64 `tec360.exe` needs the Visual C++ 2005 SP1 MFC runtime (manifest `Microsoft.VC80.MFC` 8.0.50727.4053). When it is missing the process cannot start and the promise rejects with a string starting with `spawn[UNKNOWN]:`.
  - The environment variable `TEC_360_2013R1` must be set to the Tecplot installation folder. When it is unset, or points to a folder without the font files, no png is produced and `batch.log` contains `Err: Cannot find font input file`.
