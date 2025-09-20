# ADR1 Frontend Framework

**Title:** Use TypeScript with React for Frontend Framework

**Status:** Accepted  

**Context:** 
- Allowed options: JavaScript or TypeScript, with either next.js or React.
- Some team members are familiar with React.
- React's architecture is component based which suits the incremental planning steps for this project.  
- TypeScript offers improved maintainability through type saftey, which reduces runime errors and allows safer refactoring.  
- Next.js offers server-side rendering, which is not a priority for this classroom booking project, the booking tool instead focuses on internal authenticated users.  

**Decision:** 
Use TypeScript with React for frontend framework.    

**Consequences:**  
- ✅ Reduces training time for team members already familiar with React's usage.
- ✅ Large set of reusable libraries to increase development speed.
- ✅ TypeScript improves maintainability and reduces errors.  
- ✅ Component reuse will make future iterations smoother.
- ✅ Pairs well with Vitest, our testing tool of choice.  

- ❌ Steep learning curve for unfamiliar memebers.
- ❌ Vast selection of librart components may muddle development options, requires more coordination from the team. 
- ❌ Does not include built-in routing (requires setup with a library components; eg. React Router).
