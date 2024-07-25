const { app } = require('@azure/functions');
const { EmployeeController } = require("../dev/controllers/EmployeeControllers");

async function getAllEmployees(request, context) {
    context.log(`Http function processed request for url "${request.url}"`);
    return {
        status: 200,
        jsonBody: await EmployeeController.getAllEmployees(request, context)
    };
}

// app.http('Employee', {
//     methods: ['GET', 'POST'],
//     route: 'Employee',
//     authLevel: 'anonymous',
//     handler: getAllEmployees//(request, context)
// });


/*
    context.log(`Http function processed request for url "${request.url}"`);

    const name = request.query.get('name') || await request.text() || 'world';

    return { body: `Hello, ${name}!` };
*/

