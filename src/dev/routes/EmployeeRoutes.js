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
        var employeeID = request.query.get('id');
        return (employeeID == null) ? await EmployeeController.getAllEmployees(request, context) : await EmployeeController.getEmployeeByID(request, context);
    }
})


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
