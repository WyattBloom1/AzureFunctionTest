const { HttpResponse } = require("@azure/functions");
const https = require('https');
const messageService = require("../services/MessagesService");

// In src/controllers/workoutController.js
async function getMessages(request, context) {
    try {
        console.log(request);
        let SQLData;
        switch (request.filterType) {
            case 'GetByID':
                SQLData = await messageService.getMessagesById(request);
                break;
            default:
                SQLData = await messageService.getMessages(request);
                break;
        }

        return { status: 200, jsonBody: SQLData };
    } catch (err) {
        return GetReturnMessage(err.message, '', context);
        // return err.message;
    }
};


async function logMessage(request, context) {
    try {
        const newMessage = await messageService.logNewMessage(request);
        return { status: 200, jsonBody: newMessage };
    } catch (err) {
        return GetReturnMessage(err.message, '', context);
    }
};

async function deleteMessage(request, JobId, context) {
    try {
        request.MessageId;

        const deletedMessage = messageService.deleteMessage(request.messageId);
        return { status: 200, jsonBody: deletedMessage }
    } catch (err) {
        return GetReturnMessage(err.message, '', context);
    }
};

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
    getMessages,
    logMessage,
    deleteMessage
};
