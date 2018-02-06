import { Types, Model } from 'mongoose';
import * as request from 'request';

import * as api from 'api';
import { InstrumentEvent, CandleModel, HeikinAshiModel, LineBreakModel } from 'api/models';
(Symbol as any).asyncIterator = Symbol.asyncIterator || Symbol.for('Symbol.asyncIterator');
export class InstrumentEventProducerService {
    private candleModel: CandleModel;
    private heikinAshiModel: HeikinAshiModel;
    private lineBreakModel: LineBreakModel;
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
        const lastCandles = await this.candleModel.find({ time: { $gt: lastEvent.time } });
        const arrayOfEvents: InstrumentEvent[] = [];
        for (const currCandle of lastCandles) {
            // process candle and provide event
            switch (currCandle.granularity) {
                case api.enums.GranularityEnum.M5:
                    for await (const event of this.raiseM5Events(currCandle)) {
                        arrayOfEvents.push(event);
                    }
                    break;
                case api.enums.GranularityEnum.M15:
                    for await (const event of this.raiseM15Events(currCandle)) {
                        arrayOfEvents.push(event);
                    }
                    break;
                case api.enums.GranularityEnum.M30:
                    for await (const event of this.raiseM30Events(currCandle)) {
                        arrayOfEvents.push(event);
                    }
                    break;
                case api.enums.GranularityEnum.H1:
                    for await (const event of this.raiseH1Events(currCandle)) {
                        arrayOfEvents.push(event);
                    }
                    break;
                case api.enums.GranularityEnum.H4:
                    for await (const event of this.raiseH4Events(currCandle)) {
                        arrayOfEvents.push(event);
                    }
                    break;
                case api.enums.GranularityEnum.D1:
                    for await (const event of this.raiseD1Events(currCandle)) {
                        arrayOfEvents.push(event);
                    }
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

    private async * raiseM5Events(candle: api.models.CandleDocument) {
        yield {
            event: 'm5-closed',
            time: new Date().toISOString(),
            candleTime: candle.time,
            isDispatched: false,
            payload: candle,
        };
        yield* this.calculateHeikinAshi(candle);
        yield* this.calculateLineBreak(candle);
    }

    private async * raiseM15Events(candle: api.models.CandleDocument) {
        yield {
            event: 'm15-closed',
            time: new Date().toISOString(),
            candleTime: candle.time,
            isDispatched: false,
            payload: candle,
        };
        yield* this.calculateHeikinAshi(candle);
        yield* this.calculateLineBreak(candle);
    }

    private async * raiseM30Events(candle: api.models.CandleDocument) {
        yield {
            event: 'm30-closed',
            time: new Date().toISOString(),
            candleTime: candle.time,
            isDispatched: false,
            payload: candle,
        };
        yield* this.calculateHeikinAshi(candle);
        yield* this.calculateLineBreak(candle);
    }

    private async * raiseH1Events(candle: api.models.CandleDocument) {
        yield {
            event: 'h1-closed',
            time: new Date().toISOString(),
            candleTime: candle.time,
            isDispatched: false,
            payload: candle,
        };
        yield* this.calculateHeikinAshi(candle);
        yield* this.calculateLineBreak(candle);
    }

    private async * raiseH4Events(candle: api.models.CandleDocument) {
        yield {
            event: 'h4-closed',
            time: new Date().toISOString(),
            candleTime: candle.time,
            isDispatched: false,
            payload: candle,
        };
        yield* this.calculateHeikinAshi(candle);
        yield* this.calculateLineBreak(candle);
    }

    private async * raiseD1Events(candle: api.models.CandleDocument) {
        yield {
            event: 'd1-closed',
            time: new Date().toISOString(),
            candleTime: candle.time,
            isDispatched: false,
            payload: candle,
        };
        yield* this.calculateHeikinAshi(candle);
        yield* this.calculateLineBreak(candle);
    }

    private async * calculateHeikinAshi(candle: api.models.CandleDocument) {
        const xPrevious = await this.heikinAshiModel.findPrevious(
            this.heikinAshiModel,
            candle.time, candle.granularity);

        const xClose = (candle.open + candle.close + candle.high + candle.low) / 4;
        const xOpen = (xPrevious.open + xPrevious.close) / 2;
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
    }

    private async * calculateLineBreak(candle: api.models.CandleDocument) {
        const xLine = await this.lineBreakModel.findPrevious(
            this.lineBreakModel,
            candle.time, candle.granularity);
        const xxLine = await this.lineBreakModel.findPrevious(
            this.lineBreakModel,
            xLine.time, xLine.granularity);
        const xxxLine = await this.lineBreakModel.findPrevious(
            this.lineBreakModel,
            xxLine.time, xxLine.granularity);

        const bottom = Math.min(xLine.open, xLine.close, xxLine.open,
            xxLine.close, xxxLine.open, xxxLine.close);
        const top = Math.max(xLine.open, xLine.close, xxLine.open,
            xxLine.close, xxxLine.open, xxxLine.close);

        let newLocal: any;
        if (candle.close > top) {
            // new line in white
            const xOpen = xLine.color === 'white' ? xLine.close : xLine.open;
            const xNumber = xLine.color === 'white' ? xLine.number + 1 : 1;
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
        } else if (candle.close < bottom) {
            // new line in red
            const xOpen = xLine.color === 'red' ? xLine.close : xLine.open;
            const xNumber = xLine.color === 'red' ? xLine.number + 1 : 1;
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
        await model.save();
        yield {
            event: `${candle.granularity}-line-break-closed`,
            time: new Date().toISOString(),
            candleTime: candle.time,
            isDispatched: false,
            payload: newLocal,
        };
    }
}