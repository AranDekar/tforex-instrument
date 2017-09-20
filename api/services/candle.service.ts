import { Types, Model } from 'mongoose';

import * as api from '../../api';
export class CandleService {

    public async get(instrument: string, granularity: api.enums.GranularityEnum):
        Promise<api.models.CandleDocument> {
        let candleModel = this.getModel(api.enums.InstrumentEnum[instrument], granularity);

        if (!candleModel) {
            throw new Error('cannot get the candle model!');
        }
        return await candleModel.findLastCandle(candleModel);
    }

    public isCandleUpToDate(granularity: api.enums.GranularityEnum, endDate: string) {
        let endTime = new Date(endDate);

        switch (granularity) {
            case api.enums.GranularityEnum.M5:
                endTime = new Date(endTime.getFullYear(), endTime.getMonth(), endTime.getDate(),
                    endTime.getHours(), endTime.getMinutes() + 10);
                break;
            case api.enums.GranularityEnum.M15:
                endTime = new Date(endTime.getFullYear(), endTime.getMonth(), endTime.getDate(),
                    endTime.getHours(), endTime.getMinutes() + 30);
                break;
            case api.enums.GranularityEnum.M30:
                endTime = new Date(endTime.getFullYear(), endTime.getMonth(), endTime.getDate(),
                    endTime.getHours(), endTime.getMinutes() + 60);
                break;
            case api.enums.GranularityEnum.H1:
                endTime = new Date(endTime.getFullYear(), endTime.getMonth(), endTime.getDate(),
                    endTime.getHours(), endTime.getMinutes() + 120);
                break;
            case api.enums.GranularityEnum.H4:
                endTime = new Date(endTime.getFullYear(), endTime.getMonth(), endTime.getDate(),
                    endTime.getHours(), endTime.getMinutes() + 480);
                break;
            case api.enums.GranularityEnum.D1:
                endTime = new Date(endTime.getFullYear(), endTime.getMonth(), endTime.getDate() + 2);
                break;
        }
        if (endTime >= new Date()) {
            return true;
        } else {
            return false;
        }
    }

    public getModel(instrument: api.enums.InstrumentEnum, granularity: api.enums.GranularityEnum): api.models.CandleModel | undefined {
        switch (instrument) {
            case api.enums.InstrumentEnum.AUD_USD:
                switch (granularity) {
                    case api.enums.GranularityEnum.M5:
                        return api.models.candles.audUsdM5;
                }
                break;
        }
    }
    public getProducer(instrument: api.enums.InstrumentEnum, granularity: api.enums.GranularityEnum):
        api.proxies.CandleProducer | undefined {
        switch (instrument) {
            case api.enums.InstrumentEnum.AUD_USD:
                switch (granularity) {
                    case api.enums.GranularityEnum.M5:
                        return new api.proxies.AudUsdM5TopicProducerProxy();
                }
                break;
        }
    }
}
