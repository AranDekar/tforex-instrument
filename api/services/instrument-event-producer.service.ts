// const talib = require('talib/build/Release/talib');
// console.log('TALIB version: ' + talib.version);

// const tulind = require('tulind/lib/binding/Release/node-v59-darwin-x64/tulind');
import * as tulind from 'tulind';
import * as api from 'api';

import {
    InstrumentEvent, InstrumentEventModel, CandleModel, HeikinAshiModel, LineBreakModel,
} from 'api/models';
import { InstrumentEventEnum } from '../enums';

console.log('TULIND version: ' + tulind.version);

(Symbol as any).asyncIterator = Symbol.asyncIterator || Symbol.for('Symbol.asyncIterator');
export class InstrumentEventProducerService {
    private candleModel: CandleModel;
    private heikinAshiModel: HeikinAshiModel;
    private lineBreakModel: LineBreakModel;
    private instrumentEventModel: InstrumentEventModel;
    // private heikinAshis: api.models.HeikinAshi[] = [];
    // private heikinAshisToSave: api.models.HeikinAshi[] = [];
    // private lineBreaks: api.models.LineBreak[] = [];
    // private lineBreaksToSave: api.models.LineBreak[] = [];
    private candles: api.models.Candle[] = [];

    private toFix = (num: number) => Number(num.toFixed(5));
    /*
    / candles are the source for this class, so when this class is used,
    / it works based on the existing candles in the DB, and then it provides events
    / an event may be a new Heikin Ashi candle in the DB.
    */
    public async produceNewEvents(instrument: api.enums.InstrumentEnum) {
        const candleService = new api.services.CandleService();
        this.candleModel = candleService.getModel(instrument);
        this.heikinAshiModel = candleService.getHeikinAshiModel(instrument);
        this.lineBreakModel = candleService.getLineBreakModel(instrument);
        this.instrumentEventModel = this.getInstrumentEventModel(instrument);
        const lastEvent: api.models.InstrumentEvent =
            await this.instrumentEventModel.findLastEvent(this.instrumentEventModel);

        this.candles = await this.candleModel.find().sort({ time: 1 });

        // this.heikinAshis = await this.heikinAshiModel.find().sort({ time: -1 });
        // this.lineBreaks = await this.lineBreakModel.find().sort({ time: -1 });

        let lastCandles;
        if (lastEvent) {
            lastCandles = this.candles.filter((x) => x.time > lastEvent.candleTime);
        } else {
            lastCandles = this.candles;
        }
        const arrayOfEvents: InstrumentEvent[] = [];
        for (const currCandle of lastCandles) {
            for await (const event of this.raiseEvents(currCandle)) {
                arrayOfEvents.push(event);
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
    public async reproduceEvents(instrument: api.enums.InstrumentEnum) {
        const candleService = new api.services.CandleService();
        this.candleModel = candleService.getModel(instrument);
        this.heikinAshiModel = candleService.getHeikinAshiModel(instrument);
        this.lineBreakModel = candleService.getLineBreakModel(instrument);
        this.instrumentEventModel = this.getInstrumentEventModel(instrument);

        await this.instrumentEventModel.deleteMany({}).exec();
        await this.lineBreakModel.deleteMany({}).exec();
        await this.heikinAshiModel.deleteMany({}).exec();
        this.candles = await this.candleModel.find().sort({ time: 1 });
        let arrayOfEvents: InstrumentEvent[] = [];
        for (const currCandle of this.candles) {
            console.log(`time:${currCandle.time}`);
            if (arrayOfEvents.length > 50000) {
                await this.instrumentEventModel.insertMany(arrayOfEvents);
                arrayOfEvents = [];
            }
            for await (const event of this.raiseEvents(currCandle)) {
                event.isDispatched = true;
                arrayOfEvents.push(event);
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

    public async publishNewEvents(instrument: api.enums.InstrumentEnum) {
        const instrumentEventModel = this.getInstrumentEventModel(instrument);
        if (!instrumentEventModel) {
            throw new Error('instrument event model is undefined in InstrumentEventProducerService!');
        }
        const unPublishedEvents = await instrumentEventModel.findUndispatchedEvents(instrumentEventModel);
        const publisher = new api.proxies.InstrumentEventProducerProxy(api.enums.InstrumentEnum[instrument]);
        publisher.publish(unPublishedEvents);

    }

    private getInstrumentEventModel(instrument: api.enums.InstrumentEnum):
        api.models.InstrumentEventModel {

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
    private findInstrumentEventTopicName(
        instrument: api.enums.InstrumentEnum,
        granularity: api.enums.GranularityEnum): string {
        return (`${instrument}-${granularity}`);
    }

    private async * raiseEvents(candle: api.models.Candle): AsyncIterableIterator<InstrumentEvent> {
        yield* this.raiseCandle(candle);
        yield* this.raiseHeikinAshi(candle);
        yield* this.raiseLineBreak(candle);
    }

    private async * raiseCandle(candle: api.models.Candle) {
        yield {
            name: `${candle.granularity.toLowerCase()}_closed`,
            time: new Date(),
            candleTime: candle.time,
            bidPrice: candle.closeBid,
            askPrice: candle.closeAsk,
            isDispatched: false,
            context: candle,
        };
        yield* this.raiseSma(candle, 20);
        yield* this.raiseSma(candle, 50);
        yield* this.raiseEma(candle, 20);
        yield* this.raiseEma(candle, 50);
        yield* this.raiseMacd(candle);
    }

    private async * raiseHeikinAshi(candle: api.models.Candle) {
        const xPrevious = await this.heikinAshiModel.findPrevious(
            this.heikinAshiModel,
            candle.time, candle.granularity);

        // const xPrevious = this.heikinAshis
        //     // .sort((x, y) => y.time.getTime() - x.time.getTime())
        //     .find((x) => x.time < candle.time && x.granularity === candle.granularity);

        const xClose = this.toFix((candle.open + candle.closeMid + candle.high + candle.low) / 4);
        const xOpen = xPrevious ? this.toFix((xPrevious.open + xPrevious.close) / 2) : xClose;
        const xHigh = Math.max(candle.high, xOpen, xClose);
        const xLow = Math.min(candle.low, xOpen, xClose);

        const newLocal: api.models.HeikinAshi = {
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
        await model.save();
        // this.heikinAshis.unshift(newLocal);
        // this.heikinAshisToSave.unshift(newLocal);

        yield {
            name: `${candle.granularity.toLowerCase()}_heikin_ashi_closed`,
            time: new Date(),
            candleTime: candle.time,
            bidPrice: candle.closeBid,
            askPrice: candle.closeAsk,
            isDispatched: false,
            context: newLocal,
        };
        yield* this.raiseSmaHeikinAshi(candle, 20);
        yield* this.raiseSmaHeikinAshi(candle, 50);
        yield* this.raiseEmaHeikinAshi(candle, 20);
        yield* this.raiseEmaHeikinAshi(candle, 50);
    }

    private async * raiseLineBreak(candle: api.models.Candle) {
        let newLocal: api.models.LineBreak;

        const xLines = await this.lineBreakModel.findLimit(
            this.lineBreakModel,
            candle.time, candle.granularity, 3);

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
        } else {
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
            } else if (candle.closeMid < bottom) {
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
        await model.save();
        // this.lineBreaks.unshift(newLocal);
        // this.lineBreaksToSave.unshift(newLocal);

        yield {
            name: `${candle.granularity.toLowerCase()}_line_break_closed`,
            time: new Date(),
            candleTime: candle.time,
            bidPrice: candle.closeBid,
            askPrice: candle.closeAsk,
            isDispatched: false,
            context: newLocal,
        };
        yield* this.raiseSmaLineBreak(candle, 20);
        yield* this.raiseSmaLineBreak(candle, 50);
        yield* this.raiseEmaLineBreak(candle, 20);
        yield* this.raiseEmaLineBreak(candle, 50);
    }
    private async * raiseMacd(candle: api.models.Candle) {

        const xCandles = await this.candleModel.findLimit(
            this.candleModel,
            candle.time, candle.granularity, 40);

        // const xCandles = this.candles
        //     // .sort((x, y) => y.time.getTime() - x.time.getTime())
        //     .filter((x) => x.time <= candle.time && x.granularity === candle.granularity)
        //     .slice(0, 40);

        const closes = xCandles.map((x) => x.closeMid);

        if (closes.length < 26) {
            return;
        }
        // tslint:disable-next-line:space-before-function-paren
        yield new Promise<InstrumentEvent>((resolve) => {

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
        });
    }

    private async * raiseSma(candle: api.models.Candle, period) {

        const xCandles = await this.candleModel.findLimit(
            this.candleModel,
            candle.time, candle.granularity, period);

        // const xCandles = this.candles
        //     // .sort((x, y) => y.time.getTime() - x.time.getTime())
        //     .filter((x) => x.time <= candle.time && x.granularity === candle.granularity)
        //     .slice(0, period);

        const closes = xCandles.map((x) => x.closeMid);
        if (closes.length < period) {
            return;
        }
        // tslint:disable-next-line:space-before-function-paren
        yield new Promise<InstrumentEvent>((resolve) => {
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
        });
    }
    private async * raiseEma(candle: api.models.Candle, period) {

        const xCandles = await this.candleModel.findLimit(
            this.candleModel,
            candle.time, candle.granularity, period);

        // const xCandles = this.candles
        //     // .sort((x, y) => y.time.getTime() - x.time.getTime())
        //     .filter((x) => x.time <= candle.time && x.granularity === candle.granularity)
        //     .slice(0, period);

        const closes = xCandles.map((x) => x.closeMid);
        // tslint:disable-next-line:space-before-function-paren
        yield new Promise<InstrumentEvent>((resolve) => {

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
        });
    }

    private async * raiseSmaHeikinAshi(candle: api.models.Candle, period) {

        const xCandles = await this.heikinAshiModel.findLimit(
            this.heikinAshiModel,
            candle.time, candle.granularity, period);

        // const xCandles = this.heikinAshis
        //     // .sort((x, y) => y.time.getTime() - x.time.getTime())
        //     .filter((x) => x.time <= candle.time && x.granularity === candle.granularity)
        //     .slice(0, period);

        const closes = xCandles.map((x) => x.close);
        if (closes.length < period) {
            return;
        }
        // tslint:disable-next-line:space-before-function-paren
        yield new Promise<InstrumentEvent>((resolve) => {

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
        });
    }
    private async * raiseEmaHeikinAshi(candle: api.models.Candle, period) {

        const xCandles = await this.heikinAshiModel.findLimit(
            this.heikinAshiModel,
            candle.time, candle.granularity, period);

        // const xCandles = this.heikinAshis
        //     // .sort((x, y) => y.time.getTime() - x.time.getTime())
        //     .filter((x) => x.time <= candle.time && x.granularity === candle.granularity)
        //     .slice(0, period);

        const closes = xCandles.map((x) => x.close);
        // tslint:disable-next-line:space-before-function-paren

        yield new Promise<InstrumentEvent>((resolve) => {
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
        });
    }
    private async * raiseSmaLineBreak(candle: api.models.Candle, period) {

        const xCandles = await this.lineBreakModel.findLimit(
            this.lineBreakModel,
            candle.time, candle.granularity, period);
        // const xCandles = this.lineBreaks
        //     // .sort((x, y) => y.time.getTime() - x.time.getTime())
        //     .filter((x) => x.time <= candle.time && x.granularity === candle.granularity)
        //     .slice(0, period);

        const closes = xCandles.map((x) => x.close);
        if (closes.length < period) {
            return;
        }
        // tslint:disable-next-line:space-before-function-paren
        yield new Promise<InstrumentEvent>((resolve) => {
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
        });
    }
    private async * raiseEmaLineBreak(candle: api.models.Candle, period) {

        const xCandles = await this.lineBreakModel.findLimit(
            this.lineBreakModel,
            candle.time, candle.granularity, period);
        // const xCandles = this.lineBreaks
        //     // .sort((x, y) => y.time.getTime() - x.time.getTime())
        //     .filter((x) => x.time <= candle.time && x.granularity === candle.granularity)
        //     .slice(0, period);

        const closes = xCandles.map((x) => x.close);
        // tslint:disable-next-line:space-before-function-paren
        yield new Promise<InstrumentEvent>((resolve) => {

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
        });
    }
}