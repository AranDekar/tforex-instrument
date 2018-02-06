"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const api = require("api");
const mongoose = api.shared.DataAccess.mongooseInstance;
const schema = new mongoose_1.Schema({
    close: { type: Number },
    complete: { type: Boolean },
    high: { type: Number },
    low: { type: Number },
    open: { type: Number },
    volume: { type: Number },
    time: { type: String },
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
class Candles {
}
Candles.audUsd = mongoose.model('aud-usd-candles', schema);
Candles.gbpUsd = mongoose.model('gbp-usd-candles', schema);
Candles.eurUsd = mongoose.model('eur-usd-candles', schema);
exports.Candles = Candles;
//# sourceMappingURL=candle.model.js.map