const resolve = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const typescript = require('@rollup/plugin-typescript');
const { default: dts } = require('rollup-plugin-dts');
const copy = require( 'rollup-plugin-copy');

const packageJson = require('./package.json');

module.exports = [
  {
    input: 'src/index.ts',
    output: [
      {
        file: packageJson.main,
        format: 'cjs',
        sourcemap: true,
      },
      {
        file: packageJson.module,
        format: 'esm',
        sourcemap: true,
      },
    ],
    plugins: [
      resolve(),
      commonjs(),
      typescript({ tsconfig: './tsconfig.json', sourceMap: false }),
      copy({
        targets: [{ src: 'src/scripts/gtag.js', dest: 'dist/mwa-analytics/scripts' }]
      })
    ]
  },
  {
    input: 'dist/mwa-analytics/esm/types/index.d.ts',
    output: [
      { file: 'dist/mwa-analytics/index.d.ts', format: 'esm' }
    ],
    plugins: [dts()]
  }
]
