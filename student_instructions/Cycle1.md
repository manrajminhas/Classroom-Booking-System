# Cycle I

Cycle I consists of a Design and Implementation phase. In the Design phase, you will prep the requirements, high level design choices, and detailed implementation plan for the next phase. In the Implementation phase, you will attempt to follow the plan 

## Key Functionality 
This is a classroom booking tool. Currently the university schedules classrooms manually (this is actually true!). We want to support staff at UVic booking rooms as they need them, rather than centrally. Provide a web/mobile-web application that satisfies the following functional requirements:

1. Staff can view available classrooms and reserve with one click.
2. When two people compete for the same time slot, the system allows only one success and gives the other a clear failure message; no double bookings.
3. Supports cancellation, and rollback/undo when necessary.
4. Everything must run and be verifiable in a Docker container.

You must author your own user stories, requirements document, and architecture decision records (ADRs), then implement and demonstrate based on them.

When we give a functional or non-functional requirement, your project MUST demonstrate this requirement has been satisfied. The easiest way to do this is with acceptance testing guidelines, ideally automated. 

## Data and external APIs
Data: we've provided a CSV file for UVic classrooms. You will likely want to expand on this; adding new data tables or data sources is acceptable. You will also need a way to manage user accounts and roles. 

## Roles & Permissions

Your app MUST contain the following roles: 

- **Staff**: sign in; browse availability; create/cancel own bookings; view own history. 
- **Registrar**: sign in; maintain classrooms/time slots; handle escalation (manual release or block abusive accounts if needed); view statistics/logs; manage schedule integrity. 
- **Admin**: sign in; system-level configuration; view audit records and health; does not intervene in daily bookings. 
    
## Non-functional Requirements

- **Concurrency correctness**: for the same classroom and time slot, there must be exactly one successful booking.  
- **Reasonable responsiveness**: queries and operations should feel smooth in the demo environment (state your target and evidence in your requirements, such as recordings or logs).
- **Documentation available**: provide API documentation (Swagger or equivalent).
- **Portable**: provide a local start command (`docker compose up`) and list default accounts and health check URLs in the README.

## Deployment, CI, Testing
- The application will be deployed using Docker containers. We should be able to run `docker compose` on your repo and have your app start and work including all tests. All requirements and features must be accompanied by a comprehensive test plan. 

## Monolithic Architecture

#### 4.1 Student-side Feature References
- Sign in/out
- Availability search: filter by campus/building/room/date/time slot (with pagination if needed).
- Create/cancel bookings: clear success/failure messages (for example, failure due to time conflict).
- My bookings and history: view personal records; filter by time.

#### 4.2 Registrar Feature References 
- Classroom and time-slot maintenance: open hours, capacity, maintenance windows. 
- Conflict escalation: inspect suspected abuse; manually release holds or block accounts (with audit trail).
- Basic analytics: at least one chart (for example, daily bookings, top N popular rooms).
- Manage schedule integrity: ensure that every room is maximized, so that if a staff member books the room, the room's capacity is maximized (to prevent half full rooms). 

#### 4.3 Admin
- System config and audit: key operation logs (who, when, what) and a basic health page.

## Design I

Describes what should be done in the Design phase of cycle 1. 

### Deliverables

1. requirements, modeled as quality attribute utility tree, with at least 5 scenarios.
2. tradeoff analyses for 3 architecturally significant requirements. 
3. a set of Gitlab user stories as issues, documenting the requirements you will implement.
4. a project plan where the issues from (1) are assigned and given deadlines. 
5. high-level design docs, consisting of architecture sketches
6. tradeoff analyses for 
7. implementation choices and constraints, for the technical approach you will take.
8. a file `Prompts.md` with the prompts used to assist in the work. 

## Implementation I

Take the plan designed in the earlier phase, and implement it. 

### Deliverables

1. Docker container, with running application.
2. User manual if necessary.
3. Source code in repository, as a release (ie. zip file)
4. Commit records for the code
5. Tests for all functionality. 
6. Pull request reviews showing code development and discussion, mapped to issues from Design
7. Document titled "Changes.md" explaining the adaptations required due to incomplete understanding in Design phase.