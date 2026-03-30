import { MongoClient } from "mongodb";

let cachedClient: MongoClient | null = null;
let cachedDb: any = null;

export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error(
        'Configuración faltante: define la variable de entorno "MONGODB_URI".',
      );
    }

    // build options for MongoClient; allow invalid certificates if env var set
    const options: any = {};
    if (uri.startsWith("mongodb+srv://")) {
      options.tls = true;
    }

    if (process.env.MONGODB_TLS_ALLOW_INVALID === "true") {
      options.tlsAllowInvalidCertificates = true;
      // tlsInsecure cannot be used together with tlsAllowInvalidCertificates
      // the driver will throw an error; keeping only the latter.
    }

    const client = new MongoClient(uri, options);
    await client.connect();
    const db = client.db("ControlCajas");

    cachedClient = client;
    cachedDb = db;

    return { client, db };
  } catch (error) {
    console.error("Error connecting to database:", error);
    throw error;
  }
}

export async function closeDatabase() {
  if (cachedClient) {
    await cachedClient.close();
    cachedClient = null;
    cachedDb = null;
  }
}
