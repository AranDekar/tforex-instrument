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
const instrument = require("../../instrument");
function getCandles(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let result = [];
            let instrument;
            let granularity;
            let timeFrom;
            let timeTo;
            instrument = req.swagger.params.instrument.value;
            granularity = req.swagger.params.granularity.value;
            timeFrom = req.swagger.params.timeFrom.value;
            timeTo = req.swagger.params.timeTo.value;
            let service = new api.Service.CandleService();
            if (!instrument || !granularity || !timeFrom) {
                throw new Error('arguments are not supplied!');
            }
            let data = yield service.get(instrument, granularity, timeFrom, timeTo);
            res.json(data);
        }
        catch (err) {
            res.statusCode = 500; // bad server
            next(err);
        }
    });
}
exports.getCandles = getCandles;
function importCandles(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let body = req.body;
        if (!body) {
            throw new Error('body is undefined');
        }
        try {
            let instrumentService = new instrument.InstrumentService();
            let instrumentItem = yield instrumentService.getByTitle(body.instrument);
            if (instrumentItem.granularities.indexOf(body.granularity) === -1) {
                instrumentItem.granularities.push(body.granularity);
                yield instrumentItem.save();
            }
            let service = new api.Service.CandleSyncService();
            service.instrument = body.instrument;
            service.granularity = body.granularity;
            yield service.sync();
            res.json({ message: 'candles are being synced' });
        }
        catch (err) {
            res.statusCode = 500; // internal server error
            next(err);
        }
    });
}
exports.importCandles = importCandles;
function getHistoryData(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let instrument;
            let granularity;
            let topic;
            topic = req.swagger.params.topic.value;
            instrument = req.swagger.params.instrument.value;
            granularity = req.swagger.params.granularity.value;
            let service = new api.Service.CandleService();
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
