import fs from 'fs'
import get from 'lodash-es/get.js'
import each from 'lodash-es/each.js'
import sep from 'wsemi/src/sep.mjs'


/**
 * 走訪Tecplot的lay內slice區段之每個可移植數值(切片起訖點座標與中間切片數)，對每個值呼叫回調函數
 *
 * @param {Array} vs 輸入lay逐行字串陣列
 * @param {Function} fun 輸入回調函數，簽章為fun(key, k, val)，key如'SLICE2_START_X'或'SLICE2_NUMINTER'，k為該數值所在行索引，val為trim後字串
 * @example
 *
 * eachSliceValue(vs, (key, k, val) => { ... })
 *
 */
//座標塊結構: keyword在k, { 在k+1, X/Y/Z在k+2/k+3/k+4 (與parseViewData之prXYZ同構)
let eachSliceValue = (vs, fun) => {

    let g = 0
    each(vs, (v, k) => {

        //切片群組起始, 記住組號
        let m = v.match(/^\$!SLICEATTRIBUTES\s+(\d+)/)
        if (m) {
            g = parseInt(m[1], 10)
            return
        }

        //離開slice區段
        if (v.indexOf('$!SLICELAYERS') >= 0) {
            g = 0
            return
        }
        if (g === 0) {
            return
        }

        let t = v.trim()

        //三種座標塊(PRIMARY/START/END)
        let pos = ''
        if (t === 'PRIMARYPOSITION') {
            pos = 'PRIMARY'
        }
        else if (t === 'STARTPOSITION') {
            pos = 'START'
        }
        else if (t === 'ENDPOSITION') {
            pos = 'END'
        }
        if (pos !== '') {
            each(['X', 'Y', 'Z'], (ax, i) => {
                let li = k + 2 + i
                let lv = get(vs, li, '')
                if (lv.indexOf(`${ax} = `) >= 0) {
                    fun(`SLICE${g}_${pos}_${ax}`, li, get(sep(lv, '='), 1, '').trim())
                }
            })
            return
        }

        //中間切片數
        if (t.indexOf('NUMINTERMEDIATESLICES = ') === 0) {
            fun(`SLICE${g}_NUMINTER`, k, get(sep(v, '='), 1, '').trim())

        }

    })

}


/**
 * 解析Tecplot的lay，提取slice切片起訖點座標與中間切片數
 *
 * 容錯設計：僅回傳實際解析到的鍵，來源lay未設定者不納入(與parseViewData之嚴格throw不同)。
 *
 * @param {String} fpLay 輸入Tecplot的lay檔案位置字串
 * @return {Object} 回傳切片設定物件，各值為trim後字串，鍵如SLICE2_START_X、SLICE2_NUMINTER
 * @example
 *
 * let kpSlice = parseSliceData('./ttt.lay')
 * // => { SLICE1_START_X: '251615.668889', ..., SLICE2_NUMINTER: '3' }
 *
 */
let parseSliceData = (fpLay) => {
    let c = fs.readFileSync(fpLay, 'utf8')
    let vs = sep(c, '\n')
    let r = {}
    eachSliceValue(vs, (key, k, val) => {
        r[key] = val
    })
    return r
}


export {
    eachSliceValue
}
export default parseSliceData
