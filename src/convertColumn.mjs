import get from 'lodash-es/get.js'
import each from 'lodash-es/each.js'


function convertColumn(name, eles) {

    //ns, es
    let ns = []
    let es = []

    //addNode
    let addNode = (_n) => {
        let x = get(_n, 0, 0)
        let y = get(_n, 1, 0)
        let z = get(_n, 2, 0)
        let mat = get(_n, 3, 0)
        let type = get(_n, 4, 0)
        let n = {
            x,
            y,
            z,
            mat,
            type,
        }
        ns.push(n)
        return ns.length
    }

    //addEle
    let addEle = (ele) => {

        //params
        let xc = get(ele, 'x', 0)
        let yc = get(ele, 'y', 0)
        let zc = get(ele, 'z', 0)
        let dx = get(ele, 'dx', 0)
        let dy = get(ele, 'dy', 0)
        let dz = get(ele, 'dz', 0)
        let mat = get(ele, 'mat', 0)
        let type = get(ele, 'type', 0)

        //min and max
        let xmin = xc - dx / 2
        let xmax = xc + dx / 2
        let ymin = yc - dy / 2
        let ymax = yc + dy / 2
        let zmin = zc - dz / 2
        let zmax = zc + dz / 2

        //n and ind, 皆預設提供mat與type
        let n1 = [xmin, ymin, zmin, mat, type]
        let ind1 = addNode(n1)
        let n2 = [xmax, ymin, zmin, mat, type]
        let ind2 = addNode(n2)
        let n3 = [xmax, ymax, zmin, mat, type]
        let ind3 = addNode(n3)
        let n4 = [xmin, ymax, zmin, mat, type]
        let ind4 = addNode(n4)
        let n5 = [xmin, ymin, zmax, mat, type]
        let ind5 = addNode(n5)
        let n6 = [xmax, ymin, zmax, mat, type]
        let ind6 = addNode(n6)
        let n7 = [xmax, ymax, zmax, mat, type]
        let ind7 = addNode(n7)
        let n8 = [xmin, ymax, zmax, mat, type]
        let ind8 = addNode(n8)

        //nodes
        let nodes = [ind1, ind2, ind3, ind4, ind5, ind6, ind7, ind8]

        //push
        es.push({
            nodes,
            mat,
            type,
        })

    }

    //addEle
    each(eles, (ele) => {
        addEle(ele)
    })

    return {
        name,
        nodes: ns,
        eles: es,
    }
}


export default convertColumn
