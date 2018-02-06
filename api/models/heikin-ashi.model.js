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
    time: { type: String },
    granularity: { type: String },
});
schema.index({ time: 1 }); // schema level ascending index on time
schema.statics.findPrevious = async (model, time, granularityVal) => {
    return model
        .findOne({ granularity: granularityVal, time: { $lt: time } })
        .sort({ time: -1 })
        .exec();
};
class HeikinAshis {
}
HeikinAshis.audUsd = mongoose.model('aud-usd-heikin-ashi', schema);
HeikinAshis.gbpUsd = mongoose.model('gbp-usd-heikin-ashi', schema);
HeikinAshis.eurUsd = mongoose.model('eur-usd-heikin-ashi', schema);
exports.HeikinAshis = HeikinAshis;
//# sourceMappingURL=heikin-ashi.model.js.map