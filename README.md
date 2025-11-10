# Team Members:

| V#   | Name     |
| ---- | -------- |
| ~~V00975012~~ | ~~Will Calder~~ |
| V00998047 | Manraj Minhas |
| V00989485 | Max Patchell |
| V01012421 | William Shaw |

# Run Project:

To run the project from the root directory, use the following commands:  

```cd src```  
```docker compose up --build```  

The application will then be available at ```localhost:3000```.  

For reference, the backend uses port 3001 and the database uses port 5432.  

To book a room, you will first have to add rooms from the CSV file located in `docs` by logging in as a Registrar (see below).  

# Test Accounts:

To ensure full coverage of all user roles (Staff, Registrar, and Admin), the following accounts have been hardcoded into the application and will be created automatically when the backend server is started:

| Role | Username | Password | Notes |
| :--- | :--- | :--- | :--- |
| **Staff/Regular User** | `staff_user` | `password123` | Can book rooms and view/cancel their own bookings. |
| **Registrar** | `registrar_ta` | `registrar123` | Can manage rooms (add/delete/import) and view all bookings/logs. |
| **Admin** | `admin_ta` | `admin123` | Can view all system health data and full audit logs. |

# Run Tests:

We use Vitest for testing. Make sure it's installed before trying it! (```npm install --save-dev vitest```)  
To run our project's backend tests:  

```cd src/backend```  
```npx vitest run```  

To view code coverage, use the following command instead:  

```npx vitest run --coverage```  

All relevant source and controller files have more than 75% branch coverage.  

To run our project's frontend tests:

```cd src/frontend```  
```npx vitest run```  

To view code coverage, use the following command instead:  

```npx vitest run --coverage```  

# Acceptance Tests:

Our acceptance tests are mapped to requirements described in Cycles 1 and 2.  

- Given the application has been opened for the first time, when the staff member types in a valid username and password, then they are logged in.  
- Given the staff member is logged in, when they enter criteria for their booking (like date, time, and attendees), then they are able to browse which classroms are available.  
- Given the staff member has found an appropriate classrom, when they click the Book Now button, then the booking is created.
- Given the staff member has created a booking, when they navigate to the 'My Bookings' page, then the booking appears in the 'Upcoming Bookings' table.
- Given the staff member has created a booking and has navigated to the 'My Bookings' page, when they click the Cancel button next to the booking, then the booking is removed from their history.
- Given a staff member has created a booking for a specific time and classroom, when another staff member enters the same date as search criteria, then the already-booked classrom does not appear as an option.  
- Given a staff member is logged in, when they click the 'Logout' button, then they are logged out of the application.  

- Given a registrar is logged in, when they click on the 'Registrar' menu bar item, then they can either add an individual classroom or import from a CSV.
- Given a registrar is on the 'Registrar' page, when they click a user's 'Block' button in the User Management table, then the user is unable to sign in.
- Given a registrar is on the 'Registrar' page and a user has been blocked, when they click a user's 'Unblock' button in the User Management table, then the user is able to sign in.
- Given at least one booking has been created, when the registrar navigates to the 'Registrar' page, then they are able to see the most popular rooms in graphical form.
- Given at least one booking has been created, when the registrar navigates to the 'Registrar' page and clicks 'Cancel' next to a booking in the 'All Bookings' table, then the booking is cancelled and the room can be booked by another user.
- Given at least one booking has been created, when the registrar navigates to the 'Registrar' page, then they are able to see a log entry for the activity in the 'Recent Activity' table.
- Given at least one booking has been created where the number of attendees is less than half the room's capacity, when the registrar navigates to the 'Registrar' page, then the booking appears in red in the 'All Bookings' table.

- Given an admin is logged in, when they click on the 'Admin' menu bar item, then they are able to see an overview of the system status, including uptime.
- Given at least one booking has been created, when the admin navigates to the 'Admin' page, then they are able to see a log entry for the activity in the 'Audit Log' table.

# MCP Server:  

The MCP server supports 8 tools. We found that this way of running the server worked best:

- Build and run the project with Docker
- In VS Code, navigate to the .vscode folder -> mcp.json
- Click the Start button that appears
- The following logs should appear in the Output view when "MCP: room-booking" is selected in the dropdown:
```2025-11-09 21:02:43.882 [info] Connection state: Starting```  
```2025-11-09 21:02:43.890 [info] Starting server from LocalProcess extension host```   
```2025-11-09 21:02:43.891 [info] Connection state: Starting```  
```2025-11-09 21:02:43.892 [info] Connection state: Running```  
```2025-11-09 21:02:44.888 [info] Discovered 8 tools```  

From there, all tools should be usable as expected. 

# API Endpoints:

API endpoints are exposed through individual controllers in the backend, allowing external code to interact with the service. Each controller (bookings, rooms, users, etc.) provides routes that can be called to perform operations.

# CI:

A specific `.gitlab-ci.yml` for our project is located in the project's root, although it is not currently functional.  

# System Health:

Available at http://localhost:3000/Admin

# Further Documentation:

API documentation is available in `docs/api`.