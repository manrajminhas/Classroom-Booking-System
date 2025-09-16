# Introduction

~~This file specifies the project that students will work on for SENG350.~~
The details are now in the Course repository. 

Schedule is now in the Course "schedule.md" file. 

# Learning Outcomes - Project
- Apply software patterns and architectural styles to solve design problems
- Understand the value of quality attributes and scenarios in testing potential designs
- Analyse architectural approaches using rigorous techniques
- Understand what decisions are the architecturally significant decisions, and which should be left to developers.
- Languages and notations, including the UML, for abstracting design models.

(new)
- Apply AI tools and identify limitations, in order to assist in specificying, implementing and verifying a large software project.
- Leverage collaborative SE tools and processes in a large group to manage deliverables.

# Cadence
2 week design and 2 week implementation cycles, x2  (week break in between?)


# Project Topic
(@ori)
- include aspects of UI, controllers, backend models, backend storage, authentication, REST apis, responsive design

## Potential Topic 1
**Campus Intelligent Classroom Booking System**
| Title  | Content |
| ------ | ------ |
| **Background** | Students often struggle to find an available study room because they can’t tell which classrooms are free, while registrars schedule and adjust classes entirely by hand, making mistakes likely. |
| **Goal Overview** | Develop a web and mobile-friendly site that lets students instantly see which classrooms are free and reserve one with a single click. If two people try to book the same room at the same time, the system automatically decides whose reservation succeeds, notifies the other user of the failure, and shows a clear message. The platform must support real-time bookings across multiple campuses, perform live conflict detection, and provide automatic rollback when a reservation is canceled. |
| **Architecture Plan #1** | **Single-Service Transactional Architecture.**<br>All backend code is packaged into one process, making deployment and debugging the simplest option. Transactional safety – rely on the database’s built-in “all-or-nothing” transactions to guarantee that no two bookings can occupy the same slot.<br><br>**Modules Design**<br>**Frontend**: web pages that display free classrooms and initiate bookings; <br>**Backend**：login, booking, queries, and notifications are all written in the same NestJS project. <br>**Database**：stores all business tables.<br><br>**Tools**<br> Next.js, Tailwind CSS, NestJS, PostgreSQL, nodemailer, REST |
| **Architecture Plan #2**   | Read-Write Splitting Architecture<br>Separate “write operations” and “read operations” into different services or database layers, allowing read requests to scale horizontally.<br><br>**Module Design**<br>**Frontend**: Web interface to display available classrooms and initiate bookings; calls only the BFF / API Gateway without directly connecting to backend services; uses WebSocket to update room availability status.<br><br>**BFF / API Gateway**: Receives all requests and routes them to either the read or write service; handles authentication; throttling.<br><br>**Write Service**: Creates and cancels bookings; connects only to the primary database; uses database transactions and constraints to enforce “no overlap”; after the transaction completes, publishes events to Redis (pub/sub or queue).<br><br>**Read Service**: Checks Redis cache first; if there is a cache miss, queries the read-only database; subscribes to events for **cache invalidation/refresh**; exposes read APIs.<br><br>**Synchronization Task**: Consumes write events to update caches and trigger notifications.<br><br>**Mail Service**: Consumes “BookingCreated/Cancelled/Failed” events to send e-mails/push notifications. |
| Architecture Plan 2 – Technology Stack | **Frontend**<br>Framework: Next.js + React / Vue + Vite<br>UI: Tailwind CSS / Ant Design<br>Request: axios / fetch API<br>Status: TanStack Query<br>Form Validation: Yup / Zod<br><br>**API Gateway**<br>Framework: Spring Boot<br>API Documentation: SpringDoc OpenAPI / Swagger<br>Authentication: Spring Security + JWT / Keycloak<br>WebSocket: Spring WebFlux<br><br>**Write Service / Read Service**<br>Framework: Spring Boot<br>ORM: Hibernate / Spring Data JPA / MyBatis Plus<br>Database Pool: HikariCP<br>Async Tasks: Spring Boot Task / Spring Integration<br><br>**Database**<br>Database: PostgreSQL<br>Replication: pglogical<br><br>**Cache / Queue**<br>Cache: Redis<br>Message Queue: RabbitMQ / Kafka<br><br>**Email Service**<br>Library: Jakarta Mail<br>Local Debugging: MailHog<br>Production Email Service: Amazon SES (limited free)<br><br>**Test & Qualification**<br>Test: Jest / Vitest<br>Qualification: ESLint<br><br>**Packaging & Deployment**<br>Build Tool: Maven<br>Container: Docker<br>CI/CD: Jenkins / GitHub Actions (limited free)<br><br>**Monitoring**<br>Metrics: Micrometer + Prometheus<br>Logs: Logback / Log4j2<br>Tracing: OpenTelemetry + Jaeger<br>Dashboard: Grafana |                    
| Architecture Plan 2 – Phase Goals | **Phase #1**<br>Implement the core architecture: Frontend + BFF + Write Service + Read Service + PostgreSQL primary + Redis + MailHog;<br>Implement core features: view classroom status / book classrooms / cancel bookings;<br>Implement “no overlap” constraint in the Write Service;<br>Implement the Read Service to check cache first and fallback to the primary database if needed;<br>Implement JWT login and role-based authorization.<br><br>**Phase #2**<br>Revise Phase #1 based on feedback;<br>Implement a read-only replica (no longer reading from the primary);<br>Implement the complete event flow: Write Service publishes → Read Service/Synchronization Task consumes → precise cache invalidation/rebuild → BFF pushes updates. |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       
| Architecture Plan 2 – Marking Criteria | **Phase #1**<br>“No overlap” constraint verification: with xx concurrent requests to book the same classroom, only one can be confirmed;<br>Reading: within xx seconds after booking creation, the latest classroom status can be queried;<br>Authorization: booking/canceling requires login; students cannot cancel others’ bookings.<br><br>**Phase #2**<br>Reduced read latency.|                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         
| Architecture Plan 2 – Bonus Points | **Phase #1**<br>WebSocket push for “booking success / booking cancellation” to the classroom display list;<br><br>**Phase #2**<br>OAuth login.|
| **Architecture Plan #3** | **Event Sourcing+Microservices Architecture**<br>Event Sourcing: every operation is recorded as an “event” instead of directly updating the final table.<br>Microservices: functionality is split into multiple independent small services that communicate with one another through a message queue.<br><br>**Modules Design**<br>**Frontend**: web interface that displays available classrooms and initiates bookings;<br>**API Gateway**: unified entry point, performs JWT validation;<br>**Booking Write Service**: handles write events only, persisting them to the event store;<br>**Booking Read Service**: subscribes to events and builds the “current state” read model;<br>**Notification Service**: subscribes to events and sends e-mail / push notifications;<br>**Logging and Monitoring**: captures performance metrics and errors;<br>**Message Queue**: connects all services;<br>**Authentication Service**: manages login and role assignments.<br><br>**Tools**<br>Next.js, NestJS, EventStoreBD, Redis, ElasticSearch, nodemailer, Prometheus, Grafana, RabbitMQ, Keycloak, REST. |
| **Rationale for Choosing This Plan** | This topic is closely tied to students’ campus life, like our university library’s online study-room booking system offers similar functionality, making it easy for students to make user stories in the early design phase and to fully consider project requirements.<br>I think microservices is a good stuff to show complex software architectures; they require students to clearly understand the system’s overall functionality, how to split responsibilities among services, and how those services communicate. If microservices are beyond the course’s scope, Architecture Plan 2 is probably a suitable direction, because Plan 1 is fairly basic and can be completed without AI assistance; with AI support, we can take on something more sophisticated and choose Plan 2 or Plan 3. |

## Potential Topic 2
**Course Q&A Community**

| Title | Content |
|---------|------------------|
| **Background** | Students can post the questions they encounter while studying to a central Q&A community where instructors manage questions and answers and track “high-frequency pain points.” |
| **Goal Overview** | A course-specific Q&A platform similar to StackOverflow or Piazza:<br>- Students can post, search, vote, and @-mention peers;<br>- Instructors can pin high-quality answers and view tag statistics;<br>- The system (optionally) recommends similar questions to reduce duplicates. |
| **Architecture & Module Design** | **Main Service + Search Microservice** (read/write split with dedicated search).<br><br>**Modules Design**<br>**Frontend**:course list, community home, question detail, posting, notifications; fully responsive layout.<br>**BFF Gateway**:unified entry, JWT authentication, merges data from microservices into frontend-friendly JSON.<br>**Write Service**:(1) writes to the primary database with transactions; (2) publishes “create/update” events to a queue.<br>**PostgreSQL Primary DB**:guarantees ACID consistency.<br>**Sync Queue**: buffers events that must be indexed by the search service.<br>**Search Microservice**: delivers high-performance search and “similar question” recommendations.<br>**Elasticsearch**: hybrid inverted index + vector index queries.<br>**Notification Service**: turns queue events into e-mails or in-app alerts.<br><br>**Tools**<br>Next.js, Tailwind CSS, NestJS, PostgreSQL, Elasticsearch, Redis, RabbitMQ, Keycloak, REST |
| **Rationale for Choosing This Plan** | 1. Read-heavy, write-light workload. Posting and commenting are infrequent, but “search & browse” traffic is high; full-text search and similar-question recommendations are essential.<br>2. Architecture emphasises query speed, whereas the classroom-booking system focuses first on data consistency and only then on performance.<br>3. The key module here is the Search Microservice (full-text search); in the booking system it is conflict detection.<br>4. Core functionality has higher tolerance for short delays; CRUD logic is simpler; modules are fewer and looser-coupled .<br>5. AI assistance can add more value (e.g., generating Elasticsearch queries), whereas booking-system concurrency logic must be reasoned out by students themselves.<br><br>Overall, this design is simpler than the classroom-booking system in terms of architecture complexity and workload. |

## Potential Topic 3
**Game Tournament Management Platform**
| Title | Contnent |
|---------|------------------|
| **Background** | The university runs casual gaming tournaments, but if registration is handled in Excel, brackets are made manually, and score updates are slow, errors are common. |
| **Goal Overview** | Deliver a real-time, auditable, and scalable tournament platform:<br>1. Players register online and view brackets and leaderboards.<br>2. The system auto-generates match pairings based on the chosen format.<br>3. Referees enter scores, which are pushed to all users instantly.<br>4. Organizers can replay the history of any match. |
| **Architecture & Module Design** | **Event-Driven+Push Channel architecture**<br>Every action is recorded as an event, and multiple services are decoupled via a message queue.<br><br>**Modules Design**<br>**Frontend**: mobile app or web page where users register, view brackets, and see live leaderboards.<br>**API Gateway**: unified entry, authentication, and WebSocket token issuance.<br>**Registration Write Service**: handles sign-ups and score entry; writes to the primary DB and publishes “events.”<br>**Bracket Service**: generates match pairings according to the tournament format and publishes events.<br>**Score Push Service**: broadcasts the newest leaderboard via WebSocket.<br>**Leaderboard Read Service**: reads PostgreSQL views + Redis cache, supplying data for the frontend.<br>**Message Queue**: connects all services and keeps event order.<br>**Authentication Service**: user login with different roles.<br><br>**Tools**<br>Next.js, Tailwind CSS, NestJS, EventStoreDB, message queue, Redis, PostgreSQL, Keycloak, Socket.io, Prometheus, Grafana, K3s, Helm, GitHub Actions, REST + WebSocket |
| **Rationale for Choosing This Plan** | The core challenge is real-time pushing and auditability, so every action is logged as an event, carried over a message queue like a “live broadcast signal,” and then pushed to clients via WebSocket.  <br>Architecturally, its difficulty and fault-tolerance are similar to the classroom-booking system, but the focus differs: booking stresses concurrency control, while this project stresses push delivery and order, which students may need to design themselves.  <br>Because many students may be unfamiliar with tournament workflows, they will likely need preliminary research, or AI assistance to flesh out user stories, making this project more challenging than the booking system. |

## Project for Students
### 1. Project Overview

Provide a web/mobile-web application for the campus that satisfies:
- Students can view available classrooms and reserve with one click.
- When two people compete for the same time slot, the system allows only one success and gives the other a clear failure message; no double bookings.
- Supports multiple campuses, cancellation, and rollback/undo when necessary.
- Everything must run and be verifiable in a demo environment.

You must author your own user stories, requirements document, and architecture decision records (ADRs), then implement and demonstrate based on them.

### 2. Roles & Permissions

- Student: sign in; browse availability; create/cancel own bookings; view own history. (Student features are required)
- Registrar: sign in; maintain classrooms/time slots; handle escalation (manual release or block abusive accounts if needed); view statistics/logs. (Optional)
- Admin: sign in; system-level configuration; view audit records and health; does not intervene in daily bookings. (Optional)
    
### 3. Shared Non-functional Requirements

- Concurrency correctness: for the same classroom and time slot, there must be exactly one successful booking.  
  Acceptance:
  - Demonstrate only one success using a script or multiple browser windows (students may write their own test script), and
  - Align with the TA’s unified script if provided.
- Reasonable responsiveness: queries and operations should feel smooth in the demo environment (state your target and evidence in your requirements, such as recordings or logs).
- Documentation available: provide API documentation (Swagger or equivalent).
- Runnable: provide a local start command (docker compose up) and list default accounts and health check URLs in the README.

---

### 4. Phase 1 (Monolithic Architecture)

#### 4.1 Student-side Feature References
- Sign in/out; show menus by role.
- Availability search: filter by campus/building/room/date/time slot (with pagination if needed).
- Create/cancel bookings: clear success/failure messages (for example, failure due to time conflict).
- My bookings and history: view personal records; filter by time.

#### 4.2 Registrar Feature References (Optional)
- Classroom and time-slot maintenance: CRUD (open hours, capacity, maintenance windows).
- Conflict escalation: inspect suspected abuse; manually release holds or block accounts (with audit trail).
- Basic analytics: at least one chart (for example, daily bookings, top N popular rooms).

#### 4.3 Admin (Optional)
- System config and audit: key operation logs (who, when, what) and a basic health page.

---

### 5. Phase 2

#### 5.1 Required: Improve and Retrospect Based on Feedback

- Deliver at least three verifiable improvements.
- In your change log, state: what changed, why, and the impact (with demo or log evidence).

#### 5.2 Choose one or more Advanced Capabilities

Note: Completing any one earns bonus; more items, more bonus. We look only for the behavior and evidence, not how you implement it.

1) Lists promptly reflect the latest changes  
   Behavior: after booking/canceling, relevant lists update without restarting the app (refresh or back-to-list shows changes).  
   Evidence: screen recording or logs showing action → list updated.
        
2) Readable during busy or maintenance periods  
   Behavior: while users are continuously creating/canceling bookings, or during a maintenance simulation, queries remain available; the UI shows a read-only or possible delay notice.  
   Evidence: recording that shows the process and the notice.
        
3) A single external API entry point  
   Behavior: the browser only accesses data through one API prefix (for example, /api/...), not scattered backend addresses; at least one page fetches multiple data blocks with a single aggregated request.  
   Evidence: browser Network panel or capture plus an example of the aggregated JSON.
        
4) Read / Write Split Architecture  
   Behavior: while continuous booking/canceling is happening, the search page remains usable (no errors or freezes).  
   Evidence: recording that shows parallel repeated bookings/cancellations and normal browsing of queries.

---

### 6. Submission Checklist

    repo-root/
    ├─ README.md                 # Start steps, default accounts, health URLs, demo guide (1 page is fine)
    ├─ docker-compose.yml        # One-command local demo
    ├─ /docs
    │  ├─ requirements.md        # Your requirements and user stories (roles, use cases, acceptance)
    │  ├─ api.md                 # API doc entry (or link to Swagger)
    │  ├─ changes.md             # Phase 2 changes and retrospective (what/why/impact plus evidence)
    │  └─ decisions/             # ADRs (numbered)
    │     ├─ 0001-*.md
    │     ├─ 0002-*.md
    │     └─ template.md
    ├─ /frontend                 # Frontend project
    ├─ /backend                  # Backend project (or services/... as you prefer)
    └─ refactor-report.md
    
---

### 7. Optional Tech Stack

You can choose from the tools listed below to complete the project, or you can use other tools. Explain why you chose those tools in the ADRs.

#### Frontend 
JavaScript / TypeScript

Next.js; React with Vite or CRA; Vue 3 with Vite; Angular.

#### Entry Layer
NestJS (TypeScript / Node.js); Spring Boot (Java / Kotlin); FastAPI (Python)

#### Backend 
NestJS (TypeScript / Node.js); Spring Boot (Java / Kotlin); Django REST Framework (Python); FastAPI (Python).

#### Database and Migrations
PostgreSQL; MySQL; SQLite (for demo only).

#### Cache and Minimal Messaging
Redis

#### Authentication and Authorization
JWT

#### API Contract and Validation
OpenAPI or Swagger via swagger-ui, SpringDoc, FastAPI built-in, or NestJS Swagger.

#### Testing and Demo Tools
Jest or Vitest (JavaScript / TypeScript); JUnit (Java / Kotlin); pytest (Python); ESLint + Prettier (Javascript / TypeScript)
#### Packaging and Local Run (Required)
Docker; Docker Compose.

---

### 8. Grading Criteria
Total 100 points. Phase 1: 60 points; Phase 2: 40 points.

#### Phase 1 (60 points)

| Criterion                         | Meets (full credit)                                                                                                       | Points | Partially meets                                             | Points | Not met (examples)                                 | Points |
|----------------------------------|---------------------------------------------------------------------------------------------------------------------------|------:|-------------------------------------------------------------|------:|----------------------------------------------------|------:|
| (Required) Runnable (Compose and README) | On the grader’s machine, docker compose up succeeds once; README lists start steps, default accounts, health URLs; all containers healthy | 5 | Needs manual extra steps (for example, pre-create tables) or 1–2 containers need restarts | 3 | Cannot start; README missing or mismatched; no health endpoints | 0 |
| (Required) Concurrency correctness (only 1 success) | For the same room and slot, demonstrate with script or multi-window that twice in a row there is only 1 success and others fail with clear messages; logs show backend checks and constraints | 10 | Mostly correct but occasionally shows double success or no message; or demo proves sequential calls rather than concurrency | 6 | Double bookings reproducible; relies on frontend disabling only; no backend protection | 0 |
| API docs available               | Swagger or equivalent is accessible; each core endpoint has request and response examples, error codes, and auth notes; matches implementation | 5 | Accessible but missing endpoints or examples or less than or equal to 30 percent mismatch | 3 | No accessible API docs or largely mismatched       | 0 |
| Roles and permissions            | JWT works; students cannot cancel others’ bookings; registrar and admin align with description; unauthorized access returns clear errors | 6 | Mostly correct but with 1–2 reproducible boundary issues or unclear messages | 3 | No auth; any role can act on others                | 0 |
| ADRs (templated)                 | Use the template; decisions map to code (for example, indexes or constraints)                                             | 8 | Exists but shallow or missing alternatives or evidence; or disconnected from code | 5 | Not templated or empty                             | 0 |
| Requirements and design traces   | requirements.md (user stories and acceptance), basic architecture or flows; consistent with product; reports/refactor-report.md summarizes issues and plan | 6 | Exists but missing acceptance or diagrams or deviates from product | 3 | No traces                                         | 0 |

#### Phase 2 (40 points)
| Criterion                 | Meets (full credit)                                                                                                            | Points | Partially meets                                | Points | Not met (examples)           | Points |
|--------------------------|----------------------------------------------------------------------------------------------------------------------------------|------:|------------------------------------------------|------:|------------------------------|------:|
| (Required) Improvements based on feedback | changes.md lists at least three verifiable improvements (for example, search UX, messages, permissions, history, data model, logs or health), each with demo or log evidence | 12 | Only 1–2 improvements, or small or weak evidence | 7 | No substantive improvements  | 0 |
| (Required) Concurrency correctness retained | On the Phase 2 build, repeat Phase 1 concurrency demo; two runs both only 1 success; no regressions                    | 8 | Occasional regression with a reproducible fix plan | 4 | Stable regression            | 0 |
| Documentation updated     | changes.md and API docs updated; interface changes reflected; README updated for demo                                          | 8 | Incomplete updates or less than or equal to 30 percent mismatch | 4 | Docs largely not updated     | 0 |
| Advanced capability (choose one or more) | Two or more items fully demonstrated gets 18 points; one item fully demonstrated gets 12 points                        | 18 or 12 | Attempts made but evidence weak or unstable      | 8 | No advanced capability shown | 0 |
| New ADRs                  | New ADRs around improvements or advanced items (for example, single entry, read stability, prompt list updates, read-availability during maintenance) with trade-offs and consequences | 6 | Exists but shallow or disconnected               | 3 | Missing                      | 0 |


## ADR Templates
https://github.com/joelparkerhenderson/architecture-decision-record/tree/main/locales/en/templates/decision-record-template-by-michael-nygard (Simple)
https://github.com/joelparkerhenderson/architecture-decision-record/tree/main/locales/en/templates/decision-record-template-for-alexandrian-pattern (More details)
https://github.com/joelparkerhenderson/architecture-decision-record/tree/main/locales/en/templates/decision-record-template-by-jeff-tyree-and-art-akerman (Comprehensive)

References: https://github.com/joelparkerhenderson/architecture-decision-record/tree/main/locales/en/templates


# Project Milestones

## Design I
- building on the original spec from the instructors, develop user stories, implementation plans, tradeoff analyses, and detailed designs for the software
- commit detailed designs by Fri Sep 19 


## Implementation I
- implement code for the design, with tests, and deploy to a production environment. 
- demo in lab week of Sep 29

## Design II 
- add quality attributes and deploy to cloud. High performance, load balancing, A/B tests

## Implmementation II

## Refactor 
- select from presented code bases one to refactor. 
- clone and analyze, write a report. 24 hrs. Use SQ or similar. Buy or don't buy. 
- add (1?) new feature or fix the biggest architectural pain point (hotspot)

## Reflect
- write a report reflecting on the term and tools