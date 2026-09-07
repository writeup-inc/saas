# Source and build

The editable Next.js source is stored in `source/`. Do not edit the exported HTML or `_next/` assets directly.

Build from the repository root:

```sh
cd worklog-insight-taku-sample/source
npm ci
npm run build:saas-pages
rsync -a --delete --exclude source out/ ../
```

The public path is `/saas/worklog-insight-taku-sample/`.
