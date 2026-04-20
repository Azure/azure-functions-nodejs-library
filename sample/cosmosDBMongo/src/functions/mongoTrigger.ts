// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import { app, InvocationContext } from '@azure/functions';

app.cosmosDBMongo('mongoTrigger', {
    connectionStringSetting: 'CosmosDBMongo',
    databaseName: 'SampleDB',
    collectionName: 'Items',
    createIfNotExists: true,
    handler: (documents: unknown, context: InvocationContext) => {
        context.log('CosmosDB Mongo trigger fired');
        context.log('Changed documents:', JSON.stringify(documents, null, 2));
    },
});
