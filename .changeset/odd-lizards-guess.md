---
"robot3": patch
---

Don't make a state transition if the state is left before the invoked promise resolves, *even* if there's a transition with the same name.
