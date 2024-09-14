import fs from 'fs'
import wmt from './src/WMeshTecplot.mjs'


let fpIn = './_mesh/mesh.json'
let fpOut = './_mesh/cv2tecplot.dat'
let name = 'cv2tecplot'

console.log('reading...')
let j = fs.readFileSync(fpIn, 'utf8')
let m = JSON.parse(j)
m = {
    ...m,
    name,
}
// console.log('m', m)

console.log('writing...')
wmt.writeTecplot(m, fpOut)
    .then((r) => {
        console.log('finish.')
    })
    .catch((err) => {
        console.log(err)
    })

//node --no-warnings --max-old-space-size=120000 g.write.mjs
