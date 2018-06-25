"use strict";
// const talib = require('talib/build/Release/talib');
// console.log('TALIB version: ' + talib.version);
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __await = (this && this.__await) || function (v) { return this instanceof __await ? (this.v = v, this) : new __await(v); }
var __asyncDelegator = (this && this.__asyncDelegator) || function (o) {
    var i, p;
    return i = {}, verb("next"), verb("throw", function (e) { throw e; }), verb("return"), i[Symbol.iterator] = function () { return this; }, i;
    function verb(n, f) { i[n] = o[n] ? function (v) { return (p = !p) ? { value: __await(o[n](v)), done: n === "return" } : f ? f(v) : v; } : f; }
};
var __asyncGenerator = (this && this.__asyncGenerator) || function (thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
    function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
};
Object.defineProperty(exports, "__esModule", { value: true });
// const tulind = require('tulind/lib/binding/Release/node-v59-darwin-x64/tulind');
const tulind = require("tulind");
const api = require("api");
console.log('TULIND version: ' + tulind.version);
Symbol.asyncIterator = Symbol.asyncIterator || Symbol.for('Symbol.asyncIterator');
class InstrumentEventProducerService {
    constructor() {
        // private heikinAshis: api.models.HeikinAshi[] = [];
        // private heikinAshisToSave: api.models.HeikinAshi[] = [];
        // private lineBreaks: api.models.LineBreak[] = [];
        // private lineBreaksToSave: api.models.LineBreak[] = [];
        this.candles = [];
        this.toFix = (num) => Number(num.toFixed(5));
    }
    /*
    / candles are the source for this class, so when this class is used,
    / it works based on the existing candles in the DB, and then it provides events
    / an event may be a new Heikin Ashi candle in the DB.
    */
    async produceNewEvents(instrument) {
        var e_1, _a;
        const candleService = new api.services.CandleService();
        this.candleModel = candleService.getModel(instrument);
        this.heikinAshiModel = candleService.getHeikinAshiModel(instrument);
        this.lineBreakModel = candleService.getLineBreakModel(instrument);
        this.instrumentEventModel = this.getInstrumentEventModel(instrument);
        const lastEvent = await this.instrumentEventModel.findLastEvent(this.instrumentEventModel);
        this.candles = await this.candleModel.find().sort({ time: 1 });
        // this.heikinAshis = await this.heikinAshiModel.find().sort({ time: -1 });
        // this.lineBreaks = await this.lineBreakModel.find().sort({ time: -1 });
        let lastCandles;
        if (lastEvent) {
            lastCandles = this.candles.filter((x) => x.time > lastEvent.candleTime);
        }
        else {
            lastCandles = this.candles;
        }
        const arrayOfEvents = [];
        for (const currCandle of lastCandles) {
            try {
                for (var _b = __asyncValues(this.raiseEvents(currCandle)), _c; _c = await _b.next(), !_c.done;) {
                    const event = await _c.value;
                    arrayOfEvents.push(event);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) await _a.call(_b);
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
        await this.instrumentEventModel.insertMany(arrayOfEvents);
        // await this.lineBreakModel.insertMany(sort(this.lineBreaksToSave).asc((x) => x.time.getTime()));
        // await this.heikinAshiModel.insertMany(sort(this.heikinAshisToSave).asc((x) => x.time.getTime()));
    }
    async reproduceEvents(instrument) {
        var e_2, _a;
        const candleService = new api.services.CandleService();
        this.candleModel = candleService.getModel(instrument);
        this.heikinAshiModel = candleService.getHeikinAshiModel(instrument);
        this.lineBreakModel = candleService.getLineBreakModel(instrument);
        this.instrumentEventModel = this.getInstrumentEventModel(instrument);
        await this.instrumentEventModel.deleteMany({}).exec();
        await this.lineBreakModel.deleteMany({}).exec();
        await this.heikinAshiModel.deleteMany({}).exec();
        this.candles = await this.candleModel.find().sort({ time: 1 });
        let arrayOfEvents = [];
        for (const currCandle of this.candles) {
            console.log(`time:${currCandle.time}`);
            if (arrayOfEvents.length > 50000) {
                await this.instrumentEventModel.insertMany(arrayOfEvents);
                arrayOfEvents = [];
            }
            try {
                for (var _b = __asyncValues(this.raiseEvents(currCandle)), _c; _c = await _b.next(), !_c.done;) {
                    const event = await _c.value;
                    event.isDispatched = true;
                    arrayOfEvents.push(event);
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) await _a.call(_b);
                }
                finally { if (e_2) throw e_2.error; }
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
        await this.instrumentEventModel.insertMany(arrayOfEvents);
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
    raiseEvents(candle) {
        return __asyncGenerator(this, arguments, function* raiseEvents_1() {
            yield __await(yield* __asyncDelegator(__asyncValues(this.raiseCandle(candle))));
            yield __await(yield* __asyncDelegator(__asyncValues(this.raiseHeikinAshi(candle))));
            yield __await(yield* __asyncDelegator(__asyncValues(this.raiseLineBreak(candle))));
        });
    }
    raiseCandle(candle) {
        return __asyncGenerator(this, arguments, function* raiseCandle_1() {
            yield yield __await({
                name: `${candle.granularity.toLowerCase()}_closed`,
                time: new Date(),
                candleTime: candle.time,
                bidPrice: candle.closeBid,
                askPrice: candle.closeAsk,
                isDispatched: false,
                context: candle,
            });
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
            // const xPrevious = this.heikinAshis
            //     // .sort((x, y) => y.time.getTime() - x.time.getTime())
            //     .find((x) => x.time < candle.time && x.granularity === candle.granularity);
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
            // this.heikinAshis.unshift(newLocal);
            // this.heikinAshisToSave.unshift(newLocal);
            yield yield __await({
                name: `${candle.granularity.toLowerCase()}_heikin_ashi_closed`,
                time: new Date(),
                candleTime: candle.time,
                bidPrice: candle.closeBid,
                askPrice: candle.closeAsk,
                isDispatched: false,
                context: newLocal,
            });
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
            // const xLines = this.lineBreaks
            //     // .sort((x, y) => y.time.getTime() - x.time.getTime())
            //     .filter((x) => x.time <= candle.time && x.granularity === candle.granularity)
            //     .slice(0, 3);
            if (xLines.length === 0) {
                // new line
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
            // this.lineBreaks.unshift(newLocal);
            // this.lineBreaksToSave.unshift(newLocal);
            yield yield __await({
                name: `${candle.granularity.toLowerCase()}_line_break_closed`,
                time: new Date(),
                candleTime: candle.time,
                bidPrice: candle.closeBid,
                askPrice: candle.closeAsk,
                isDispatched: false,
                context: newLocal,
            });
            yield __await(yield* __asyncDelegator(__asyncValues(this.raiseSmaLineBreak(candle, 20))));
            yield __await(yield* __asyncDelegator(__asyncValues(this.raiseSmaLineBreak(candle, 50))));
            yield __await(yield* __asyncDelegator(__asyncValues(this.raiseEmaLineBreak(candle, 20))));
            yield __await(yield* __asyncDelegator(__asyncValues(this.raiseEmaLineBreak(candle, 50))));
        });
    }
    raiseMacd(candle) {
        return __asyncGenerator(this, arguments, function* raiseMacd_1() {
            const xCandles = yield __await(this.candleModel.findLimit(this.candleModel, candle.time, candle.granularity, 40));
            // const xCandles = this.candles
            //     // .sort((x, y) => y.time.getTime() - x.time.getTime())
            //     .filter((x) => x.time <= candle.time && x.granularity === candle.granularity)
            //     .slice(0, 40);
            const closes = xCandles.map((x) => x.closeMid);
            if (closes.length < 26) {
                return;
            }
            // tslint:disable-next-line:space-before-function-paren
            yield yield __await(new Promise((resolve) => {
                tulind.indicators.macd.indicator([closes], [12, 26, 9], (err, results) => {
                    resolve({
                        name: `${candle.granularity.toLowerCase()}_macd_changed`,
                        time: new Date(),
                        candleTime: candle.time,
                        bidPrice: candle.closeBid,
                        askPrice: candle.closeAsk,
                        isDispatched: false,
                        context: {
                            macd: this.toFix(results[0][results[0].length - 1]),
                            macd_signal: this.toFix(results[1][results[1].length - 1]),
                            macd_histogram: this.toFix(results[2][results[2].length - 1]),
                        },
                    });
                });
            }));
        });
    }
    raiseSma(candle, period) {
        return __asyncGenerator(this, arguments, function* raiseSma_1() {
            const xCandles = yield __await(this.candleModel.findLimit(this.candleModel, candle.time, candle.granularity, period));
            // const xCandles = this.candles
            //     // .sort((x, y) => y.time.getTime() - x.time.getTime())
            //     .filter((x) => x.time <= candle.time && x.granularity === candle.granularity)
            //     .slice(0, period);
            const closes = xCandles.map((x) => x.closeMid);
            if (closes.length < period) {
                return;
            }
            // tslint:disable-next-line:space-before-function-paren
            yield yield __await(new Promise((resolve) => {
                tulind.indicators.sma.indicator([closes], [period], (err, results) => {
                    resolve({
                        name: `${candle.granularity.toLowerCase()}_sma_changed`,
                        time: new Date(),
                        candleTime: candle.time,
                        bidPrice: candle.closeBid,
                        askPrice: candle.closeAsk,
                        isDispatched: false,
                        context: { result: this.toFix(results[0][results[0].length - 1]), period },
                    });
                });
            }));
        });
    }
    raiseEma(candle, period) {
        return __asyncGenerator(this, arguments, function* raiseEma_1() {
            const xCandles = yield __await(this.candleModel.findLimit(this.candleModel, candle.time, candle.granularity, period));
            // const xCandles = this.candles
            //     // .sort((x, y) => y.time.getTime() - x.time.getTime())
            //     .filter((x) => x.time <= candle.time && x.granularity === candle.granularity)
            //     .slice(0, period);
            const closes = xCandles.map((x) => x.closeMid);
            // tslint:disable-next-line:space-before-function-paren
            yield yield __await(new Promise((resolve) => {
                tulind.indicators.ema.indicator([closes], [period], (err, results) => {
                    resolve({
                        name: `${candle.granularity.toLowerCase()}_ema_changed`,
                        time: new Date(),
                        candleTime: candle.time,
                        bidPrice: candle.closeBid,
                        askPrice: candle.closeAsk,
                        isDispatched: false,
                        context: { result: this.toFix(results[0][results[0].length - 1]), period },
                    });
                });
            }));
        });
    }
    raiseSmaHeikinAshi(candle, period) {
        return __asyncGenerator(this, arguments, function* raiseSmaHeikinAshi_1() {
            const xCandles = yield __await(this.heikinAshiModel.findLimit(this.heikinAshiModel, candle.time, candle.granularity, period));
            // const xCandles = this.heikinAshis
            //     // .sort((x, y) => y.time.getTime() - x.time.getTime())
            //     .filter((x) => x.time <= candle.time && x.granularity === candle.granularity)
            //     .slice(0, period);
            const closes = xCandles.map((x) => x.close);
            if (closes.length < period) {
                return;
            }
            // tslint:disable-next-line:space-before-function-paren
            yield yield __await(new Promise((resolve) => {
                tulind.indicators.sma.indicator([closes], [period], (err, results) => {
                    resolve({
                        name: `${candle.granularity.toLowerCase()}_heikin_ashi_sma_changed`,
                        time: new Date(),
                        candleTime: candle.time,
                        bidPrice: candle.closeBid,
                        askPrice: candle.closeAsk,
                        isDispatched: false,
                        context: { result: this.toFix(results[0][results[0].length - 1]), period },
                    });
                });
            }));
        });
    }
    raiseEmaHeikinAshi(candle, period) {
        return __asyncGenerator(this, arguments, function* raiseEmaHeikinAshi_1() {
            const xCandles = yield __await(this.heikinAshiModel.findLimit(this.heikinAshiModel, candle.time, candle.granularity, period));
            // const xCandles = this.heikinAshis
            //     // .sort((x, y) => y.time.getTime() - x.time.getTime())
            //     .filter((x) => x.time <= candle.time && x.granularity === candle.granularity)
            //     .slice(0, period);
            const closes = xCandles.map((x) => x.close);
            // tslint:disable-next-line:space-before-function-paren
            yield yield __await(new Promise((resolve) => {
                tulind.indicators.ema.indicator([closes], [period], (err, results) => {
                    resolve({
                        name: `${candle.granularity.toLowerCase()}_heikin_ashi_ema_changed`,
                        time: new Date(),
                        candleTime: candle.time,
                        bidPrice: candle.closeBid,
                        askPrice: candle.closeAsk,
                        isDispatched: false,
                        context: { result: this.toFix(results[0][results[0].length - 1]), period },
                    });
                });
            }));
        });
    }
    raiseSmaLineBreak(candle, period) {
        return __asyncGenerator(this, arguments, function* raiseSmaLineBreak_1() {
            const xCandles = yield __await(this.lineBreakModel.findLimit(this.lineBreakModel, candle.time, candle.granularity, period));
            // const xCandles = this.lineBreaks
            //     // .sort((x, y) => y.time.getTime() - x.time.getTime())
            //     .filter((x) => x.time <= candle.time && x.granularity === candle.granularity)
            //     .slice(0, period);
            const closes = xCandles.map((x) => x.close);
            if (closes.length < period) {
                return;
            }
            // tslint:disable-next-line:space-before-function-paren
            yield yield __await(new Promise((resolve) => {
                tulind.indicators.sma.indicator([closes], [period], (err, results) => {
                    resolve({
                        name: `${candle.granularity.toLowerCase()}_line_break_sma_changed`,
                        time: new Date(),
                        candleTime: candle.time,
                        bidPrice: candle.closeBid,
                        askPrice: candle.closeAsk,
                        isDispatched: false,
                        context: { result: this.toFix(results[0][results[0].length - 1]), period },
                    });
                });
            }));
        });
    }
    raiseEmaLineBreak(candle, period) {
        return __asyncGenerator(this, arguments, function* raiseEmaLineBreak_1() {
            const xCandles = yield __await(this.lineBreakModel.findLimit(this.lineBreakModel, candle.time, candle.granularity, period));
            // const xCandles = this.lineBreaks
            //     // .sort((x, y) => y.time.getTime() - x.time.getTime())
            //     .filter((x) => x.time <= candle.time && x.granularity === candle.granularity)
            //     .slice(0, period);
            const closes = xCandles.map((x) => x.close);
            // tslint:disable-next-line:space-before-function-paren
            yield yield __await(new Promise((resolve) => {
                tulind.indicators.ema.indicator([closes], [period], (err, results) => {
                    resolve({
                        name: `${candle.granularity.toLowerCase()}_line_break_ema_changed`,
                        time: new Date(),
                        candleTime: candle.time,
                        bidPrice: candle.closeBid,
                        askPrice: candle.closeAsk,
                        isDispatched: false,
                        context: { result: this.toFix(results[0][results[0].length - 1]), period },
                    });
                });
            }));
        });
    }
}
exports.InstrumentEventProducerService = InstrumentEventProducerService;
//# sourceMappingURL=instrument-event-producer.service.js.map