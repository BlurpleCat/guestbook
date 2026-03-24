import { DynamoDBClient, CreateTableCommand, DescribeTableCommand } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
  BatchWriteCommand,
} from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";

const TABLE_NAME = "guestbook";
const PARTITION_KEY = "GUESTBOOK";
const MAX_ENTRIES = 100;

const client = new DynamoDBClient({
  endpoint: process.env.DYNAMODB_ENDPOINT,
  region: process.env.AWS_REGION ?? "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "local",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "local",
  },
});

const docClient = DynamoDBDocumentClient.from(client);

let tableReady = false;

export async function ensureTable(): Promise<void> {
  if (tableReady) return;

  try {
    await client.send(new DescribeTableCommand({ TableName: TABLE_NAME }));
    tableReady = true;
  } catch (err: unknown) {
    const error = err as { name?: string };
    if (error.name === "ResourceNotFoundException") {
      await client.send(
        new CreateTableCommand({
          TableName: TABLE_NAME,
          KeySchema: [
            { AttributeName: "pk", KeyType: "HASH" },
            { AttributeName: "sk", KeyType: "RANGE" },
          ],
          AttributeDefinitions: [
            { AttributeName: "pk", AttributeType: "S" },
            { AttributeName: "sk", AttributeType: "S" },
          ],
          BillingMode: "PAY_PER_REQUEST",
        })
      );
      tableReady = true;
    } else {
      throw err;
    }
  }
}

export interface GuestbookEntry {
  pk: string;
  sk: string;
  firstName: string;
  lastName: string;
  createdAt: string;
}

export async function addEntry(firstName: string, lastName: string): Promise<GuestbookEntry> {
  await ensureTable();

  const createdAt = new Date().toISOString();
  const sk = `${createdAt}#${uuidv4()}`;

  const entry: GuestbookEntry = {
    pk: PARTITION_KEY,
    sk,
    firstName,
    lastName,
    createdAt,
  };

  await docClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: entry,
    })
  );

  await trimEntries();

  return entry;
}

export async function getEntries(): Promise<GuestbookEntry[]> {
  await ensureTable();

  const result = await docClient.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: "pk = :pk",
      ExpressionAttributeValues: { ":pk": PARTITION_KEY },
      ScanIndexForward: false,
    })
  );

  return (result.Items ?? []) as GuestbookEntry[];
}

async function trimEntries(): Promise<void> {
  const result = await docClient.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: "pk = :pk",
      ExpressionAttributeValues: { ":pk": PARTITION_KEY },
      ScanIndexForward: true,
    })
  );

  const items = (result.Items ?? []) as GuestbookEntry[];

  if (items.length <= MAX_ENTRIES) return;

  const toDelete = items.slice(0, items.length - MAX_ENTRIES);

  // BatchWriteItem supports max 25 items per call
  for (let i = 0; i < toDelete.length; i += 25) {
    const batch = toDelete.slice(i, i + 25);
    await docClient.send(
      new BatchWriteCommand({
        RequestItems: {
          [TABLE_NAME]: batch.map((item) => ({
            DeleteRequest: {
              Key: { pk: item.pk, sk: item.sk },
            },
          })),
        },
      })
    );
  }
}
