const mysql = require('mssql');
const dotenv = require('dotenv');
dotenv.config();

const dbString = {
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT),
    authentication: {
        type: 'default'
    },
    options: {
        encrypt: true
    },
};

exports.query = async function query(query, params) {
    try {
        var poolConnection = await mysql.connect(dbString);
        const request = await poolConnection.request();

        // Loop through the params table and add each row as an input to the SQL query. This is a sanitization 
        // layer that wraps the user input as string to avoid SQL injection
        // request.input('input_parameter', sql.Int, value)
        (params || []).forEach( (index) => {request.input(index.input, index.value)} );

        const results = request.query(query);
        /*
            request.query('select 1 as number', (err, result) => {
                // ... error checks
                console.log(result.recordset[0].number) // return 1
                // ...
            })
        */
        return results;
    } 
    catch (err)  { 
      console.log(err);
      switch(true) {
        case err.message.includes('TIMEOUT'):
            throw new Error("ERROR_DBTimeoutError");
        default:
          throw new Error("ERROR_DBConnectionFailed");
      } 
    }
}

exports.SP_EditEmployee = async (values, spName) => {
  try {
      let poolConnection = await mysql.connect(dbString);
      let results = await poolConnection.request()
          .input('EmployeeID', mysql.Int, values.EmployeeID)
          .input('EmployeeName', mysql.NVarChar, values.EmployeeName)
          .input('EmployeeEmail', mysql.NVarChar, values.EmployeeEmail)
          .input('EmployeePhone', mysql.NVarChar, values.EmployeePhone)
          .input('EmployeeAddress', mysql.NVarChar, values.EmployeeAddress)
          .input('EmployeeSalary', mysql.NVarChar, values.EmployeeSalary)
          .execute(spName)

      return results;
   } catch (err)  { 
        console.log('SP Failed - ' + err);
        switch(true) {
          case err.message.includes('TIMEOUT'):
              throw new Error("ERROR_DBTimeoutError");
          default:
            throw new Error("ERROR_DBConnectionFailed");
        } 
    }
}