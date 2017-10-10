"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const api = require("../../api");
let mongoose = api.shared.DataAccess.mongooseInstance;
let schema = new mongoose_1.Schema({
    displayName: String,
    halted: Boolean,
    title: String,
    marginRate: Number,
    maxTradeUnits: Number,
    maxTrailingStop: Number,
    minTrailingStop: Number,
    pip: String,
    precision: String,
    granularities: [{ type: String, enum: ['M5'] }],
    path: { type: String, default: null },
});
exports.instrumentModel = mongoose.model('instruments', schema);
//# sourceMappingURL=instrument.model.js.map