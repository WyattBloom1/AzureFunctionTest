const employeeService = require("../services/EmployeeServices");

// In src/controllers/workoutController.js
async function getAllEmployees(request, context) {
    try  
    {
        const allEmployees = await employeeService.getAllEmployees();
        // .then(data => {
        //     // return data;
        // });
        console.log("All Employees: " + allEmployees);
         return { status: 200, jsonBody: allEmployees };
    } catch (err) {
        return GetReturnMessage(err.message, '', context);
        // return err.message;
    }
};

async function getEmployees(request, context) {
    try {
        let SQLData;
        switch (request.filterType) {
            default:
                SQLData = await employeeService.getEmployees(request);
                break;
        }

        return { status: 200, jsonBody: SQLData };
    } catch (err) {
        return GetReturnMessage(err.message, '', context);
        // return err.message;
    }
};

async function getEmployeeByID(request, context) {
    try {
        const employeeData = await employeeService.getEmployeeByID({ EmployeeID: request.query.get('id') });
        return { status: 200, jsonBody: employeeData };
    } catch (err) {
        return GetReturnMessage(err.message, '', res);
    }
};

async function createEmployee(request, body, context) { 
    try {
        body = JSON.parse(body);
        var missingValues = '';
        missingValues += (!body.employeeName) ? 'employeeName, ' : '';
        missingValues += (!body.employeeEmail) ? 'employeeEmail, ' : '';
        missingValues = missingValues.substring(0, missingValues.length -2);

        if ( missingValues !== '' ) {
            console.log('Missing fields: %s', missingValues);
            // GetReturnMessage('ERROR_InvalidInput', '', res);
            return GetReturnMessage('ERROR_InvalidInput', '', context);
        }

        const createdEmployee = await employeeService.createEmployee(body);
        // { 
        //     Name: body.EmployeeName,
        //     Email: body.EmployeeEmail,
        //     Phone: body.EmployeePhone,
        //     Address: body.EmployeeAddress,
        //     Salary: body.EmployeeSalary
        // });
        return { status: 200, jsonBody: createdEmployee };
    } catch (err) {
        return GetReturnMessage(err.message, '', context);
    }
    // res.status(201).send({ status: "OK", jsonBody: createdEmployee });
};

async function updateEmployee(request, body, context) {
    try {
        body = JSON.parse(body);
        employeeId = request.query.get('id');
        //const { body, params: { EmployeeID }, } = req;
        var missingValues = '';
        missingValues += (!employeeId) ? 'EmployeeID, ' : '';
        missingValues = missingValues.substring(0, missingValues.length -2);
    
        // If any of the required strings are empty, return an invalid input message
        if ( missingValues !== '' ) {
            console.log('Missing fields: %s', missingValues);
            return GetReturnMessage('ERROR_InvalidInput', '', context);
        }

        // Update the employee
        console.log("Updating...");
        const updatedEmployee = await employeeService.updateEmployee( employeeId, body );

        // Send a success status along with the ID of the updated employee
        return { status: 200, jsonBody: updatedEmployee };
    } catch (err) {
        return GetReturnMessage(err.message, '', context);
    }

};

async function deleteEmployee(request, EmployeeId, context) {
    try {
        const deletedEmployee = employeeService.deleteEmployee({EmployeeID: EmployeeId});

        return { status: 200, jsonBody: deletedEmployee }
    } catch(err) {
       return GetReturnMessage(err.message, '', context);
    }
};

// Format and send back an error based on the error message string
function GetReturnMessage(ErrorMessage, OptionalMessage, context) {
    context.error(ErrorMessage);
    var status, statusCode, message;
    switch(true) {
        case (ErrorMessage.includes('ERROR_DBTimeoutError')):
            status = 400;
            status = 'SQL_CONNECTION_FAILED'
            message = 'SQL connection timed out. Database may be restarting. If the problem persists, please contact your SQL Administrator.';
            break;
        case (ErrorMessage.includes('ERROR_DBConnectionFailed')):
            status = 400;
            statusCode = 'SQL_CONNECTION_FAILED';
            message = 'SQL Connection failed. Database may be unavailable.';
            break;
        case (ErrorMessage.includes('ERROR_InvalidInput')):
            status = 400;
            statusCode = 'INVALID_INPUT';
            message = 'Invalid input - missing fields'
            break;
        default:
            status = 401;
            statusCode = 'ERROR_UnhandledException';
            message = 'Unhandled exception occured. Contact your System Administrator for assistance.';
    }

    message = (!OptionalMessage) ? message : OptionalMessage;
    return { status: status, jsonBody: message };
    // res.status(status).send({ status: statusCode, jsonBody: { error: message } });
}

module.exports = {
    getEmployees,
    getAllEmployees,
    getEmployeeByID,
    createEmployee,
    updateEmployee,
    deleteEmployee,
};
  
