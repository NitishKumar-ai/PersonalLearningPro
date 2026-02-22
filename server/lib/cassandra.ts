import { Client } from "cassandra-driver";
import path from "path";

let client: Client | null = null;

export function getCassandraClient() {
  if (client) return client;

  const bundlePath = process.env.ASTRA_DB_SECURE_BUNDLE_PATH;
  const token = process.env.ASTRA_DB_APPLICATION_TOKEN;
  const keyspace = process.env.ASTRA_DB_KEYSPACE;

  if (!bundlePath || !token || !keyspace) {
    console.warn("Astra DB credentials not fully configured. Cassandra client not initialized.");
    return null;
  }

  client = new Client({
    cloud: {
      secureConnectBundle: path.resolve(bundlePath),
    },
    credentials: {
      username: "token",
      password: token,
    },
    keyspace: keyspace,
  });

  return client;
}

export async function initCassandra() {
  const c = getCassandraClient();
  if (!c) return;

  const keyspace = process.env.ASTRA_DB_KEYSPACE;

  try {
    await c.connect();
    console.log(`Connected to Astra DB (Cassandra) - Keyspace: ${keyspace}`);
    
    // Create messages table if it doesn't exist
    // Partitioned by channel_id, clustered by message_id (Snowflake)
    await c.execute(`
      CREATE TABLE IF NOT EXISTS messages (
        channel_id text,
        message_id text,
        author_id bigint,
        content text,
        attachments list<text>,
        timestamp timestamp,
        PRIMARY KEY (channel_id, message_id)
      ) WITH CLUSTERING ORDER BY (message_id DESC);
    `);
    
    console.log("Cassandra 'messages' table verified.");
  } catch (err) {
    console.error("Failed to connect to Astra DB:", err);
  }
}
