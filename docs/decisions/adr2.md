# ADR2 – Entry Layer and Backend Framework

**Title:** Use NestJS for Entry Layer and Backend.

**Status:** Accepted  

**Context:**   
- Allowed options:
    Entry Layer: NestJS (TypeScript/Node.js) or Express.  
    Backend: NestJS (TypeScript/Node.js).
- NestJS provides a built-in component based structure, and continues the usage of TypeScript support.  
- Express is often more flexible, but requires more manual setup for controllers, validation, and testing.  
- A large determining factor is that choosing NestJS with TypeScript consistently at the entry layer and backend ensures fewer context switches.  

**Decision:**
We will use NestJS and TypeScript for the Entry Layer and Backend Framework.  

**Consequences:**  
- ✅ Consistent use of TypeScript across Frontend, Entry Layer and Backend.
- ✅ Provides a set framework structure that makes the codebase easier to navigate.  
- ✅ Built-in validation, testing, and modular organization to speed up development.  
- ✅ Strong long-term maintainability.  

- ❌ Steeper learning curve than Express.  
- ❌ Provided framework means less flexibility.  
- ❌ Slower initial setup due to framework conventions.  