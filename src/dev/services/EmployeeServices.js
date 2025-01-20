const SQL = require("../../database/SQLQueries");

// const { Knex } = require("knex");

// var knex = require("knex")({
//   client: "mssql",
//   connection: {
//     server: "47.32.10.212",//process.env.DB_SERVER,
//     user: "sa",//process.env.DB_USER,
//     password: "SQLPass001!",//process.env.DB_PASS,
//     database: "JobTracking",//process.env.DB_NAME,
//     options: {
//       // port: process.env.DB_PORT,
//       encrypt: false,
//       trustServerCertificate: false,
//     },
//   },
// });
const knex = require("../../database/Knex").knex;


const getEmployees = async (params) => {
  const employees = await knex.raw(`EXEC GetEmployees @FilterForMap = ?;`, [params.filterForMap ? params.filterForMap : false]);
  return employees;
};

const getAllEmployees = async () => {
  return (
    knex
      .from("Employees")
      .select("*")
      .catch((error) => {
        console.error("Failed getting all employees: " + error);
        throw Error(error);
      })
  );
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
    console.log("Creating");
    console.log("Employee Info" + EmployeeInfo);
    const employeeId = await knex
    .transaction(async (trx) => {
      const employeeId = await knex
        .insert(EmployeeInfo,
          "*"
        )
        .into("Employees")
        .transacting(trx)
        .catch((error) => {
          console.error("Insert failed: " + error);
          throw new Error(error);
        });
    console.log('Created employee: ' + employeeId[0].employeeId);
      return employeeId[0];
    })
    .catch((error) => {
      console.error("Insert failed: " + error);
      throw new Error(error);
    });
    // const employeeID = await SQL.query('INSERT INTO Employees (EmployeeName, EmployeeEmail, EmployeePhone, EmployeeAddress, EmployeeSalary) VALUES (@Name, @Email, @Phone, @Address, @Salary)', inputs);
    return employeeId;
};

// Using a store procedure
const updateEmployee = async (EmployeeId, EmployeeInfo) => {
    const employeeData = {
        EmployeeID: EmployeeInfo.ID,
        EmployeeName: EmployeeInfo.Name,
        EmployeeEmail: EmployeeInfo.Email,
        EmployeePhone: EmployeeInfo.Phone,
        EmployeeAddress: EmployeeInfo.Address,
        EmployeeSalary: EmployeeInfo.Salary
    }

    const employeeInfo = await knex
    .transaction(async (trx) => {
      var updateEmployee = knex("Employees")
        .where({ employeeId: EmployeeId })
        .update(EmployeeInfo, ["*"]);
      return updateEmployee;
    })
    .catch((error) => {
      console.error("Insert failed: " + error);
      throw new Error(error);
    });

    // return { status: 200, jsonBody: employeeInfo };
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
    getEmployees,
    getAllEmployees,
    getEmployeeByID,
    createEmployee,
    updateEmployee,
    deleteEmployee,
};