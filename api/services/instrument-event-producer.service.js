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
console.log('TULIND version: ' + tulind.version);
Symbol.asyncIterator = Symbol.asyncIterator || Symbol.for('Symbol.asyncIterator');
class InstrumentEventProducerService {
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
            const instrumentEventModel = this.getInstrumentEventModel(instrument);
            const lastEvent = yield instrumentEventModel.findLastEvent(instrumentEventModel);
            const lastCandles = yield this.candleModel.find({ time: { $gt: lastEvent.time } });
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
            yield instrumentEventModel.create(arrayOfEvents);
            var e_1, _c;
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
        switch (instrument) {
            case api.enums.InstrumentEnum.AUD_USD:
                return api.models.audUsdEvents;
            case api.enums.InstrumentEnum.GBP_USD:
                return api.models.gbpUsdEvents;
            case api.enums.InstrumentEnum.EUR_USD:
                return api.models.eurUsdEvents;
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
                event: `${candle.granularity}-closed`,
                time: new Date().toISOString(),
                candleTime: candle.time,
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
            const xClose = (candle.open + candle.close + candle.high + candle.low) / 4;
            const xOpen = (xPrevious.open + xPrevious.close) / 2;
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
                event: `${candle.granularity}-heikin-ashi-closed`,
                time: new Date().toISOString(),
                candleTime: candle.time,
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
            const xLines = yield __await(this.lineBreakModel.findLimit(this.lineBreakModel, candle.time, candle.granularity, 3));
            const closes = xLines.map((x) => x.close);
            const opens = xLines.map((x) => x.open);
            const bottom = Math.min(...opens, ...closes);
            const top = Math.max(...opens, ...closes);
            let newLocal;
            if (candle.close > top) {
                // new line in white
                const xOpen = xLines[0].color === 'white' ? xLines[0].close : xLines[0].open;
                const xNumber = xLines[0].color === 'white' ? xLines[0].number + 1 : 1;
                newLocal = {
                    open: xOpen,
                    number: xNumber,
                    close: candle.close,
                    complete: candle.complete,
                    time: candle.time,
                    volume: candle.volume,
                    granularity: candle.granularity,
                    color: 'white',
                };
            }
            else if (candle.close < bottom) {
                // new line in red
                const xOpen = xLines[0].color === 'red' ? xLines[0].close : xLines[0].open;
                const xNumber = xLines[0].color === 'red' ? xLines[0].number + 1 : 1;
                newLocal = {
                    open: xOpen,
                    number: xNumber,
                    close: candle.close,
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
            const model = new this.lineBreakModel(newLocal);
            yield __await(model.save());
            yield {
                event: `${candle.granularity}-line-break-closed`,
                time: new Date().toISOString(),
                candleTime: candle.time,
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
            const closes = xCandles.map((x) => x.close).concat(candle.close);
            // tslint:disable-next-line:space-before-function-paren
            yield __await(yield* __asyncDelegator(__asyncValues(tulind.indicators.macd.indicator([closes], [12], [26], [9], function (err, results) {
                return __asyncGenerator(this, arguments, function* () {
                    yield {
                        event: `${candle.granularity}-macd-changed`,
                        time: new Date().toISOString(),
                        candleTime: candle.time,
                        isDispatched: false,
                        payload: { result: results[0] },
                    };
                });
            }))));
        });
    }
    raiseSma(candle, period) {
        return __asyncGenerator(this, arguments, function* raiseSma_1() {
            const xCandles = yield __await(this.candleModel.findLimit(this.candleModel, candle.time, candle.granularity, period));
            const closes = xCandles.map((x) => x.close).concat(candle.close);
            // tslint:disable-next-line:space-before-function-paren
            yield __await(yield* __asyncDelegator(__asyncValues(tulind.indicators.sma.indicator([closes], [period], function (err, results) {
                return __asyncGenerator(this, arguments, function* () {
                    yield {
                        event: `${candle.granularity}-sma-changed`,
                        time: new Date().toISOString(),
                        candleTime: candle.time,
                        isDispatched: false,
                        payload: { result: results[0], period },
                    };
                });
            }))));
        });
    }
    raiseEma(candle, period) {
        return __asyncGenerator(this, arguments, function* raiseEma_1() {
            const xCandles = yield __await(this.candleModel.findLimit(this.candleModel, candle.time, candle.granularity, period));
            const closes = xCandles.map((x) => x.close).concat(candle.close);
            // tslint:disable-next-line:space-before-function-paren
            yield __await(yield* __asyncDelegator(__asyncValues(tulind.indicators.ema.indicator([closes], [period], function (err, results) {
                return __asyncGenerator(this, arguments, function* () {
                    yield {
                        event: `${candle.granularity}-ema-changed`,
                        time: new Date().toISOString(),
                        candleTime: candle.time,
                        isDispatched: false,
                        payload: { result: results[0], period },
                    };
                });
            }))));
        });
    }
    raiseSmaHeikinAshi(candle, period) {
        return __asyncGenerator(this, arguments, function* raiseSmaHeikinAshi_1() {
            const xCandles = yield __await(this.heikinAshiModel.findLimit(this.heikinAshiModel, candle.time, candle.granularity, period));
            const closes = xCandles.map((x) => x.close).concat(candle.close);
            // tslint:disable-next-line:space-before-function-paren
            yield __await(yield* __asyncDelegator(__asyncValues(tulind.indicators.sma.indicator([closes], [period], function (err, results) {
                return __asyncGenerator(this, arguments, function* () {
                    yield {
                        event: `${candle.granularity}-heikin-ashi-sma-changed`,
                        time: new Date().toISOString(),
                        candleTime: candle.time,
                        isDispatched: false,
                        payload: { result: results[0], period },
                    };
                });
            }))));
        });
    }
    raiseEmaHeikinAshi(candle, period) {
        return __asyncGenerator(this, arguments, function* raiseEmaHeikinAshi_1() {
            const xCandles = yield __await(this.heikinAshiModel.findLimit(this.heikinAshiModel, candle.time, candle.granularity, period));
            const closes = xCandles.map((x) => x.close).concat(candle.close);
            // tslint:disable-next-line:space-before-function-paren
            yield __await(yield* __asyncDelegator(__asyncValues(tulind.indicators.ema.indicator([closes], [period], function (err, results) {
                return __asyncGenerator(this, arguments, function* () {
                    yield {
                        event: `${candle.granularity}-heikin-ashi-ema-changed`,
                        time: new Date().toISOString(),
                        candleTime: candle.time,
                        isDispatched: false,
                        payload: { result: results[0], period },
                    };
                });
            }))));
        });
    }
    raiseSmaLineBreak(candle, period) {
        return __asyncGenerator(this, arguments, function* raiseSmaLineBreak_1() {
            const xCandles = yield __await(this.lineBreakModel.findLimit(this.lineBreakModel, candle.time, candle.granularity, period));
            const closes = xCandles.map((x) => x.close).concat(candle.close);
            // tslint:disable-next-line:space-before-function-paren
            yield __await(yield* __asyncDelegator(__asyncValues(tulind.indicators.sma.indicator([closes], [period], function (err, results) {
                return __asyncGenerator(this, arguments, function* () {
                    yield {
                        event: `${candle.granularity}-line-break-sma-changed`,
                        time: new Date().toISOString(),
                        candleTime: candle.time,
                        isDispatched: false,
                        payload: { result: results[0], period },
                    };
                });
            }))));
        });
    }
    raiseEmaLineBreak(candle, period) {
        return __asyncGenerator(this, arguments, function* raiseEmaLineBreak_1() {
            const xCandles = yield __await(this.lineBreakModel.findLimit(this.lineBreakModel, candle.time, candle.granularity, period));
            const closes = xCandles.map((x) => x.close).concat(candle.close);
            // tslint:disable-next-line:space-before-function-paren
            yield __await(yield* __asyncDelegator(__asyncValues(tulind.indicators.sma.indicator([closes], [period], function (err, results) {
                return __asyncGenerator(this, arguments, function* () {
                    yield {
                        event: `${candle.granularity}-line-break-sma-changed`,
                        time: new Date().toISOString(),
                        candleTime: candle.time,
                        isDispatched: false,
                        payload: { result: results[0], period },
                    };
                });
            }))));
        });
    }
}
exports.InstrumentEventProducerService = InstrumentEventProducerService;
//# sourceMappingURL=instrument-event-producer.service.js.map