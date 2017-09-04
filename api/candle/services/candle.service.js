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
const shared = require("../../shared");
class CandleService {
    get(instrument, granularity, timeFrom, timeTo) {
        return __awaiter(this, void 0, void 0, function* () {
            let candleModel = this.getModel(shared.InstrumentEnum[instrument], granularity);
            if (!candleModel) {
                throw new Error('cannot get the candle model!');
            }
            return yield candleModel.find({ instrument: instrument }).exec();
        });
    }
    getHistoryData(topic, instrument, granularity) {
        return __awaiter(this, void 0, void 0, function* () {
            let candleModel = this.getModel(instrument, granularity);
            if (!candleModel) {
                throw new Error('candle model in undefined in CandleService!');
            }
            let lastCandle = yield candleModel.findLastCandle(candleModel);
            if (!lastCandle) {
                throw new Error('there is no candle to publish please first sync the candles!');
            }
            let endTime = new Date(Number(lastCandle.time)).toISOString();
            if (this.isCandleUpToDate(granularity, endTime) === false) {
                throw new Error(`candles of ${instrument} in ${granularity} are not synced to publish.`);
            }
            let allCandles = yield candleModel.getAllCandles(candleModel);
            if (allCandles.length > 100) {
                allCandles = allCandles.slice(0, 3);
            }
            let producer = new api.Proxy.CandleProducerProxy();
            producer.ProduceHistoryData(topic, allCandles);
        });
    }
    isCandleUpToDate(granularity, endDate) {
        let endTime = new Date(endDate);
        switch (granularity) {
            case shared.GranularityEnum.M5:
                endTime = new Date(endTime.getFullYear(), endTime.getMonth(), endTime.getDate(), endTime.getHours(), endTime.getMinutes() + 10);
                break;
            case shared.GranularityEnum.M15:
                endTime = new Date(endTime.getFullYear(), endTime.getMonth(), endTime.getDate(), endTime.getHours(), endTime.getMinutes() + 30);
                break;
            case shared.GranularityEnum.M30:
                endTime = new Date(endTime.getFullYear(), endTime.getMonth(), endTime.getDate(), endTime.getHours(), endTime.getMinutes() + 60);
                break;
            case shared.GranularityEnum.H1:
                endTime = new Date(endTime.getFullYear(), endTime.getMonth(), endTime.getDate(), endTime.getHours(), endTime.getMinutes() + 120);
                break;
            case shared.GranularityEnum.H4:
                endTime = new Date(endTime.getFullYear(), endTime.getMonth(), endTime.getDate(), endTime.getHours(), endTime.getMinutes() + 480);
                break;
            case shared.GranularityEnum.D1:
                endTime = new Date(endTime.getFullYear(), endTime.getMonth(), endTime.getDate() + 2);
                break;
        }
        if (endTime >= new Date()) {
            return true;
        }
        else {
            return false;
        }
    }
    getModel(instrument, granularity) {
        switch (instrument) {
            case shared.InstrumentEnum.AUD_USD:
                switch (granularity) {
                    case shared.GranularityEnum.M5:
                        return api.Model.candles.audUsdM5;
                }
                break;
        }
    }
}
exports.CandleService = CandleService;

//# sourceMappingURL=candle.service.js.map
