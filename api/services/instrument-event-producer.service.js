"use strict";
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator];
    return m ? m.call(o) : typeof __values === "function" ? __values(o) : o[Symbol.iterator]();
};
var __await = (this && this.__await) || function (v) { return this instanceof __await ? (this.v = v, this) : new __await(v); }
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
var __asyncDelegator = (this && this.__asyncDelegator) || function (o) {
    var i, p;
    return i = {}, verb("next"), verb("throw", function (e) { throw e; }), verb("return"), i[Symbol.iterator] = function () { return this; }, i;
    function verb(n, f) { if (o[n]) i[n] = function (v) { return (p = !p) ? { value: __await(o[n](v)), done: n === "return" } : f ? f(v) : v; }; }
};
Object.defineProperty(exports, "__esModule", { value: true });
const api = require("api");
Symbol.asyncIterator = Symbol.asyncIterator || Symbol.for('Symbol.asyncIterator');
class InstrumentEventProducerService {
    /*
    / candles are the source for this class, so when this class is used,
    / it works based on the existing candles in the DB, and then it provides events
    / an event may be a new Heikin Ashi candle in the DB.
    */
    async produceNewEvents(instrument) {
        const candleService = new api.services.CandleService();
        this.candleModel = candleService.getModel(instrument);
        this.heikinAshiModel = candleService.getHeikinAshiModel(instrument);
        this.lineBreakModel = candleService.getLineBreakModel(instrument);
        const instrumentEventModel = this.getInstrumentEventModel(instrument);
        const lastEvent = await instrumentEventModel.findLastEvent(instrumentEventModel);
        const lastCandles = await this.candleModel.find({ time: { $gt: lastEvent.time } });
        let arrayOfEvents = [];
        for (const currCandle of lastCandles) {
            // process candle and provide event
            switch (currCandle.granularity) {
                case api.enums.GranularityEnum.M5:
                    try {
                        for (var _a = __asyncValues(this.raiseM5Events(currCandle)), _b; _b = await _a.next(), !_b.done;) {
                            const event = await _b.value;
                        }
                    }
                    catch (e_1_1) { e_1 = { error: e_1_1 }; }
                    finally {
                        try {
                            if (_b && !_b.done && (_c = _a.return)) await _c.call(_a);
                        }
                        finally { if (e_1) throw e_1.error; }
                    }
                    arrayOfEvents = arrayOfEvents.concat(Array.from(this.raiseM5Events(currCandle)));
                    break;
                case api.enums.GranularityEnum.M15:
                    arrayOfEvents = arrayOfEvents.concat(Array.from(await this.raiseM15Events(currCandle)));
                    break;
                case api.enums.GranularityEnum.M30:
                    arrayOfEvents = arrayOfEvents.concat(Array.from(await this.raiseM30Events(currCandle)));
                    break;
                case api.enums.GranularityEnum.H1:
                    arrayOfEvents = arrayOfEvents.concat(Array.from(await this.raiseH1Events(currCandle)));
                    break;
                case api.enums.GranularityEnum.H4:
                    arrayOfEvents = arrayOfEvents.concat(Array.from(await this.raiseH4Events(currCandle)));
                    break;
                case api.enums.GranularityEnum.D1:
                    arrayOfEvents = arrayOfEvents.concat(Array.from(await this.raiseD1Events(currCandle)));
                    break;
            }
        }
        await instrumentEventModel.create(arrayOfEvents);
        var e_1, _c;
    }
    async publishNewEvents(instrument) {
        const instrumentEventModel = this.getInstrumentEventModel(instrument);
        if (!instrumentEventModel) {
            throw new Error('instrument event model is undefined in InstrumentEventProducerService!');
        }
        const unPublishedEvents = await instrumentEventModel.findUndispatchedEvents(instrumentEventModel);
        const publisher = new api.proxies.InstrumentEventProducerProxy(api.enums.InstrumentEnum[instrument]);
        publisher.publish(unPublishedEvents);
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
    test() {
        return __asyncGenerator(this, arguments, function* test_1() {
            function sleep(ms) {
                return new Promise((resolve) => setTimeout(resolve, ms));
            }
            yield __await(sleep(100));
            yield 4;
        });
    }
    g() {
        return __asyncGenerator(this, arguments, function* g_1() {
            function sleep(ms) {
                return new Promise((resolve) => setTimeout(resolve, ms));
            }
            yield 1;
            yield __await(sleep(100));
            yield __await(yield* __asyncDelegator(__asyncValues([2, 3])));
            yield __await(yield* __asyncDelegator(__asyncValues((function () {
                return __asyncGenerator(this, arguments, function* () {
                    yield __await(sleep(100));
                    yield 4;
                });
            })())));
        });
    }
    raiseM5Events(candle) {
        return __asyncGenerator(this, arguments, function* raiseM5Events_1() {
            yield {
                event: 'm5-closed',
                time: new Date().toISOString(),
                candleTime: candle.time,
                isDispatched: false,
                payload: candle,
            };
            yield __await(yield* __asyncDelegator(__asyncValues((function () {
                return __asyncGenerator(this, arguments, function* () {
                    yield __await(sleep(100));
                    yield 4;
                });
            })())));
            yield {
                event: 'm5-closed',
                time: new Date().toISOString(),
                candleTime: candle.time,
                isDispatched: false,
                payload: candle,
            };
        });
    }
    raiseM15Events(candle) {
        return __asyncGenerator(this, arguments, function* raiseM15Events_1() {
            yield {
                event: 'm15-closed',
                time: new Date().toISOString(),
                candleTime: candle.time,
                isDispatched: false,
                payload: candle,
            };
        });
    }
    raiseM30Events(candle) {
        return __asyncGenerator(this, arguments, function* raiseM30Events_1() {
            yield {
                event: 'm30-closed',
                time: new Date().toISOString(),
                candleTime: candle.time,
                isDispatched: false,
                payload: candle,
            };
        });
    }
    raiseH1Events(candle) {
        return __asyncGenerator(this, arguments, function* raiseH1Events_1() {
            yield {
                event: 'h1-closed',
                time: new Date().toISOString(),
                candleTime: candle.time,
                isDispatched: false,
                payload: candle,
            };
        });
    }
    raiseH4Events(candle) {
        return __asyncGenerator(this, arguments, function* raiseH4Events_1() {
            yield {
                event: 'h4-closed',
                time: new Date().toISOString(),
                candleTime: candle.time,
                isDispatched: false,
                payload: candle,
            };
        });
    }
    raiseD1Events(candle) {
        return __asyncGenerator(this, arguments, function* raiseD1Events_1() {
            yield {
                event: 'd1-closed',
                time: new Date().toISOString(),
                candleTime: candle.time,
                isDispatched: false,
                payload: candle,
            };
        });
    }
    calculateHeikinAshi(candle) {
        return __asyncGenerator(this, arguments, function* calculateHeikinAshi_1() {
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
        });
    }
}
exports.InstrumentEventProducerService = InstrumentEventProducerService;
//# sourceMappingURL=instrument-event-producer.service.js.map