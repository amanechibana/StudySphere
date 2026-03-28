import type { Collection, Document } from "mongodb";
import { dbConnection } from "./mongoConnection.js";
import type { NewRoom } from "../types/room.interface.js";

const getCollectionFn =
  <T extends Document>(collection: string) => {
    let _col: Collection<T> | undefined;

    return async (): Promise<Collection<T>> => {
      if (!_col) {
        const db = await dbConnection();
        _col = db.collection<T>(collection);
      }

      return _col;
    };
  };

export const rooms = getCollectionFn<NewRoom>("rooms");
