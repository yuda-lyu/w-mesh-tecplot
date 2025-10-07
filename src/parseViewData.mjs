import fs from 'fs'
import get from 'lodash-es/get.js'
import each from 'lodash-es/each.js'
import isestr from 'wsemi/src/isestr.mjs'
import isnum from 'wsemi/src/isnum.mjs'
import sep from 'wsemi/src/sep.mjs'
import strleft from 'wsemi/src/strleft.mjs'


let parseViewData = (fpLay) => {
    //解析Tecplot的lay, 提取展示有關之視角與模型設定

    let c = fs.readFileSync(fpLay, 'utf8')
    // console.log('c', c)

    let vs = sep(c, '\n')

    // 1212 XDETAIL
    // > RANGEMIN
    // > RANGEMAX
    //     RANGEMIN = 159817.88602534533
    //     RANGEMAX = 205356.40393181637
    let XDETAIL_RANGEMIN = ''
    let XDETAIL_RANGEMAX = ''
    let XDETAIL_GRSPACING = ''

    // 1229 YDETAIL
    // > RANGEMIN
    // > RANGEMAX
    //     RANGEMIN = 2574735.1261037174
    //     RANGEMAX = 2616753.0523926793
    let YDETAIL_RANGEMIN = ''
    let YDETAIL_RANGEMAX = ''
    let YDETAIL_GRSPACING = ''

    // 1246 ZDETAIL
    // > RANGEMIN
    // > RANGEMAX
    // > GRSPACING
    //     RANGEMIN = -97.900000000000006
    //     RANGEMAX = 141.90000000000001
    //     GRSPACING = 200
    let ZDETAIL_RANGEMIN = ''
    let ZDETAIL_RANGEMAX = ''
    let ZDETAIL_GRSPACING = ''

    // 1817 ROTATEORIGIN
    // > X
    // > Y
    // > Z
    //     X = 182587.1449785809
    //     Y = 2595744.089248198
    //     Z = 22
    let ROTATEORIGIN_X = ''
    let ROTATEORIGIN_Y = ''
    let ROTATEORIGIN_Z = ''

    // 1845 VIEWERPOSITION
    // > X
    // > Y
    // > Z
    //     X = 270910.659136992
    //     Y = 2355777.253922889
    //     Z = 8604.826640145473
    let VIEWERPOSITION_X = ''
    let VIEWERPOSITION_Y = ''
    let VIEWERPOSITION_Z = ''

    // PSIANGLE = 60.2371
    let PSIANGLE = ''

    // THETAANGLE = -24.4741
    let THETAANGLE = ''

    // ALPHAANGLE = -1.00689E-020
    let ALPHAANGLE = ''

    // 1851 VIEWWIDTH
    //     VIEWWIDTH = 71875.7
    let VIEWWIDTH = ''

    let prMinMaxSpac = (vs, k) => {
        let cmin = ''
        let cmax = ''
        let cspac = ''
        //下2行須為RANGEMIN, 下3行須為RANGEMAX, 下4行須為GRSPACING
        let l2 = get(vs, k + 2, '')
        let l3 = get(vs, k + 3, '')
        let l4 = get(vs, k + 4, '')
        let b2 = l2.indexOf('RANGEMIN = ') >= 0
        let b3 = l3.indexOf('RANGEMAX = ') >= 0
        let b4 = l4.indexOf('GRSPACING = ') >= 0
        if (b2 && b3 && b4) {
            let ss2 = sep(l2, '=')
            let ss3 = sep(l3, '=')
            let ss4 = sep(l4, '=')
            cmin = get(ss2, 1, '')
            cmax = get(ss3, 1, '')
            cspac = get(ss4, 1, '')
        }
        return {
            b: isestr(cmin) && isestr(cmax) && isestr(cspac),
            cmin,
            cmax,
            cspac,
        }
    }

    let prXYZ = (vs, k) => {
        let cx = ''
        let cy = ''
        let cz = ''
        //下2行須為X, 下3行須為Y, 下4行須為Z
        let l2 = get(vs, k + 2, '')
        let l3 = get(vs, k + 3, '')
        let l4 = get(vs, k + 4, '')
        let b2 = l2.indexOf('X = ') >= 0
        let b3 = l3.indexOf('Y = ') >= 0
        let b4 = l4.indexOf('Z = ') >= 0
        if (b2 && b3 && b4) {
            let ss2 = sep(l2, '=')
            let ss3 = sep(l3, '=')
            let ss4 = sep(l4, '=')
            cx = get(ss2, 1, '')
            cy = get(ss3, 1, '')
            cz = get(ss4, 1, '')
        }
        return {
            b: isestr(cx) && isestr(cy) && isestr(cz),
            cx,
            cy,
            cz,
        }
    }

    each(vs, (v, k) => {
        // console.log(k, v)

        if (v === 'XDETAIL') {
            let r = prMinMaxSpac(vs, k)
            if (r.b) {
                XDETAIL_RANGEMIN = r.cmin
                XDETAIL_RANGEMAX = r.cmax
                XDETAIL_GRSPACING = r.cspac
            }
        }

        if (v === 'YDETAIL') {
            let r = prMinMaxSpac(vs, k)
            if (r.b) {
                YDETAIL_RANGEMIN = r.cmin
                YDETAIL_RANGEMAX = r.cmax
                YDETAIL_GRSPACING = r.cspac
            }
        }

        if (v === 'ZDETAIL') {
            let r = prMinMaxSpac(vs, k)
            if (r.b) {
                ZDETAIL_RANGEMIN = r.cmin
                ZDETAIL_RANGEMAX = r.cmax
                ZDETAIL_GRSPACING = r.cspac
            }
        }

        if (v === 'ROTATEORIGIN') {
            let r = prXYZ(vs, k)
            if (r.b) {
                ROTATEORIGIN_X = r.cx
                ROTATEORIGIN_Y = r.cy
                ROTATEORIGIN_Z = r.cz
                // console.log('ROTATEORIGIN_X', ROTATEORIGIN_X)
                // console.log('ROTATEORIGIN_Y', ROTATEORIGIN_Y)
                // console.log('ROTATEORIGIN_Z', ROTATEORIGIN_Z)
            }
        }

        if (v === 'VIEWERPOSITION') {
            let r = prXYZ(vs, k)
            if (r.b) {
                VIEWERPOSITION_X = r.cx
                VIEWERPOSITION_Y = r.cy
                VIEWERPOSITION_Z = r.cz
                // console.log('VIEWERPOSITION_X', VIEWERPOSITION_X)
                // console.log('VIEWERPOSITION_Y', VIEWERPOSITION_Y)
                // console.log('VIEWERPOSITION_Z', VIEWERPOSITION_Z)
            }
        }

        if (strleft(v, 8) === 'PSIANGLE') {
            let ss = sep(v, '=')
            PSIANGLE = get(ss, 1, '')
        }

        if (strleft(v, 10) === 'THETAANGLE') {
            let ss = sep(v, '=')
            THETAANGLE = get(ss, 1, '')
        }

        if (strleft(v, 10) === 'ALPHAANGLE') {
            let ss = sep(v, '=')
            ALPHAANGLE = get(ss, 1, '')
        }

        if (strleft(v, 9) === 'VIEWWIDTH') {
            let ss = sep(v, '=')
            VIEWWIDTH = get(ss, 1, '')
        }

    })

    let r = {
        XDETAIL_RANGEMIN,
        XDETAIL_RANGEMAX,
        XDETAIL_GRSPACING,
        YDETAIL_RANGEMIN,
        YDETAIL_RANGEMAX,
        YDETAIL_GRSPACING,
        ZDETAIL_RANGEMIN,
        ZDETAIL_RANGEMAX,
        ZDETAIL_GRSPACING,
        ROTATEORIGIN_X,
        ROTATEORIGIN_Y,
        ROTATEORIGIN_Z,
        PSIANGLE,
        THETAANGLE,
        ALPHAANGLE,
        VIEWERPOSITION_X,
        VIEWERPOSITION_Y,
        VIEWERPOSITION_Z,
        VIEWWIDTH,
    }

    each(r, (v, k) => {
        if (!isnum(v)) {
            throw new Error(`invalid ${k}[${v}]`)
        }
    })

    return r
}


export default parseViewData
