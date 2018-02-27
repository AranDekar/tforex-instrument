import { Types, Model } from 'mongoose';
import * as request from 'request';
// const talib = require('talib/build/Release/talib');
// console.log('TALIB version: ' + talib.version);

// const tulind = require('tulind/lib/binding/Release/node-v59-darwin-x64/tulind');
import * as tulind from 'tulind';
import * as api from 'api';

import { InstrumentEvent, CandleModel, HeikinAshiModel, LineBreakModel } from 'api/models';

console.log('TULIND version: ' + tulind.version);

(Symbol as any).asyncIterator = Symbol.asyncIterator || Symbol.for('Symbol.asyncIterator');
export class InstrumentEventProducerService {
    private candleModel: CandleModel;
    private heikinAshiModel: HeikinAshiModel;
    private lineBreakModel: LineBreakModel;

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
        const instrumentEventModel = this.getInstrumentEventModel(instrument);

        const lastEvent: api.models.InstrumentEvent = await instrumentEventModel.findLastEvent(instrumentEventModel);
        let lastCandles;
        if (lastEvent) {
            lastCandles = await this.candleModel.find({ time: { $gt: lastEvent.time } }).sort({ time: 1 });
        } else {
            lastCandles = await this.candleModel.find().sort({ time: 1 });
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
        await instrumentEventModel.create(arrayOfEvents);
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
        api.models.InstrumentEventDocumentOperations {
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

    private async * raiseEvents(candle: api.models.CandleDocument): AsyncIterableIterator<InstrumentEvent> {
        yield* this.raiseCandle(candle);
        yield* this.raiseHeikinAshi(candle);
        yield* this.raiseLineBreak(candle);
    }

    private async * raiseCandle(candle: api.models.CandleDocument) {
        yield {
            event: `${candle.granularity}-closed`,
            time: new Date().toISOString(),
            candleTime: candle.time,
            isDispatched: false,
            payload: candle,
        };
        yield* this.raiseSma(candle, 20);
        yield* this.raiseSma(candle, 50);
        yield* this.raiseEma(candle, 20);
        yield* this.raiseEma(candle, 50);
        yield* this.raiseMacd(candle);
    }

    private async * raiseHeikinAshi(candle: api.models.CandleDocument) {
        const xPrevious = await this.heikinAshiModel.findPrevious(
            this.heikinAshiModel,
            candle.time, candle.granularity);

        const xClose = this.toFix((candle.open + candle.closeMid + candle.high + candle.low) / 4);
        const xOpen = xPrevious ? this.toFix((xPrevious.open + xPrevious.close) / 2) : xClose;
        const xHigh = Math.max(candle.high, xOpen, xClose);
        const xLow = Math.min(candle.low, xOpen, xClose);

        const newLocal: any = {
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
        yield {
            event: `${candle.granularity}-heikin-ashi-closed`,
            time: new Date().toISOString(),
            candleTime: candle.time,
            isDispatched: false,
            payload: newLocal,
        };
        yield* this.raiseSmaHeikinAshi(candle, 20);
        yield* this.raiseSmaHeikinAshi(candle, 50);
        yield* this.raiseEmaHeikinAshi(candle, 20);
        yield* this.raiseEmaHeikinAshi(candle, 50);
    }

    private async * raiseLineBreak(candle: api.models.CandleDocument) {
        let newLocal: any;

        const xLines = await this.lineBreakModel.findLimit(
            this.lineBreakModel,
            candle.time, candle.granularity, 3);
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
        yield {
            event: `${candle.granularity}-line-break-closed`,
            time: new Date().toISOString(),
            candleTime: candle.time,
            isDispatched: false,
            payload: newLocal,
        };
        yield* this.raiseSmaLineBreak(candle, 20);
        yield* this.raiseSmaLineBreak(candle, 50);
        yield* this.raiseEmaLineBreak(candle, 20);
        yield* this.raiseEmaLineBreak(candle, 50);
    }
    private async * raiseMacd(candle: api.models.CandleDocument) {

        const xCandles = await this.candleModel.findLimit(
            this.candleModel,
            candle.time, candle.granularity, 40);

        const closes = xCandles.map((x) => x.closeMid);

        if (closes.length < 26) {
            return;
        }
        // tslint:disable-next-line:space-before-function-paren
        yield new Promise<InstrumentEvent>((resolve) => {

            tulind.indicators.macd.indicator([closes], [12, 26, 9], (err, results) => {
                resolve({
                    event: `${candle.granularity}-macd-changed`,
                    time: new Date().toISOString(),
                    candleTime: candle.time,
                    isDispatched: false,
                    payload: {
                        macd: this.toFix(results[0][results[0].length - 1]),
                        macd_signal: this.toFix(results[1][results[1].length - 1]),
                        macd_histogram: this.toFix(results[2][results[2].length - 1]),
                    },
                });
            });
        });
    }

    private async * raiseSma(candle: api.models.CandleDocument, period) {

        const xCandles = await this.candleModel.findLimit(
            this.candleModel,
            candle.time, candle.granularity, period);

        const closes = xCandles.map((x) => x.closeMid);
        if (closes.length < period) {
            return;
        }
        // tslint:disable-next-line:space-before-function-paren
        yield new Promise<InstrumentEvent>((resolve) => {
            tulind.indicators.sma.indicator([closes], [period], (err, results) => {
                resolve({
                    event: `${candle.granularity}-sma-changed`,
                    time: new Date().toISOString(),
                    candleTime: candle.time,
                    isDispatched: false,
                    payload: { result: this.toFix(results[0][results[0].length - 1]), period },
                });
            });
        });
    }
    private async * raiseEma(candle: api.models.CandleDocument, period) {

        const xCandles = await this.candleModel.findLimit(
            this.candleModel,
            candle.time, candle.granularity, period);

        const closes = xCandles.map((x) => x.closeMid);
        // tslint:disable-next-line:space-before-function-paren
        yield new Promise<InstrumentEvent>((resolve) => {

            tulind.indicators.ema.indicator([closes], [period], (err, results) => {
                resolve({
                    event: `${candle.granularity}-ema-changed`,
                    time: new Date().toISOString(),
                    candleTime: candle.time,
                    isDispatched: false,
                    payload: { result: this.toFix(results[0][results[0].length - 1]), period },
                });
            });
        });
    }

    private async * raiseSmaHeikinAshi(candle: api.models.CandleDocument, period) {

        const xCandles = await this.heikinAshiModel.findLimit(
            this.heikinAshiModel,
            candle.time, candle.granularity, period);

        const closes = xCandles.map((x) => x.close);
        if (closes.length < period) {
            return;
        }
        // tslint:disable-next-line:space-before-function-paren
        yield new Promise<InstrumentEvent>((resolve) => {

            tulind.indicators.sma.indicator([closes], [period], (err, results) => {
                resolve({
                    event: `${candle.granularity}-heikin-ashi-sma-changed`,
                    time: new Date().toISOString(),
                    candleTime: candle.time,
                    isDispatched: false,
                    payload: { result: this.toFix(results[0][results[0].length - 1]), period },
                });
            });
        });
    }
    private async * raiseEmaHeikinAshi(candle: api.models.CandleDocument, period) {

        const xCandles = await this.heikinAshiModel.findLimit(
            this.heikinAshiModel,
            candle.time, candle.granularity, period);

        const closes = xCandles.map((x) => x.close);
        // tslint:disable-next-line:space-before-function-paren

        yield new Promise<InstrumentEvent>((resolve) => {
            tulind.indicators.ema.indicator([closes], [period], (err, results) => {
                resolve({
                    event: `${candle.granularity}-heikin-ashi-ema-changed`,
                    time: new Date().toISOString(),
                    candleTime: candle.time,
                    isDispatched: false,
                    payload: { result: this.toFix(results[0][results[0].length - 1]), period },
                });
            });
        });
    }
    private async * raiseSmaLineBreak(candle: api.models.CandleDocument, period) {

        const xCandles = await this.lineBreakModel.findLimit(
            this.lineBreakModel,
            candle.time, candle.granularity, period);

        const closes = xCandles.map((x) => x.close);
        if (closes.length < period) {
            return;
        }
        // tslint:disable-next-line:space-before-function-paren
        yield new Promise<InstrumentEvent>((resolve) => {
            tulind.indicators.sma.indicator([closes], [period], (err, results) => {
                resolve({
                    event: `${candle.granularity}-line-break-sma-changed`,
                    time: new Date().toISOString(),
                    candleTime: candle.time,
                    isDispatched: false,
                    payload: { result: this.toFix(results[0][results[0].length - 1]), period },
                });
            });
        });
    }
    private async * raiseEmaLineBreak(candle: api.models.CandleDocument, period) {

        const xCandles = await this.lineBreakModel.findLimit(
            this.lineBreakModel,
            candle.time, candle.granularity, period);

        const closes = xCandles.map((x) => x.close);
        // tslint:disable-next-line:space-before-function-paren
        yield new Promise<InstrumentEvent>((resolve) => {

            tulind.indicators.ema.indicator([closes], [period], (err, results) => {
                resolve({
                    event: `${candle.granularity}-line-break-ema-changed`,
                    time: new Date().toISOString(),
                    candleTime: candle.time,
                    isDispatched: false,
                    payload: { result: this.toFix(results[0][results[0].length - 1]), period },
                });
            });
        });
    }
}