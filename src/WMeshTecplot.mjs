import fs from 'fs'
import get from 'lodash-es/get.js'
import each from 'lodash-es/each.js'
import size from 'lodash-es/size.js'
import join from 'lodash-es/join.js'
import isestr from 'wsemi/src/isestr.mjs'
import iseobj from 'wsemi/src/iseobj.mjs'
import isearr from 'wsemi/src/isearr.mjs'


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
 * @param {Object|Array} mnes 輸入數據物件或陣列，輸入物件須包含name、nodes、eles，輸入陣列時則各元素為物件(name、nodes、eles)
 * @param {Object} [opt={}] 輸入設定物件，預設{}
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
async function writeTecplot(mnes, fpOut, opt = {}) {

    //check
    if (!iseobj(mnes) && isearr(mnes)) {
        throw new Error(`mnes is not an effective object or array`)
    }
    if (iseobj(mnes)) {
        mnes = [mnes]
    }

    //core
    let core = (name, nodes, eles) => {

        //nd
        let nd = size(nodes)
        // console.log('nd', nd)

        //ne
        let ne = size(eles)
        // console.log('ne', ne)

        //c
        let c = ''

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

        return c
    }

    //head
    let head = `TITLE = "Mesh" VARIABLES = "X", "Y", "Z", "M"`

    //ct
    let ct = head + '\n'
    each(mnes, (v) => {

        //name
        let name = get(v, 'name', '')
        if (!isestr(name)) {
            throw new Error(`invalid name`)
        }

        //nodes
        let nodes = get(v, 'nodes', [])
        if (!isearr(nodes)) {
            throw new Error(`nodes is not an effective array`)
        }

        //eles
        let eles = get(v, 'eles', [])
        if (!isearr(eles)) {
            throw new Error(`eles is not an effective array`)
        }

        //core
        let c = core(name, nodes, eles)

        //merge
        ct += c + '\n'

    })

    //writeFileSync
    fs.writeFileSync(fpOut, ct, 'utf8')

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
