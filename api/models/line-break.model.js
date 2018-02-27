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
const mongoose = api.shared.DataAccess.mongooseInstance;
const schema = new mongoose_1.Schema({
    open: { type: Number },
    close: { type: Number },
    complete: { type: Boolean },
    volume: { type: Number },
    time: { type: String },
    granularity: { type: String },
    color: { type: String, enum: ['white', 'red'] },
    number: { type: Number },
});
schema.index({ time: 1 }); // schema level ascending index on time
schema.statics.findPrevious = (model, time, granularityVal) => __awaiter(this, void 0, void 0, function* () {
    return model
        .findOne({ granularity: granularityVal, time: { $lt: time } })
        .sort({ time: -1 })
        .exec();
});
schema.statics.findLimit = (model, time, granularityVal, limit) => __awaiter(this, void 0, void 0, function* () {
    return model
        .find({ granularity: granularityVal, time: { $lte: time } })
        .sort({ time: -1 })
        .limit(limit)
        .exec();
});
class LineBreaks {
}
LineBreaks.audUsd = mongoose.model('aud-usd-line-break', schema);
LineBreaks.gbpUsd = mongoose.model('gbp-usd-line-break', schema);
LineBreaks.eurUsd = mongoose.model('eur-usd-line-break', schema);
exports.LineBreaks = LineBreaks;
//# sourceMappingURL=line-break.model.js.map