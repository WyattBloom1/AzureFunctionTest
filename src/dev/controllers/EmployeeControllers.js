const employeeService = require("../services/EmployeeServices");

// In src/controllers/workoutController.js
async function getAllEmployees(request, context) {
    try {
        const allEmployees = await employeeService.getAllEmployees();
        return { status: 200, jsonBody: allEmployees };
        // res.send({ status: "OK", data: allEmployees });
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

const createEmployee = async (req, res) => {
    const { body } = req;
    var missingValues = '';
    missingValues += (!body.EmployeeName) ? 'Name, ' : '';
    missingValues += (!body.EmployeeEmail) ? 'Email, ' : '';
    missingValues = missingValues.substring(0, missingValues.length -2);

    if ( missingValues !== '' ) {
        console.log('Missing fields: %s', missingValues);
        GetReturnMessage('ERROR_InvalidInput', '', res);
        return;
    }

    const createdEmployee = await employeeService.createEmployee({ 
        Name: body.EmployeeName,
        Email: body.EmployeeEmail,
        Phone: body.EmployeePhone,
        Address: body.EmployeeAddress,
        Salary: body.EmployeeSalary
    });
    res.status(201).send({ status: "OK", data: createdEmployee });
};

const updateEmployee = async (req, res) => {
    const { body, params: { EmployeeID }, } = req;
    var missingValues = '';
    missingValues += (!EmployeeID) ? 'EmployeeID, ' : '';
    missingValues = missingValues.substring(0, missingValues.length -2);

    // If any of the required strings are empty, return an invalid input message
    if ( missingValues !== '' ) {
        console.log('Missing fields: %s', missingValues);
        GetReturnMessage('ERROR_InvalidInput', '', res);
        return;
    }

    try {
        // Update the employee
        const updatedEmployee = await employeeService.updateEmployee({
            ID: EmployeeID,
            Name: body.EmployeeName,
            Email: body.EmployeeEmail,
            Phone: body.EmployeePhone,
            Address: body.EmployeeAddress,
            Salary: body.EmployeeSalary
        });
    
        // Send a success status along with the ID of the updated employee
        res.status(201).send({ status: "OK", data: updatedEmployee })
    } catch (err) {
        GetReturnMessage(err.message, '', res);
    }

};

const deleteEmployee = (req, res) => {
    try {
        const { body, params: { EmployeeID }, } = req;
        const deletedEmployee = employeeService.deleteEmployee({EmployeeID: EmployeeID});
        res.status(201).send({ status: "OK", data: deleteEmployee })
    } catch(err) {
        GetReturnMessage(err.message, '', res);
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
    // res.status(status).send({ status: statusCode, data: { error: message } });
}

module.exports = {
    getAllEmployees,
    getEmployeeByID,
    createEmployee,
    updateEmployee,
    deleteEmployee,
};
  