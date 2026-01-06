import { Db } from '../types/db';
import * as firebaseDB from './dbs/firebase';

const { DB_TYPE } = process.env;

let db: Db;

switch (DB_TYPE) {
    case 'firebase':
        db = firebaseDB as unknown as Db;
        break;
    default:
        db = firebaseDB as unknown as Db;
        break;
}

export default db;