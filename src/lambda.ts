import { Handler } from 'aws-lambda';
import { DynamoDB } from 'aws-sdk';
import { v1 } from 'uuid';

interface IBody {
    nickname: string;
    score: number;
}

const dbCfg = {
    endpoint: 'http://localhost:25678',
    region: 'localhost',
    apiVersion: '2012-08-10',
};

// Export the handler : the entry point of the Lambda function
export const create: Handler<{ body: any }> = async event => {
    const timestamp = new Date().getTime();
    const data: IBody = JSON.parse(event.body);
    if (
        typeof data !== 'object' ||
        typeof data.nickname !== 'string' ||
        typeof data.score !== 'number'
    ) {
        return { statusCode: 400, error: 'Bad Request' };
    }

    const dynamoDb = new DynamoDB.DocumentClient(dbCfg);
    const params = {
        TableName: 'testme', // process.env.DYNAMODB_TABLE,
        Item: {
            id: v1(),
            nickname: data.nickname,
            score: data.score,
            checked: false,
            createdAt: timestamp,
            updatedAt: timestamp,
        },
    };

    try {
        dynamoDb.get({ TableName: 'testme', Key: {} }, (err, data) => {
            console.log({ err });
            console.log({ data });
        });
        // const result = await dynamoDb.put(params).promise();
        return { statusCode: 200, body: JSON.stringify({}) };
        // return { statusCode: 200, body: JSON.stringify({}) };
    } catch (error) {
        // tslint:disable-next-line: no-console
        console.error(error.message, error.stack);
        return {
            statusCode: 400,
            error: `Could not post, ${error.message}`,
        };
    }
};

const put = () =>
    create(
        { body: JSON.stringify({ nickname: 'mynick', score: 1235 }) },
        null as any,
        () => undefined,
    );

const createTable = () => {
    const params = {
        AttributeDefinitions: [
            {
                AttributeName: 'nickname',
                AttributeType: 'S',
            },
            {
                AttributeName: 'score',
                AttributeType: 'N',
            },
        ],
        KeySchema: [
            {
                AttributeName: 'nickname',
                KeyType: 'HASH',
            },
            {
                AttributeName: 'score',
                KeyType: 'RANGE',
            },
        ],
        ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5,
        },
        TableName: 'testme',
    };
    const db = new DynamoDB(dbCfg);
    db.createTable(params, (err, data) => {
        console.error({ err });
        console.log({ data });
    });
};

const list = async () => {
    const db = new DynamoDB(dbCfg);
    const tables = await db.listTables().promise();
    console.log(tables);
};

// // createTable();
// list();
put();
