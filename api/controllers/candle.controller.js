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
const api = require("../../api");
function getCandles(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let result;
            let instrument;
            let granularity;
            let topic;
            instrument = req.swagger.params.instrument.value;
            granularity = req.swagger.params.granularity.value;
            topic = req.swagger.params.topic.value;
            let service = new api.services.CandleService();
            let count = yield service.publish(instrument, granularity, topic);
            res.status(200).json({ count: count });
        }
        catch (err) {
            res.statusCode = 500; // bad server
            next(err);
        }
    });
}
exports.getCandles = getCandles;
//# sourceMappingURL=candle.controller.js.map