import { Mongoose } from "mongoose";

import * as api from '../shared';

export class DataAccess {
    public static mongooseInstance: Mongoose;

    public static connect(): Mongoose {
        if (DataAccess.mongooseInstance) {
            return DataAccess.mongooseInstance;
        }

        // mongoose
        this.mongooseInstance = new Mongoose();
        (<any>this.mongooseInstance).Promise = global.Promise;
        this.mongooseInstance.connection.once("open", () => {
            console.log("Conected to mongodb.");
        });
        this.mongooseInstance.connect(api.Config.settings.oanda_access_token_key);
        return this.mongooseInstance;
    }

    constructor() {
        DataAccess.connect();
    }
}

DataAccess.connect();
