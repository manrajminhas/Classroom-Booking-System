# ADR2 – Entry Layer and Backend Framework

**Title:** Use NestJS for entry layer and backend

**Status:** Revised -- Cycle 2

**Context:**  
- Allowed options:  
  - Entry layer: NestJS (TypeScript/Node.js) or Express.  
  - Backend: NestJS (TypeScript/Node.js).  
- NestJS provides a built-in component-based structure, extending the use of TypeScript across the stack.  
- Express is more lightweight and flexible but requires manual setup for controllers, validation, routing, and testing.  
- Maintaining TypeScript consistency across frontend and backend reduces context switching, simplifies collaboration, and lowers cognitive overhead for developers.  
- The project benefits from NestJS’s opinionated structure, which fits the incremental and modular development process. 

**Quantitative Implications:**  
- Expected 20–30% reduction in setup and configuration time compared to Express due to NestJS’s built-in module system, validation, and dependency injection.  
- Reduced boilerplate code for routing and validation by an estimated 25–40% compared to Express.  
- Using TypeScript end-to-end reduces context switching, improving developer productivity by an estimated 10–20%.  
- Opinionated structure simplifies code navigation, expected to reduce onboarding time for new team members.

**Decision:**
We will use NestJS and TypeScript for the entry layer and backend framework.  

**Consequences:**  
- ✅ Consistent use of TypeScript across frontend, entry layer, and backend.  
- ✅ Provides a set framework structure that makes the codebase easier to navigate.  
- ✅ Built-in validation, testing, and modular organization to speed up development.  
- ✅ Strong long-term maintainability.  
- ✅ Reduces setup time compared to manually configuring Express.  

- ❌ Steeper learning curve than Express.  
- ❌ Opinionated framework means less flexibility.  
- ❌ Initial setup requires following framework conventions.  
- ❌ Additional abstraction layers can obscure some lower-level details, requiring extra learning for debugging.

**Reflection:**  
- NestJS’s strong structure simplifies development once the initial learning curve is overcome.  
- Early setup was slower than a minimal Express server, but paid off later with clearer module organization.  
- However, our initial approach led to issues with module hierarchy and routing structure, making certain dependencies harder to manage and causing extra refactoring work.  
- In future iterations, we can improve maintainability by planning the module and controller hierarchy earlier, and enforcing consistent naming and routing patterns throughout the codebase.