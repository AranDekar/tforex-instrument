import { Types, Model } from 'mongoose';

import * as api from '../../candle';
import * as shared from '../../shared';

export class CandleService {

    public async get(instrument: string, granularity: shared.GranularityEnum):
        Promise<api.models.CandleDocument> {
        let candleModel = this.getModel(shared.InstrumentEnum[instrument], granularity);
        if (!candleModel) {
            throw new Error('cannot get the candle model!');
        }
        return await candleModel.findLastCandle(candleModel);
    }

    public async getHistoryData(topic: string, instrument: shared.InstrumentEnum, granularity: shared.GranularityEnum) {
        let candleModel = this.getModel(instrument, granularity);
        if (!candleModel) {
            throw new Error('candle model in undefined in CandleService!');
        }
        let lastCandle: api.models.Candle = await candleModel.findLastCandle(candleModel);
        if (!lastCandle) {
            throw new Error('there is no candle to publish please first sync the candles!');
        }

        let endTime = new Date(Number(lastCandle.time)).toISOString();
        if (this.isCandleUpToDate(granularity, endTime) === false) {
            throw new Error(`candles of ${instrument} in ${granularity} are not synced to publish.`);
        }

        let allCandles = await candleModel.getAllCandles(candleModel);
        if (allCandles.length > 100) {
            allCandles = allCandles.slice(0, 3);
        }
        let producer = new api.proxies.CandleProducerProxy();
        producer.ProduceHistoryData(topic, allCandles);
    }

    public isCandleUpToDate(granularity: shared.GranularityEnum, endDate: string) {
        let endTime = new Date(endDate);

        switch (granularity) {
            case shared.GranularityEnum.M5:
                endTime = new Date(endTime.getFullYear(), endTime.getMonth(), endTime.getDate(),
                    endTime.getHours(), endTime.getMinutes() + 10);
                break;
            case shared.GranularityEnum.M15:
                endTime = new Date(endTime.getFullYear(), endTime.getMonth(), endTime.getDate(),
                    endTime.getHours(), endTime.getMinutes() + 30);
                break;
            case shared.GranularityEnum.M30:
                endTime = new Date(endTime.getFullYear(), endTime.getMonth(), endTime.getDate(),
                    endTime.getHours(), endTime.getMinutes() + 60);
                break;
            case shared.GranularityEnum.H1:
                endTime = new Date(endTime.getFullYear(), endTime.getMonth(), endTime.getDate(),
                    endTime.getHours(), endTime.getMinutes() + 120);
                break;
            case shared.GranularityEnum.H4:
                endTime = new Date(endTime.getFullYear(), endTime.getMonth(), endTime.getDate(),
                    endTime.getHours(), endTime.getMinutes() + 480);
                break;
            case shared.GranularityEnum.D1:
                endTime = new Date(endTime.getFullYear(), endTime.getMonth(), endTime.getDate() + 2);
                break;
        }
        if (endTime >= new Date()) {
            return true;
        } else {
            return false;
        }
    }

    public getModel(instrument: shared.InstrumentEnum, granularity: shared.GranularityEnum): api.models.CandleModel | undefined {
        switch (instrument) {
            case shared.InstrumentEnum.AUD_USD:
                switch (granularity) {
                    case shared.GranularityEnum.M5:
                        return api.models.candles.audUsdM5;
                }
                break;
        }
    }
}
