import { Types } from 'mongoose';

import * as api from '../../instrument';
import * as shared from '../../shared';
import * as candle from '../../candle';

export class InstrumentService {
    public async get(title: shared.InstrumentEnum | undefined = undefined): Promise<api.models.InstrumentDocument[]> {
        if (title) {
            let t = await api.models.instrumentModel.find({ title: title }).exec();
            return t;
        } else {
            return await api.models.instrumentModel.find().exec();
        }
    }

    public async sync() {
        let service = new shared.OandaService();
        let instruments = await service.getInstruments();
        let localInstruments = await this.get();

        for (let instrument of instruments) {
            let mappedInstrument: api.models.Instrument = instrument;
            mappedInstrument.title = instrument.instrument;

            let localInstrument = localInstruments.find(x => x.title === mappedInstrument.title);
            if (localInstrument) {
                // update the local instrument prtially
                localInstrument.displayName = mappedInstrument.displayName;
                localInstrument.halted = mappedInstrument.halted;
                localInstrument.title = mappedInstrument.title;
                localInstrument.marginRate = mappedInstrument.marginRate;
                localInstrument.maxTradeUnits = mappedInstrument.maxTradeUnits;
                localInstrument.maxTrailingStop = mappedInstrument.maxTrailingStop;
                localInstrument.minTrailingStop = mappedInstrument.minTrailingStop;
                localInstrument.pip = mappedInstrument.pip;
                localInstrument.precision = mappedInstrument.precision;
                localInstrument.path = mappedInstrument.path;
                await localInstrument.save();
            } else {
                let model = new api.models.instrumentModel(mappedInstrument);
                await model.save();
            }
        }

        for (let localInstrument of localInstruments.filter(x => x.granularities.length > 0)) {
            await this.syncCandles(localInstrument);
        }
    }
    private async syncCandles(instrument: api.models.InstrumentDocument) {
        let candleService = new candle.services.CandleSyncService();
        for (let granularity of instrument.granularities) {
            candleService.instrument = shared.InstrumentEnum[instrument.title];
            candleService.granularity = shared.GranularityEnum[granularity];
            await candleService.sync();
            break;
        }
    }
}