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
    time: { type: String },
});
schema.index({ time: 1 }); // schema level ascending index on time
schema.statics.getAllLineBreaks = async (model) => {
    return model
        .find()
        .sort({ time: 1 })
        .exec();
};
schema.statics.findUndispatchedLineBreaks = async (model) => {
    return model
        .find({ isDispatched: false })
        .sort({ time: -1 })
        .exec();
};
schema.statics.findLastLineBreak = async (model) => {
    return model
        .findOne()
        .sort({ time: -1 })
        .exec();
};
schema.statics.findLineBreakByTime = async (model, time) => {
    return model
        .findOne({ time })
        .exec();
};
class LineBreaks {
}
LineBreaks.audUsd = mongoose.model('aud-usd-line-break', schema);
LineBreaks.gbpUsd = mongoose.model('gbp-usd-line-break', schema);
LineBreaks.eurUsd = mongoose.model('eur-usd-line-break', schema);
exports.LineBreaks = LineBreaks;
//# sourceMappingURL=line-break.model.js.map