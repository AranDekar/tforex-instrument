"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator];
    return m ? m.call(o) : typeof __values === "function" ? __values(o) : o[Symbol.iterator]();
};
var __await = (this && this.__await) || function (v) { return this instanceof __await ? (this.v = v, this) : new __await(v); }
var __asyncDelegator = (this && this.__asyncDelegator) || function (o) {
    var i, p;
    return i = {}, verb("next"), verb("throw", function (e) { throw e; }), verb("return"), i[Symbol.iterator] = function () { return this; }, i;
    function verb(n, f) { if (o[n]) i[n] = function (v) { return (p = !p) ? { value: __await(o[n](v)), done: n === "return" } : f ? f(v) : v; }; }
};
var __asyncGenerator = (this && this.__asyncGenerator) || function (thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
    function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r);  }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
};
Object.defineProperty(exports, "__esModule", { value: true });
// const talib = require('talib/build/Release/talib');
// console.log('TALIB version: ' + talib.version);
// const tulind = require('tulind/lib/binding/Release/node-v59-darwin-x64/tulind');
const tulind = require("tulind");
const api = require("api");
const enums_1 = require("../enums");
console.log('TULIND version: ' + tulind.version);
Symbol.asyncIterator = Symbol.asyncIterator || Symbol.for('Symbol.asyncIterator');
class InstrumentEventProducerService {
    constructor(isBackupStateEnabled = false) {
        this.isBackupStateEnabled = isBackupStateEnabled;
        this.toFix = (num) => Number(num.toFixed(5));
    }
    /*
    / candles are the source for this class, so when this class is used,
    / it works based on the existing candles in the DB, and then it provides events
    / an event may be a new Heikin Ashi candle in the DB.
    */
    produceNewEvents(instrument) {
        return __awaiter(this, void 0, void 0, function* () {
            const candleService = new api.services.CandleService();
            this.candleModel = candleService.getModel(instrument);
            this.heikinAshiModel = candleService.getHeikinAshiModel(instrument);
            this.lineBreakModel = candleService.getLineBreakModel(instrument);
            this.instrumentEventModel = this.getInstrumentEventModel(instrument);
            const lastEvent = yield this.instrumentEventModel.findLastEvent(this.instrumentEventModel);
            let lastCandles;
            if (lastEvent) {
                lastCandles = yield this.candleModel.find({ time: { $gt: lastEvent.candleTime } }).sort({ time: 1 });
            }
            else {
                lastCandles = yield this.candleModel.find().sort({ time: 1 });
            }
            const arrayOfEvents = [];
            for (const currCandle of lastCandles) {
                try {
                    for (var _a = __asyncValues(this.raiseEvents(currCandle)), _b; _b = yield _a.next(), !_b.done;) {
                        const event = yield _b.value;
                        arrayOfEvents.push(event);
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (_b && !_b.done && (_c = _a.return)) yield _c.call(_a);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
                // process candle and provide event
                switch (currCandle.granularity) {
                    case api.enums.GranularityEnum.M5:
                        break;
                    case api.enums.GranularityEnum.M15:
                        break;
                    case api.enums.GranularityEnum.M30:
                        break;
                    case api.enums.GranularityEnum.H1:
                        break;
                    case api.enums.GranularityEnum.H4:
                        break;
                    case api.enums.GranularityEnum.D:
                        break;
                }
            }
            return arrayOfEvents;
            var e_1, _c;
        });
    }
    saveNewEvents(instrument, instruments) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.instrumentEventModel) {
                this.instrumentEventModel = this.getInstrumentEventModel(instrument);
            }
            yield this.instrumentEventModel.create(instruments);
        });
    }
    publishNewEvents(instrument) {
        return __awaiter(this, void 0, void 0, function* () {
            const instrumentEventModel = this.getInstrumentEventModel(instrument);
            if (!instrumentEventModel) {
                throw new Error('instrument event model is undefined in InstrumentEventProducerService!');
            }
            const unPublishedEvents = yield instrumentEventModel.findUndispatchedEvents(instrumentEventModel);
            const publisher = new api.proxies.InstrumentEventProducerProxy(api.enums.InstrumentEnum[instrument]);
            publisher.publish(unPublishedEvents);
        });
    }
    getInstrumentEventModel(instrument) {
        if (this.isBackupStateEnabled) {
            switch (instrument) {
                case api.enums.InstrumentEnum.AUD_USD:
                    return api.models.audUsdBackupEvents;
                case api.enums.InstrumentEnum.GBP_USD:
                    return api.models.gbpUsdBackupEvents;
                case api.enums.InstrumentEnum.EUR_USD:
                    return api.models.eurUsdBackupEvents;
            }
        }
        else {
            switch (instrument) {
                case api.enums.InstrumentEnum.AUD_USD:
                    return api.models.audUsdEvents;
                case api.enums.InstrumentEnum.GBP_USD:
                    return api.models.gbpUsdEvents;
                case api.enums.InstrumentEnum.EUR_USD:
                    return api.models.eurUsdEvents;
            }
        }
        throw new Error(`instrumentEvent model is undefined for ${instrument}`);
    }
    findInstrumentEventTopicName(instrument, granularity) {
        return (`${instrument}-${granularity}`);
    }
    raiseEvents(candle) {
        return __asyncGenerator(this, arguments, function* raiseEvents_1() {
            yield __await(yield* __asyncDelegator(__asyncValues(this.raiseCandle(candle))));
            yield __await(yield* __asyncDelegator(__asyncValues(this.raiseHeikinAshi(candle))));
            yield __await(yield* __asyncDelegator(__asyncValues(this.raiseLineBreak(candle))));
        });
    }
    raiseCandle(candle) {
        return __asyncGenerator(this, arguments, function* raiseCandle_1() {
            yield {
                event: enums_1.InstrumentEventEnum[`${candle.granularity.toLowerCase()}_closed`],
                eventTime: new Date(),
                candleTime: candle.time,
                candleBid: candle.closeBid,
                candleAsk: candle.closeAsk,
                isDispatched: false,
                payload: candle,
            };
            yield __await(yield* __asyncDelegator(__asyncValues(this.raiseSma(candle, 20))));
            yield __await(yield* __asyncDelegator(__asyncValues(this.raiseSma(candle, 50))));
            yield __await(yield* __asyncDelegator(__asyncValues(this.raiseEma(candle, 20))));
            yield __await(yield* __asyncDelegator(__asyncValues(this.raiseEma(candle, 50))));
            yield __await(yield* __asyncDelegator(__asyncValues(this.raiseMacd(candle))));
        });
    }
    raiseHeikinAshi(candle) {
        return __asyncGenerator(this, arguments, function* raiseHeikinAshi_1() {
            const xPrevious = yield __await(this.heikinAshiModel.findPrevious(this.heikinAshiModel, candle.time, candle.granularity));
            const xClose = this.toFix((candle.open + candle.closeMid + candle.high + candle.low) / 4);
            const xOpen = xPrevious ? this.toFix((xPrevious.open + xPrevious.close) / 2) : xClose;
            const xHigh = Math.max(candle.high, xOpen, xClose);
            const xLow = Math.min(candle.low, xOpen, xClose);
            const newLocal = {
                open: xOpen,
                close: xClose,
                complete: candle.complete,
                time: candle.time,
                volume: candle.volume,
                granularity: candle.granularity,
                high: xHigh,
                low: xLow,
            };
            const model = new this.heikinAshiModel(newLocal);
            yield __await(model.save());
            yield {
                event: enums_1.InstrumentEventEnum[`${candle.granularity.toLowerCase()}_heikin_ashi_closed`],
                eventTime: new Date(),
                candleTime: candle.time,
                candleBid: candle.closeBid,
                candleAsk: candle.closeAsk,
                isDispatched: false,
                payload: newLocal,
            };
            yield __await(yield* __asyncDelegator(__asyncValues(this.raiseSmaHeikinAshi(candle, 20))));
            yield __await(yield* __asyncDelegator(__asyncValues(this.raiseSmaHeikinAshi(candle, 50))));
            yield __await(yield* __asyncDelegator(__asyncValues(this.raiseEmaHeikinAshi(candle, 20))));
            yield __await(yield* __asyncDelegator(__asyncValues(this.raiseEmaHeikinAshi(candle, 50))));
        });
    }
    raiseLineBreak(candle) {
        return __asyncGenerator(this, arguments, function* raiseLineBreak_1() {
            let newLocal;
            const xLines = yield __await(this.lineBreakModel.findLimit(this.lineBreakModel, candle.time, candle.granularity, 3));
            if (xLines.length === 0) {
                // new line in white
                newLocal = {
                    open: candle.open,
                    number: 1,
                    close: candle.closeMid,
                    complete: candle.complete,
                    time: candle.time,
                    volume: candle.volume,
                    granularity: candle.granularity,
                    color: candle.closeMid > candle.open ? 'white' : 'red',
                };
            }
            else {
                const closes = xLines.map((x) => x.close);
                const opens = xLines.map((x) => x.open);
                const bottom = Math.min(...opens, ...closes);
                const top = Math.max(...opens, ...closes);
                if (candle.closeMid > top) {
                    // new line in white
                    const xOpen = xLines[0].color === 'white' ? xLines[0].close : xLines[0].open;
                    const xNumber = xLines[0].color === 'white' ? xLines[0].number + 1 : 1;
                    newLocal = {
                        open: xOpen,
                        number: xNumber,
                        close: candle.closeMid,
                        complete: candle.complete,
                        time: candle.time,
                        volume: candle.volume,
                        granularity: candle.granularity,
                        color: 'white',
                    };
                }
                else if (candle.closeMid < bottom) {
                    // new line in red
                    const xOpen = xLines[0].color === 'red' ? xLines[0].close : xLines[0].open;
                    const xNumber = xLines[0].color === 'red' ? xLines[0].number + 1 : 1;
                    newLocal = {
                        open: xOpen,
                        number: xNumber,
                        close: candle.closeMid,
                        complete: candle.complete,
                        time: candle.time,
                        volume: candle.volume,
                        granularity: candle.granularity,
                        color: 'red',
                    };
                }
                else {
                    // do nothing
                    return;
                }
            }
            const model = new this.lineBreakModel(newLocal);
            yield __await(model.save());
            yield {
                event: enums_1.InstrumentEventEnum[`${candle.granularity.toLowerCase()}_line_break_closed`],
                eventTime: new Date(),
                candleTime: candle.time,
                candleBid: candle.closeBid,
                candleAsk: candle.closeAsk,
                isDispatched: false,
                payload: newLocal,
            };
            yield __await(yield* __asyncDelegator(__asyncValues(this.raiseSmaLineBreak(candle, 20))));
            yield __await(yield* __asyncDelegator(__asyncValues(this.raiseSmaLineBreak(candle, 50))));
            yield __await(yield* __asyncDelegator(__asyncValues(this.raiseEmaLineBreak(candle, 20))));
            yield __await(yield* __asyncDelegator(__asyncValues(this.raiseEmaLineBreak(candle, 50))));
        });
    }
    raiseMacd(candle) {
        return __asyncGenerator(this, arguments, function* raiseMacd_1() {
            const xCandles = yield __await(this.candleModel.findLimit(this.candleModel, candle.time, candle.granularity, 40));
            const closes = xCandles.map((x) => x.closeMid);
            if (closes.length < 26) {
                return;
            }
            // tslint:disable-next-line:space-before-function-paren
            yield new Promise((resolve) => {
                tulind.indicators.macd.indicator([closes], [12, 26, 9], (err, results) => {
                    resolve({
                        event: enums_1.InstrumentEventEnum[`${candle.granularity.toLowerCase()}_macd_changed`],
                        eventTime: new Date(),
                        candleTime: candle.time,
                        candleBid: candle.closeBid,
                        candleAsk: candle.closeAsk,
                        isDispatched: false,
                        payload: {
                            macd: this.toFix(results[0][results[0].length - 1]),
                            macd_signal: this.toFix(results[1][results[1].length - 1]),
                            macd_histogram: this.toFix(results[2][results[2].length - 1]),
                        },
                    });
                });
            });
        });
    }
    raiseSma(candle, period) {
        return __asyncGenerator(this, arguments, function* raiseSma_1() {
            const xCandles = yield __await(this.candleModel.findLimit(this.candleModel, candle.time, candle.granularity, period));
            const closes = xCandles.map((x) => x.closeMid);
            if (closes.length < period) {
                return;
            }
            // tslint:disable-next-line:space-before-function-paren
            yield new Promise((resolve) => {
                tulind.indicators.sma.indicator([closes], [period], (err, results) => {
                    resolve({
                        event: enums_1.InstrumentEventEnum[`${candle.granularity.toLowerCase()}_sma_changed`],
                        eventTime: new Date(),
                        candleTime: candle.time,
                        candleBid: candle.closeBid,
                        candleAsk: candle.closeAsk,
                        isDispatched: false,
                        payload: { result: this.toFix(results[0][results[0].length - 1]), period },
                    });
                });
            });
        });
    }
    raiseEma(candle, period) {
        return __asyncGenerator(this, arguments, function* raiseEma_1() {
            const xCandles = yield __await(this.candleModel.findLimit(this.candleModel, candle.time, candle.granularity, period));
            const closes = xCandles.map((x) => x.closeMid);
            // tslint:disable-next-line:space-before-function-paren
            yield new Promise((resolve) => {
                tulind.indicators.ema.indicator([closes], [period], (err, results) => {
                    resolve({
                        event: enums_1.InstrumentEventEnum[`${candle.granularity.toLowerCase()}_ema_changed`],
                        eventTime: new Date(),
                        candleTime: candle.time,
                        candleBid: candle.closeBid,
                        candleAsk: candle.closeAsk,
                        isDispatched: false,
                        payload: { result: this.toFix(results[0][results[0].length - 1]), period },
                    });
                });
            });
        });
    }
    raiseSmaHeikinAshi(candle, period) {
        return __asyncGenerator(this, arguments, function* raiseSmaHeikinAshi_1() {
            const xCandles = yield __await(this.heikinAshiModel.findLimit(this.heikinAshiModel, candle.time, candle.granularity, period));
            const closes = xCandles.map((x) => x.close);
            if (closes.length < period) {
                return;
            }
            // tslint:disable-next-line:space-before-function-paren
            yield new Promise((resolve) => {
                tulind.indicators.sma.indicator([closes], [period], (err, results) => {
                    resolve({
                        event: enums_1.InstrumentEventEnum[`${candle.granularity.toLowerCase()}_heikin_ashi_sma_changed`],
                        eventTime: new Date(),
                        candleTime: candle.time,
                        candleBid: candle.closeBid,
                        candleAsk: candle.closeAsk,
                        isDispatched: false,
                        payload: { result: this.toFix(results[0][results[0].length - 1]), period },
                    });
                });
            });
        });
    }
    raiseEmaHeikinAshi(candle, period) {
        return __asyncGenerator(this, arguments, function* raiseEmaHeikinAshi_1() {
            const xCandles = yield __await(this.heikinAshiModel.findLimit(this.heikinAshiModel, candle.time, candle.granularity, period));
            const closes = xCandles.map((x) => x.close);
            // tslint:disable-next-line:space-before-function-paren
            yield new Promise((resolve) => {
                tulind.indicators.ema.indicator([closes], [period], (err, results) => {
                    resolve({
                        event: enums_1.InstrumentEventEnum[`${candle.granularity.toLowerCase()}_heikin_ashi_ema_changed`],
                        eventTime: new Date(),
                        candleTime: candle.time,
                        candleBid: candle.closeBid,
                        candleAsk: candle.closeAsk,
                        isDispatched: false,
                        payload: { result: this.toFix(results[0][results[0].length - 1]), period },
                    });
                });
            });
        });
    }
    raiseSmaLineBreak(candle, period) {
        return __asyncGenerator(this, arguments, function* raiseSmaLineBreak_1() {
            const xCandles = yield __await(this.lineBreakModel.findLimit(this.lineBreakModel, candle.time, candle.granularity, period));
            const closes = xCandles.map((x) => x.close);
            if (closes.length < period) {
                return;
            }
            // tslint:disable-next-line:space-before-function-paren
            yield new Promise((resolve) => {
                tulind.indicators.sma.indicator([closes], [period], (err, results) => {
                    resolve({
                        event: enums_1.InstrumentEventEnum[`${candle.granularity.toLowerCase()}_line_break_sma_changed`],
                        eventTime: new Date(),
                        candleTime: candle.time,
                        candleBid: candle.closeBid,
                        candleAsk: candle.closeAsk,
                        isDispatched: false,
                        payload: { result: this.toFix(results[0][results[0].length - 1]), period },
                    });
                });
            });
        });
    }
    raiseEmaLineBreak(candle, period) {
        return __asyncGenerator(this, arguments, function* raiseEmaLineBreak_1() {
            const xCandles = yield __await(this.lineBreakModel.findLimit(this.lineBreakModel, candle.time, candle.granularity, period));
            const closes = xCandles.map((x) => x.close);
            // tslint:disable-next-line:space-before-function-paren
            yield new Promise((resolve) => {
                tulind.indicators.ema.indicator([closes], [period], (err, results) => {
                    resolve({
                        event: enums_1.InstrumentEventEnum[`${candle.granularity.toLowerCase()}_line_break_ema_changed`],
                        eventTime: new Date(),
                        candleTime: candle.time,
                        candleBid: candle.closeBid,
                        candleAsk: candle.closeAsk,
                        isDispatched: false,
                        payload: { result: this.toFix(results[0][results[0].length - 1]), period },
                    });
                });
            });
        });
    }
}
exports.InstrumentEventProducerService = InstrumentEventProducerService;
//# sourceMappingURL=instrument-event-producer.service.js.map