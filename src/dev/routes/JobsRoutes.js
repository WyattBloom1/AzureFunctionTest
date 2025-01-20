// In src/v1/routes/workoutRoutes.js
const { app, HttpResponse } = require('@azure/functions');
const JobsController = require("../controllers/JobsController");


app.setup({
    enableHttpStream: true,
});

app.http('getJobs', {
    methods: ['GET'],
    route: 'jobs',
    authLevel: 'anonymous',
    handler: async (request, context) => {
        try {
            // const header = request.headers.get('x-ms-client-principal');
            // const encoded = Buffer.from(header, "base64");
            // const decoded = encoded.toString("ascii");
          
            // context.log(JSON.parse(decoded));
            // header.forEach(row => context.log(row.value));

            context.log(JSON.stringify(request.params));
            
            let status = await JobsController.getJobs(request.params, context);
            return status;
            // return { status: 400, body: "ERROR" };//status;
        } catch (err) {
            console.log("Route Error: " + err);
        }
    }
})

app.http('createJob', {
    methods: ['POST'],
    route: 'jobs',
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log(`Http function processed request for url "${request.url}"`);
        return await JobsController.createJob(request.params, context);
    }
})

app.http('batchInsert', {
    methods: ['POST'],
    route: 'batchInsert',
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log(`Http function processed request for url "${JSON.stringify(request.url)}"`);
        return await JobsController.batchInsert(request.params, context);
    }
})

app.http('importJob', {
    methods: ['POST'],
    route: 'importJob',
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log(`Http function processed request for url "${request.url}"`);
        return await JobsController.importJob(request.params, context);
    }
})

app.http('deleteJob', {
    methods: ['DELETE'],
    route: 'jobs',
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log(`Http function processed request for url "${request.url}"`);

        const jobId = request.query.get('id');
        return await JobsController.deleteJob(request, jobId, context);
    }
})

app.http('updateJob', {
    methods: ['PATCH'],
    route: 'jobs',
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log(`Http function processed request for url "${request.url}"`);
        try {         
            return await JobsController.updateJob(request.params, context);
        } catch(err) {
            console.log("Error in route: " + err)
            return { status: 403, jsonBody: message };
        }
    }
})

app.http('smartsheet', {
    methods: ['GET'],
    route: 'smartsheet',
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log(`Http function processed request for url "${request.url}"`);
        try {         
            return await JobsController.getSmartsheetData(request.params);
        } catch(err) {
            console.log("Error in route: " + err)
            return { status: 403, jsonBody: message };
        }
    }
})
