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
const api = require("../../candle");
function getCandles(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let result;
            let instrument;
            let granularity;
            instrument = req.swagger.params.instrument.value;
            granularity = req.swagger.params.granularity.value;
            let service = new api.services.CandleService();
            let data = yield service.get(instrument, granularity);
            if (data) {
                res.status(200).json(data);
            }
            else {
                res.statusCode = 404;
                next(new Error('Not found'));
            }
        }
        catch (err) {
            res.statusCode = 500; // bad server
            next(err);
        }
    });
}
exports.getCandles = getCandles;
function getHistoryData(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let instrument;
            let granularity;
            let topic;
            topic = req.swagger.params.topic.value;
            instrument = req.swagger.params.instrument.value;
            granularity = req.swagger.params.granularity.value;
            let service = new api.services.CandleService();
            yield service.getHistoryData(topic, instrument, granularity);
            res.status(200).json({ message: 'candles are being published' });
        }
        catch (err) {
            res.statusCode = 500; // bad server
            next(err);
        }
    });
}
exports.getHistoryData = getHistoryData;

//# sourceMappingURL=candle.controller.js.map
