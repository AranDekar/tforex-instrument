"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const shared = require("../shared");
class DataAccess {
    static connect() {
        if (DataAccess.mongooseInstance) {
            return DataAccess.mongooseInstance;
        }
        // mongoose
        this.mongooseInstance = new mongoose_1.Mongoose();
        this.mongooseInstance.Promise = global.Promise;
        this.mongooseInstance.connection.once('open', () => {
            console.log('Conected to mongodb.');
        });
        this.mongooseInstance.connect(shared.Config.settings.mongo_db_connection_string);
        // mongoose-backup
        this.mongooseBackupInstance = new mongoose_1.Mongoose();
        this.mongooseBackupInstance.Promise = global.Promise;
        this.mongooseBackupInstance.connection.once('open', () => {
            console.log('Conected to mongodb-backup.');
        });
        this.mongooseBackupInstance.connect(shared.Config.settings.mongo_db_backup_connection_string);
        return this.mongooseInstance;
    }
    constructor() {
        DataAccess.connect();
    }
}
exports.DataAccess = DataAccess;
DataAccess.connect();
//# sourceMappingURL=data-access.js.map