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
const api = require("../../api");
let mongoose = api.shared.DataAccess.mongooseInstance;
let schema = new mongoose_1.Schema({
    closeAsk: { type: Number },
    closeBid: { type: Number },
    complete: { type: Boolean },
    highAsk: { type: Number },
    highBid: { type: Number },
    lowAsk: { type: Number },
    lowBid: { type: Number },
    openAsk: { type: Number },
    openBid: { type: Number },
    volume: { type: Number },
    time: { type: String },
    isDispatched: { type: Boolean, default: false },
});
schema.index({ time: 1 }); // schema level ascending index on time
schema.statics.getAllCandles = (model) => __awaiter(this, void 0, void 0, function* () {
    return model
        .find()
        .sort({ 'time': 1 })
        .exec();
});
schema.statics.findUndispatchedEvents = (model) => __awaiter(this, void 0, void 0, function* () {
    return model
        .find({ isDispatched: false })
        .sort({ 'time': -1 })
        .exec();
});
schema.statics.findLastCandle = (model) => __awaiter(this, void 0, void 0, function* () {
    return model
        .findOne()
        .sort({ 'time': -1 })
        .exec();
});
schema.statics.findCandleByTime = (model, time) => __awaiter(this, void 0, void 0, function* () {
    return model
        .findOne({ time: time })
        .exec();
});
var candles;
(function (candles) {
    candles.audUsdM5 = mongoose.model('audusdm5', schema);
})(candles = exports.candles || (exports.candles = {}));
//# sourceMappingURL=candle.model.js.map