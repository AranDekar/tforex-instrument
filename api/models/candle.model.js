"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const api = require("api");
const mongoose = api.shared.DataAccess.mongooseInstance;
const schema = new mongoose_1.Schema({
    closeMid: { type: Number },
    closeAsk: { type: Number },
    closeBid: { type: Number },
    complete: { type: Boolean },
    high: { type: Number },
    low: { type: Number },
    open: { type: Number },
    volume: { type: Number },
    time: { type: Date },
    granularity: { type: String },
});
schema.index({ granularity: 1, time: 1 }); // schema level ascending index on time
schema.statics.getAllCandles = async (model, granularityVal) => {
    return model
        .find()
        .where({ granularity: granularityVal })
        .sort({ time: 1 })
        .exec();
};
schema.statics.findLastCandle = async (model, granularityVal) => {
    return model
        .findOne()
        .where({ granularity: granularityVal })
        .sort({ time: -1 })
        .exec();
};
schema.statics.findCandleByTime = async (model, timeVal, granularityVal) => {
    return model
        .findOne({ time: timeVal, granularity: granularityVal })
        .exec();
};
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
exports.audUsdCandlesModel = mongoose.model('aud_usd_candles', schema);
exports.gbpUsdCandlesModel = mongoose.model('gbp_usd_candles', schema);
exports.eurUsdCandlesModel = mongoose.model('eur_usd_candles', schema);
//# sourceMappingURL=candle.model.js.map