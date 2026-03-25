import { type Db, MongoClient } from "mongodb";
import { mongoConfig } from "./settings.js";

let _connection: MongoClient | undefined;
let _db: Db | undefined;

const dbConnection = async (): Promise<Db> => {
  if (!_connection) {
    _connection = await MongoClient.connect(mongoConfig.serverUrl);
    _db = _connection.db(mongoConfig.database);
  }

  if (!_db) {
    throw new Error("Database connection failed");
  }

  return _db;
};

const closeConnection = async (): Promise<void> => {
  if (_connection) {
    await _connection.close();
  }
};

export { dbConnection, closeConnection };
