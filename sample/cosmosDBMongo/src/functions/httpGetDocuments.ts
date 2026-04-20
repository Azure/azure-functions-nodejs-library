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
    handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
        const documents = context.extraInputs.get(cosmosInput);
        context.log('Read documents from CosmosDB Mongo:', JSON.stringify(documents));

        return {
            jsonBody: documents,
        };
    },
});
