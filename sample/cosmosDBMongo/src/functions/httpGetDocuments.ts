// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import { app, HttpRequest, HttpResponseInit, input, InvocationContext } from '@azure/functions';

const cosmosInput = input.cosmosDBMongo({
    connectionStringSetting: 'CosmosDBMongo',
    databaseName: 'SampleDB',
    collectionName: 'Items',
});

app.http('httpGetDocuments', {
    methods: ['GET'],
    authLevel: 'anonymous',
    extraInputs: [cosmosInput],
    handler: (request: HttpRequest, context: InvocationContext): HttpResponseInit => {
        const documents = context.extraInputs.get(cosmosInput);
        context.log('Read documents from CosmosDB Mongo:', JSON.stringify(documents));

        return {
            jsonBody: documents,
        };
    },
});
