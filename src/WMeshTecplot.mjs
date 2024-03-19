import fs from 'fs'
import get from 'lodash-es/get'
import each from 'lodash-es/each'
import size from 'lodash-es/size'
import join from 'lodash-es/join'


/**
 * 讀取Tecplot的ASCII檔
 *
 * @param {String} fp 輸入檔案位置字串
 * @return {Promise} 回傳Promise，resolve回傳ltdt(各數據列為物件陣列)，reject回傳錯誤訊息
 * @example
 *

 *
 */
async function readTecplot(fpDat, name, fpOut) {

    console.log('尚待開發')

    return null
}


/**
 * 輸出數據至Tecplot檔案
 *
 * @param {String} fp 輸入檔案位置字串
 * @param {Array} data 輸入數據陣列，為mat或ltdt格式
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {String} [opt.mode='ltdt'] 輸入數據格式字串，可選ltdt或mat，預設ltdt
 * @param {Array} [opt.keys=[]] 輸入指定欲輸出鍵值陣列，預設[]
 * @param {Object} [opt.kphead={}] 輸入指定鍵值轉換物件，預設{}
 * @return {Promise} 回傳Promise，resolve回傳成功訊息，reject回傳錯誤訊息
 * @example
 *
 * let nodes = [...]
 * let eles = [...]
 *
 * console.log('writing...')
 * wmt.writeTecplot(name, nodes, eles, fpOut)
 *     .then((r) => {
 *         console.log('finish.')
 *     })
 *     .catch((err) => {
 *         console.log(err)
 *     })
 *
 */
async function writeTecplot(name, nodes, eles, fpOut, opt = {}) {

    //head
    let head = `TITLE = "Mesh" VARIABLES = "X", "Y", "Z", "M"`

    //c
    let c = head + '\n'

    //nd
    let nd = size(nodes)
    // console.log('nd', nd)

    //ne
    let ne = size(eles)
    // console.log('ne', ne)

    //h
    let h = `ZONE T="${name}",N=${nd}, E=${ne}, F=fepoint, ET=brick`
    c += h + '\n'

    each(nodes, (node) => {
        let vs = [
            get(node, 'x', 0),
            get(node, 'y', 0),
            get(node, 'z', 0),
            get(node, 'mat', 0),
            // v1,
            // v2,
            // v3,
        ]
        let t = join(vs, ' ')
        c += t + '\n'
    })

    each(eles, (ele) => {
        let vs = ele.nodes
        let t = join(vs, ' ')
        c += t + '\n'
    })

    //writeFileSync
    fs.writeFileSync(fpOut, c, 'utf8')

    return null
}

/**
 * 讀寫Tecplot的ASCII檔檔
 *
 * @return {Object} 回傳物件，其內有readTecplot與writeTecplot函式
 * @example
 *

 *
 */
let WMeshTecplot = {
    readTecplot,
    writeTecplot,
}


export default WMeshTecplot
