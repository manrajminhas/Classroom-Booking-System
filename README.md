READMEs specific to Design 2 and Implementation 2 are located in the `docs` folder.  

# Team Members

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

## Test Accounts 

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

# Acceptance Tests:

Coming soon