# ADR2 – Entry Layer and Backend Framework

**Title:** Use NestJS for entry layer and backend

**Status:** Accepted  

**Context:**   
- Allowed options:
    Entry layer: NestJS (TypeScript/Node.js) or Express.  
    Backend: NestJS (TypeScript/Node.js).
- NestJS provides a built-in component-based structure, and continues the usage of TypeScript support.  
- Express is often more flexible, but requires more manual setup for controllers, validation, and testing.  
- A large determining factor is that choosing NestJS with TypeScript consistently at the entry layer and backend ensures fewer context switches.  

**Decision:**
We will use NestJS and TypeScript for the entry layer and backend framework.  

**Consequences:**  
- ✅ Consistent use of TypeScript across frontend, entry layer and backend.
- ✅ Provides a set framework structure that makes the codebase easier to navigate.  
- ✅ Built-in validation, testing, and modular organization to speed up development.  
- ✅ Strong long-term maintainability.  

- ❌ Steeper learning curve than Express.  
- ❌ Provided framework means less flexibility.  
- ❌ Slower initial setup due to framework conventions.  