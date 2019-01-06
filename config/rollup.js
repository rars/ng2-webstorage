export default {
  input: 'dist/app.js',
  external: ['@angular/core'],
  output: {
    file: 'bundles/core.umd.js',
    format: 'umd',
    sourceMap: 'inline',
    name: 'ng2Webstorage',
    globals: {
      '@angular/core': 'ng.core'
    }
  }
};
