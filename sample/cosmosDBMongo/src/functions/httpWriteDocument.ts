// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import { app, HttpRequest, HttpResponseInit, InvocationContext, output } from '@azure/functions';

const cosmosOutput = output.cosmosDBMongo({
    connectionStringSetting: 'CosmosDBMongo',
    databaseName: 'SampleDB',
    collectionName: 'Items',
    createIfNotExists: true,
});

app.http('httpWriteDocument', {
    methods: ['POST'],
    authLevel: 'anonymous',
    extraOutputs: [cosmosOutput],
    handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
        const body = await request.json();
        context.log('Writing document to CosmosDB Mongo:', JSON.stringify(body));
        context.extraOutputs.set(cosmosOutput, body);

        return {
            status: 201,
            jsonBody: { message: 'Document written successfully', document: body },
        };
    },
});
