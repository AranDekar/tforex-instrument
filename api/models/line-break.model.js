"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const api = require("../../api");
const mongoose = api.shared.DataAccess.mongooseInstance;
const schema = new mongoose_1.Schema({
    open: { type: Number },
    close: { type: Number },
    complete: { type: Boolean },
    volume: { type: Number },
    time: { type: Date },
    granularity: { type: String },
    color: { type: String, enum: ['white', 'red'] },
    number: { type: Number },
});
schema.index({ time: 1 }); // schema level ascending index on time
schema.statics.findPrevious = async (model, time, granularityVal) => {
    return model
        .findOne({ granularity: granularityVal, time: { $lt: time } })
        .sort({ time: -1 })
        .exec();
};
schema.statics.findLimit = async (model, time, granularityVal, limit) => {
    return model
        .find({ granularity: granularityVal, time: { $lte: time } })
        .sort({ time: -1 })
        .limit(limit)
        .exec();
};
exports.audUsdLineBreaksModel = mongoose.model('aud_usd_line_breaks', schema);
exports.gbpUsdLineBreaksModel = mongoose.model('gbp_usd_line_breaks', schema);
exports.eurUsdLineBreaksModel = mongoose.model('eur_usd_line_breaks', schema);
//# sourceMappingURL=line-break.model.js.map