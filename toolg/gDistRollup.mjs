// import path from 'path'
import rollupFiles from 'w-package-tools/src/rollupFiles.mjs'


let fdSrc = './src'
let fdTar = './dist'


async function rp() {

    await rollupFiles({ //rollupFiles預設會clean folder
        fns: 'WMeshTecplot.mjs',
        fdSrc,
        fdTar,
        nameDistType: 'kebabCase',
        // bNodePolyfill: true,
        // bMinify: false,
        globals: {
            'path': 'path',
            'fs': 'fs',
            'url': 'url',
        },
        external: [
            'path',
            'fs',
            'url',
        ],
    })
        .catch((err) => {
            console.log(err)
        })

}
rp()
    .catch((err) => {
        console.log(err)
    })

