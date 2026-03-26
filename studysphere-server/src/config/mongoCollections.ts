import type { Collection, Document } from "mongodb";
import { dbConnection } from "./mongoConnection.js";

const getCollectionFn = (collection: string) => {
  let _col: Collection<Document> | undefined;

  return async (): Promise<Collection<Document>> => {
    if (!_col) {
      const db = await dbConnection();
      _col = db.collection(collection);
    }

    return _col;
  };
};

// List collections here, e.g.:
export const rooms = getCollectionFn("rooms");
