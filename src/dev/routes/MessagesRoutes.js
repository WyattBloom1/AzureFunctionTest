// In src/v1/routes/workoutRoutes.js
const { app } = require('@azure/functions');
const MessageController = require("../controllers/MessageController");


app.setup({
    enableHttpStream: true,
});

app.http('getMessages', {
    methods: ['GET'],
    route: 'messages',
    authLevel: 'anonymous',
    handler: async (request, context) => {
        try {
            context.log(JSON.stringify(request.params));
            
            let status = await MessageController.getMessages(request.params, context);
            return status;
            // return { status: 400, body: "ERROR" };//status;
        } catch (err) {
            console.log("Route Error: " + err);
        }
    }
})

app.http('logMessage', {
    methods: ['POST'],
    route: 'messages',
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log(`Http function processed request for url "${request.url}"`);
        return await MessageController.logMessage(request.params, context);
    }
})

app.http('deleteMessage', {
    methods: ['DELETE'],
    route: 'messages',
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log(`Http function processed request for url "${request.url}"`);

        const jobId = request.query.get('id');
        return await MessageController.deleteMessage(request, jobId, context);
    }
})