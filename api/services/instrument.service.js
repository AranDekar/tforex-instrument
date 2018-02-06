"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const api = require("../../api");
class InstrumentService {
    async get(title) {
        if (title) {
            const t = await api.models.instrumentModel.find({ title }).exec();
            return t;
        }
        else {
            return await api.models.instrumentModel.find().exec();
        }
    }
    async sync() {
        const service = new api.proxies.OandaProxy();
        const instruments = await service.getInstruments();
        const localInstruments = await this.get(undefined);
        for (const instrument of instruments) {
            const mappedInstrument = instrument;
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
            }
            else {
                const model = new api.models.instrumentModel(mappedInstrument);
                await model.save();
            }
        }
    }
}
exports.InstrumentService = InstrumentService;
//# sourceMappingURL=instrument.service.js.map