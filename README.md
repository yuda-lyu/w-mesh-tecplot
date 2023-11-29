# w-mesh-tecplot
A tool for Tecplot data.

![language](https://img.shields.io/badge/language-JavaScript-orange.svg) 
[![npm version](http://img.shields.io/npm/v/w-mesh-tecplot.svg?style=flat)](https://npmjs.org/package/w-mesh-tecplot) 
[![license](https://img.shields.io/npm/l/w-mesh-tecplot.svg?style=flat)](https://npmjs.org/package/w-mesh-tecplot) 
[![gzip file size](http://img.badgesize.io/yuda-lyu/w-mesh-tecplot/master/dist/w-mesh-tecplot.umd.js.svg?compression=gzip)](https://github.com/yuda-lyu/w-mesh-tecplot)
[![npm download](https://img.shields.io/npm/dt/w-mesh-tecplot.svg)](https://npmjs.org/package/w-mesh-tecplot) 
[![jsdelivr download](https://img.shields.io/jsdelivr/npm/hm/w-mesh-tecplot.svg)](https://www.jsdelivr.com/package/npm/w-mesh-tecplot)

## Documentation
To view documentation or get support, visit [docs](https://yuda-lyu.github.io/w-mesh-tecplot/global.html).

## Installation
### Using npm(ES6 module):
> **Note:** w-mesh-tecplot is mainly dependent on `lodash` and `wsemi`.
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
