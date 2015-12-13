Code structure
---------------

- dist/ contains all built files, include es6 jsx-> JS files.
- local dev: copies over to dist/ via watcher
- prod: copies over, bundles + regenerates

tasks:
- generateIndexFile
- watch
- libs. This hardly changes so a single task to always bundle seems ok.
