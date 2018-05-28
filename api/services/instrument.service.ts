import { Types } from 'mongoose';

import * as api from '../../api';

export class InstrumentService {
    public async get(title: api.enums.InstrumentEnum | undefined):
        Promise<api.models.InstrumentDocument[]> {
        if (title) {
            const t = await api.models.instrumentModel.find({ title }).exec();
            return t;
        } else {
            return await api.models.instrumentModel.find().exec();
        }
    }

    public async getEvents(title: api.enums.InstrumentEnum, candleTime: Date | undefined, events: string | undefined):
        Promise<api.models.InstrumentEventDocument[]> {
        let eventsArr: string[] = [];
        if (!candleTime) {
            candleTime = new Date('1900-01-01');
        }
        if (events) {
            eventsArr = events.split(',');
        }

        const model = this.getInstrumentEventModel(title);
        const data = await model.findEventsByTimeEvents(model, candleTime, eventsArr);
        return data;
    }

    public async sync() {
        const service = new api.proxies.OandaProxy();
        const instruments = await service.getInstruments();
        const localInstruments = await this.get(undefined);

        for (const instrument of instruments) {
            const mappedInstrument: api.models.Instrument = instrument;
            mappedInstrument.title = instrument.instrument;

            const localInstrument = localInstruments.find((x) => x.title === mappedInstrument.title);
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
                const model = new api.models.instrumentModel(mappedInstrument);
                await model.save();
            }
        }
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
}