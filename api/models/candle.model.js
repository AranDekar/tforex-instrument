"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
schema.statics.getAllCandles = (model, granularityVal) => __awaiter(this, void 0, void 0, function* () {
    return model
        .find()
        .where({ granularity: granularityVal })
        .sort({ time: 1 })
        .exec();
});
schema.statics.findLastCandle = (model, granularityVal) => __awaiter(this, void 0, void 0, function* () {
    return model
        .findOne()
        .where({ granularity: granularityVal })
        .sort({ time: -1 })
        .exec();
});
schema.statics.findCandleByTime = (model, timeVal, granularityVal) => __awaiter(this, void 0, void 0, function* () {
    return model
        .findOne({ time: timeVal, granularity: granularityVal })
        .exec();
});
schema.statics.findPrevious = (model, time, granularityVal) => __awaiter(this, void 0, void 0, function* () {
    return model
        .findOne({ granularity: granularityVal, time: { $lt: time } })
        .sort({ time: -1 })
        .exec();
});
schema.statics.findLimit = (model, time, granularityVal, limit) => __awaiter(this, void 0, void 0, function* () {
    return model
        .find({ granularity: granularityVal, time: { $lt: time } })
        .sort({ time: -1 })
        .limit(limit)
        .exec();
});
class Candles {
}
Candles.audUsd = mongoose.model('aud-usd-candles', schema);
Candles.gbpUsd = mongoose.model('gbp-usd-candles', schema);
Candles.eurUsd = mongoose.model('eur-usd-candles', schema);
exports.Candles = Candles;
//# sourceMappingURL=candle.model.js.map