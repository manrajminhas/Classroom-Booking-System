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
```docker compose build```  
```docker compose up```  

The application will then be available at ```localhost:3000```.  

For reference, the backend uses port 3001 and the database uses port 5432.  

# Test Accounts:

To ensure full coverage of all user roles (Staff, Registrar, and Admin), the following accounts have been hardcoded into the application and will be created automatically when the backend server is started:

| Role | Username | Password | Notes |
| :--- | :--- | :--- | :--- |
| **Staff/Regular User** | `staff_user` | `password123` | Can book rooms and view/cancel their own bookings. |
| **Registrar** | `registrar_ta` | `registrar123` | Can manage rooms (add/delete/import) and view all bookings/logs. |
| **Admin** | `admin_ta` | `admin123` | Can view all system health data and full audit logs. |

# Run Tests:

We use Vitest for testing. To run our project's tests:  

```cd src/backend```  
```npm run test```  

To view code coverage, use the following command instead:  

```npx vitest run --coverage```  

Current coverage:  

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

# Acceptance Tests:

Coming soon.  

# Further Documentation:

API documentation is available in `docs/api`.