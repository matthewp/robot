---
"robot3": patch
---

### WHAT: 

Explicitly routing the right place for the index.d.ts file 

### WHY: 

Types fail to load in some scenarios. F.i PNPM throws the error: "There are types at '/xxxx/node_modules/robot3/index.d.ts', but this result could not be resolved when respecting package.json "exports". The 'robot3' library may need to update its package.json or typings."

### HOW:

Added types path for exports in package.json
