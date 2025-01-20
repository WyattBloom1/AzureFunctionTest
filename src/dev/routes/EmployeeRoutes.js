// In src/v1/routes/workoutRoutes.js
const { app } = require('@azure/functions');
const EmployeeController = require("../controllers/EmployeeControllers");


app.setup({
    enableHttpStream: true,
});

// Open GET - returns details for all Employees
app.http('getEmployees', {
    methods: ['GET'],
    route: 'employees',
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log(`Http GET function processed request for url "${request.url}"`);
        try {
            context.log(JSON.stringify(request.params));
            
            let status = await EmployeeController.getEmployees(request.params, context)
            return status;
        } catch (err) {
            console.log("Route Error: " + err);
        }


    }
})

app.http('updateEmployees', {
    methods: ['POST'],
    route: 'employees',
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log(`Http function processed request for url "${request.url}"`);
        console.log("Reuqest: " + request);
        
        const employeeID = request.query.get('id');
        const requestBody = await request.text();
        if(employeeID == null)
            return await EmployeeController.createEmployee(request, requestBody, context);
        else
            return await EmployeeController.updateEmployee(request, requestBody, context);
    }
})

app.http('deleteEmployee', {
    methods: ['DELETE'],
    route: 'employees',
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log(`Http function processed request for url "${request.url}"`);

        const employeeID = request.query.get('id');
        return await EmployeeController.deleteEmployee(request, employeeID, context);
    }
})

// app.http('RestAPI-Function', {
//     methods: ['GET', 'POST'],
//     authLevel: 'anonymous',
//     handler: async (request, context) => {
//         context.log(`Http function processed request for url "${request.url}"`);

//         const name = request.query.get('name') || await request.text() || 'world';

//         return { body: `Hello, ${name}!` };
//     }
// });

// Specified GET - returns details for one Employee
app.http('getEmployeeByID', {
    methods: ['GET'],
    route: 'employees/:id',
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log('Requst - ' + request.query.get('id'));
        return {body: 'Test', jsonBody: request}
    }//EmployeeController.getEmployeeByID
})
// router.get("/:EmployeeID", EmployeeController.getEmployeeByID);

// const express = require("express");
// const EmployeeController = require("../controllers/EmployeeControllers");
// const router = express.Router();

// // Open GET - returns details for all Employees
// router.get("/", EmployeeController.getAllEmployees);

// // Specified GET - returns details for one Employee
// router.get("/:EmployeeID", EmployeeController.getEmployeeByID);

// // POST for creating a new Employee
// router.post("/", EmployeeController.createEmployee);

// // Patch for updating an employee
// router.patch("/:EmployeeID", EmployeeController.updateEmployee);

// // Delete for removing an employee - soft delete, sets as inactive
// router.delete("/:EmployeeID", EmployeeController.deleteEmployee);

// module.exports = router;
