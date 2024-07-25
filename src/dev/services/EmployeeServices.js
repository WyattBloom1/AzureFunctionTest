
const SQL = require("../../database/SQLQueries");

const getAllEmployees = async () => {
    const employeeData = await SQL.query('SELECT * FROM Employees');
    return employeeData;
};

const getEmployeeByID = async (EmployeeInfo) => {
    // Define the params list as inputs to the SQL query. The value will replace the @input in the query string
    var inputs = [
        { input: 'EmployeeID', value: EmployeeInfo.EmployeeID }
    ];
    const employeeData = await SQL.query('SELECT * FROM Employees WHERE EmployeeID = @EmployeeID', inputs);
    return employeeData;
};

const createEmployee = async (EmployeeInfo) => {
    // Define the params list as inputs to the SQL query. The value will replace the @input in the query string
    var inputs = [
        { input: 'Name', value: EmployeeInfo.Name }, 
        { input: 'Email', value: EmployeeInfo.Email },
        { input: 'Phone', value: EmployeeInfo.Phone },
        { input: 'Address', value: EmployeeInfo.Address },
        { input: 'Salary', value: EmployeeInfo.Salary }
    ];
    const employeeID = await SQL.query('INSERT INTO Employees (EmployeeName, EmployeeEmail, EmployeePhone, EmployeeAddress, EmployeeSalary) VALUES (@Name, @Email, @Phone, @Address, @Salary)', inputs);
    return employeeID;
};

// Using a store procedure
const updateEmployee = async (EmployeeInfo) => {
    const employeeData = {
        EmployeeID: EmployeeInfo.ID,
        EmployeeName: EmployeeInfo.Name,
        EmployeeEmail: EmployeeInfo.Email,
        EmployeePhone: EmployeeInfo.Phone,
        EmployeeAddress: EmployeeInfo.Address,
        EmployeeSalary: EmployeeInfo.Salary
    }
    const employeeInfo = await SQL.SP_EditEmployee(employeeData, "dbo.UpdateEmployee")
    return employeeInfo;
};

const deleteEmployee = async (EmployeeInfo) => {
    // Define the params list as inputs to the SQL query. The value will replace the @input in the query string
    var inputs = [
        { input: 'EmployeeID', value: EmployeeInfo.EmployeeID }
    ];
    const status = await SQL.query('DELETE FROM Employees WHERE EmployeeID = @EmployeeID', inputs)
    return status;
};

module.exports = {
    getAllEmployees,
    getEmployeeByID,
    createEmployee,
    updateEmployee,
    deleteEmployee,
};