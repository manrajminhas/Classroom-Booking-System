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

# Run Tests:

We use Vitest for testing. To run our project's tests:  

```cd src/backend```  
```npm run test```  

To view code coverage, use the following command instead:  

```npx vitest run --coverage```  

# Acceptance Tests

Coming soon