import { Types, Model } from 'mongoose';

import * as api from '../../candle';
import * as shared from '../../shared';

export class CandleService {
    public async get(instrument: string, granularity: shared.GranularityEnum, timeFrom: Date, timeTo: Date | undefined):
        Promise<api.CandleDocument[]> {
        let candleModel = this.getModel(shared.InstrumentEnum[instrument], granularity);
        if (!candleModel) {
            throw new Error('cannot get the candle model!');
        }
        return await candleModel.find({ instrument: instrument }).exec();
    }

    public getModel(instrument: shared.InstrumentEnum, granularity: shared.GranularityEnum): api.CandleModel | undefined {
        switch (instrument) {
            case shared.InstrumentEnum.AUD_USD:
                switch (granularity) {
                    case shared.GranularityEnum.M5:
                        return api.candles.audUsdM5;
                }
                break;
        }
    }
}