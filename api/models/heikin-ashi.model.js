"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const api = require("../../api");
const mongoose = api.shared.DataAccess.mongooseInstance;
const schema = new mongoose_1.Schema({
    close: { type: Number },
    complete: { type: Boolean },
    high: { type: Number },
    low: { type: Number },
    open: { type: Number },
    volume: { type: Number },
    time: { type: Date },
    granularity: { type: String },
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
exports.audUsdHeikinAshisModel = mongoose.model('aud_usd_heikin_ashis', schema);
exports.gbpUsdHeikinAshisModel = mongoose.model('gbp_usd_heikin_ashis', schema);
exports.eurUsdHeikinAshisModel = mongoose.model('eur_usd_heikin_ashis', schema);
//# sourceMappingURL=heikin-ashi.model.js.map