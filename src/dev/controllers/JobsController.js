const { HttpResponse } = require("@azure/functions");
const https = require('https');
const jobsService = require("../services/JobsService.js");
const fs = require("node:fs");

// In src/controllers/workoutController.js
async function getJobs(request, context) {
    try {
        const jobNumber = request.jobNumber;
        const getDefault = request.defaultFilter;

        let SQLData;
        switch (request.filterType) {
            case 'InvalidJobs':
                SQLData = await jobsService.getInvalidJobs(request);
                break;
            case 'OutstandingJobs':
                SQLData = await jobsService.getOutstandingJobData(request);
                break;
            case 'JobsRange':
                SQLData = await this.getJobsRange(request, context);
                break;
            case 'JobSales':
                SQLData = await jobsService.getTotalSalesByYear(request, context);
                break;
            case 'ScheduledJobs':
                SQLData = await jobsService.getScheduledJobs(request, context);
                break;
            case 'LastSync':
                SQLData = await jobsService.getLastSyncDate(request, context);
                // SQLData = new Date(SQLData[0].LastSync);
                // console.log(SQLData[0].LastSync.toString().replace("T", " "));
                break;
            case 'GetByID':
                SQLData = await jobsService.getJobById(request);
                break;
            case 'GetByIDBatch':
                console.log(request.jobs);
                let jobs = request.jobs.replaceAll('"[', '[').replaceAll(']"', ']');
                params = JSON.parse(jobs);
                SQLData = await jobsService.getJobsById_Batch(params);
                break;
            default:
                SQLData = await jobsService.getJobs(request);
                break;
        }

        return { status: 200, jsonBody: SQLData };
    } catch (err) {
        return GetReturnMessage(err.message, '', context);
        // return err.message;
    }
};

async function getJobById(request, jobId, context) {
    try {
        const returnedJob = await jobsService.getJobById({ jobNumber: jobId });
        return { status: 200, body: returnedJob };
    } catch (err) {
        return GetReturnMessage(err.message, '', context);
        // return err.message;
    }
}

async function getJobsRange(request, context) {
    try {
        let inputOperator = request.Operator;
        let operator;
        if (inputOperator.includes("<="))
            operator = "<=";
        else if (inputOperator.includes(">="))
            operator = ">=";
        else if (inputOperator.includes("="))
            operator = "=";
        else if (inputOperator.includes("<"))
            operator = "<";
        else if (inputOperator.includes(">"))
            operator = ">"

        const defaultJobs = await jobsService.getJobsRange(request, operator);
        return defaultJobs;
    } catch (err) {
        console.log("Controller Error: " + err);
        return GetReturnMessage(err.message, '', context);
    }
};


async function createJob(request, context) {
    try {
        const createdJob = await jobsService.createJob(request);
        return { status: 200, jsonBody: createdJob };
    } catch (err) {
        return GetReturnMessage(err.message, '', context);
    }
};

async function batchInsert(request, context) {
    try {
        // Remove the quotations wrapping the JSON array so it can be converted back to valid JSON
        let jobs = request.jobs.replaceAll('"[', '[').replaceAll(']"', ']');
        params = JSON.parse(jobs);

        console.log(params[0]);
        let SQLData;
        switch (params[0].tableInsert.toUpperCase()) {
            case 'COMPLETE':
                console.log('Creating Complete');
               SQLData = await jobsService.batchInsert_Complete(params);
                break;
            case 'LEGACY':
                console.log('Creating Legacy');
               SQLData = await jobsService.batchInsert_Legacy(params);
                break;
            default:
                console.log('Creating New');
                SQLData = await jobsService.batchInsert(params);
                break;
        }
        
        return { status: 200, jsonBody: SQLData };
    } catch (err) {
        return GetReturnMessage(err.message, '', context);
    }
};

async function createLegacyJob(request, body, context) {
    try {
        const createdJob = await jobsService.createLegacyJob(body);
        return { status: 200, jsonBody: createdJob };
    } catch (err) {
        return GetReturnMessage(err.message, '', context);
    }
};

async function importJob(request,context) {
    try {
        const createdJob = await jobsService.importJob(request);
        return { status: 200, jsonBody: createdJob };
    } catch (err) {
        return GetReturnMessage(err.message, '', context);
    }
};

async function updateJob(request, context) {
    try {
        let isActive = request.isActive;
        let jobNumber = request.jobNumber;
        // console.log(request);
        const createdJob = await jobsService.updateJob(request, jobNumber);

        return { status: 200, jsonBody: createdJob };
    } catch (err) {
        return GetReturnMessage(err.message, '', context);
    }
};

async function deleteJob(request, JobId, context) {
    try {
        const deletedJob = jobsService.deleteJob({ jobNumber: JobId });
        return { status: 200, jsonBody: deletedJob }
    } catch (err) {
        return GetReturnMessage(err.message, '', context);
    }
};

async function getSmartsheetData(request) {
    console.log(request);
    switch(request.filterType) {
        case "getSheets":
            return APICall(`/2.0/sheets`).then((data) => {
                // console.log(data);
                const response = {
                    status: 200,
                    jsonBody: data,
                };
                return response;
            });
        case "getRows":
            return APICall(`/2.0/sheets/${request.SheetID}?level=2&include=objectValue`).then((data) => {
                // console.log(data);
                const response = {
                    status: 200,
                    jsonBody: data,
                };
                return response;
            });
        case "getRows2":
            let columns = [], rows = [];
            request = request.IDs.replaceAll("'[", "[").replaceAll("]'", "]");
            request = JSON.parse(request);
            for(var i = 0; i < request.length; i++) {
                let ID = request[i];
                console.log(ID);
                await APICall(`/2.0/sheets/${ID}?level=2&include=objectValue`).then((data) => {
                    columns = columns.concat(data.columns);
                    rows = rows.concat(data.rows);
                });
            }
            // console.log(response);
            return { status: 200, jsonBody: {columns: columns, rows: rows} }
    }
}

async function APICall(params) {
    console.log('API Call with params: ' + JSON.stringify(params));
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'api.smartsheet.com',
            path: params,
            method: 'GET',
            headers: {
                'Authorization': 'Bearer 3xw2LUHa82GoO8IUs8FILQvZyDnnnqABmpBtF',
                'Content-Type': 'application/json'
            },
        };
        const req = https.request(options, (res) => {
            if (res.statusCode < 200 || res.statusCode >= 300) {
                // return reject(new Error('statusCode=' + res.statusCode));
            }
            var body = [];
            res.on('data', function (chunk) {
                body.push(chunk);
            });
            res.on('end', function () {
                try {
                    body = JSON.parse(Buffer.concat(body).toString());
                } catch (e) {
                    reject(e);
                }
                resolve(body);
            });
        });
        req.on('error', (e) => {
            reject(e.message);
        });

        // send the request
        req.end();
    });
}

// Format and send back an error based on the error message string
function GetReturnMessage(ErrorMessage, OptionalMessage, context) {
    console.log(ErrorMessage);
    var status, statusCode, message;
    switch (true) {
        case (ErrorMessage.includes('ERROR_DBTimeoutError')):
            status = 408;
            status = 'SQL_CONNECTION_FAILED'
            message = 'SQL connection timed out. Database may be restarting. If the problem persists, please contact your SQL Administrator';
            break;
        case (ErrorMessage.includes('ERROR_DBConnectionFailed')):
            status = 400;
            statusCode = 'SQL_CONNECTION_FAILED';
            message = 'SQL Connection failed. Database may be unavailable';
            break;
        case (ErrorMessage.includes('ERROR_InvalidInput')):
            status = 400;
            statusCode = 'INVALID_INPUT';
            message = 'Invalid input - missing fields'
            break;
        default:
            status = 400;
            statusCode = 'ERROR_UnhandledException';
            message = 'Unhandled exception occured. Contact your System Administrator for assistance';
    }
    console.log("Message: " + message);
    message = (!OptionalMessage) ? message : OptionalMessage;
    return { status: status, body: message };
    // res.status(status).send({ status: statusCode, jsonBody: { error: message } });
}

module.exports = {
    getJobs,
    getJobById,
    getJobsRange,
    createJob,
    batchInsert,
    importJob,
    createLegacyJob,
    updateJob,
    deleteJob,
    getSmartsheetData
};
