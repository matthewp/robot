---
"robot3": patch
---

Fix syntax error in state function type definition that caused TypeScript compilation failures. The previous change had a missing space in a conditional type expression, breaking type inference for state transitions.
