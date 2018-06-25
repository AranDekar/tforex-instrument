import { Types, Model } from 'mongoose';

import * as api from '../../api';
export class CandleService {

    public async get(instrument: string, granularity: api.enums.GranularityEnum):
        Promise<api.models.CandleDocument[]> {
        const candleModel = this.getModel(api.enums.InstrumentEnum[instrument]);

        if (!candleModel) {
            throw new Error('cannot get the candle model!');
        }
        return await candleModel.getAllCandles(candleModel, granularity);
    }

    /**
     * obsolete
     * @param granularity
     * @param endDate
     */
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
            case api.enums.GranularityEnum.D:
                endTime = new Date(endTime.getFullYear(), endTime.getMonth(), endTime.getDate() + 2);
                break;
        }
        if (endTime >= new Date()) {
            return true;
        } else {
            return false;
        }
    }

    public getModel(instrument: api.enums.InstrumentEnum):
        api.models.CandleModel {
        switch (instrument) {
            case api.enums.InstrumentEnum.AUD_USD:
                return api.models.audUsdCandlesModel;
            case api.enums.InstrumentEnum.GBP_USD:
                return api.models.gbpUsdCandlesModel;
            case api.enums.InstrumentEnum.EUR_USD:
                return api.models.eurUsdCandlesModel;
        }
        throw new Error(`CandleModel is undefined for ${instrument}`);
    }
    public getHeikinAshiModel(instrument: api.enums.InstrumentEnum): api.models.HeikinAshiModel {
        switch (instrument) {
            case api.enums.InstrumentEnum.AUD_USD:
                return api.models.audUsdHeikinAshisModel;
            case api.enums.InstrumentEnum.GBP_USD:
                return api.models.gbpUsdHeikinAshisModel;
            case api.enums.InstrumentEnum.EUR_USD:
                return api.models.eurUsdHeikinAshisModel;
        }
        throw new Error(`HeikinAshiModel is undefined for ${instrument}`);
    }
    public getLineBreakModel(instrument: api.enums.InstrumentEnum): api.models.LineBreakModel {
        switch (instrument) {
            case api.enums.InstrumentEnum.AUD_USD:
                return api.models.audUsdLineBreaksModel;
            case api.enums.InstrumentEnum.GBP_USD:
                return api.models.gbpUsdLineBreaksModel;
            case api.enums.InstrumentEnum.EUR_USD:
                return api.models.eurUsdLineBreaksModel;
        }
        throw new Error(`HeikinAshiModel is undefined for ${instrument}`);
    }
}
