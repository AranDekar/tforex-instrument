"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const api = require("../../instrument");
const shared = require("../../shared");
const candle = require("../../candle");
class InstrumentService {
    get(id = undefined) {
        return __awaiter(this, void 0, void 0, function* () {
            if (id) {
                return yield api.instrumentModel.find({ id: id }).exec();
            }
            else {
                return yield api.instrumentModel.find().exec();
            }
        });
    }
    getByTitle(title) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield api.instrumentModel.findOne({ title: title }).exec();
        });
    }
    sync() {
        return __awaiter(this, void 0, void 0, function* () {
            let service = new shared.OandaService();
            let instruments = yield service.getInstruments();
            let localInstruments = yield this.get();
            for (let instrument of instruments) {
                let mappedInstrument = instrument;
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
                    yield localInstrument.save();
                }
                else {
                    let model = new api.instrumentModel(mappedInstrument);
                    yield model.save();
                }
            }
            for (let localInstrument of localInstruments.filter(x => x.granularities.length > 0)) {
                yield this.syncCandles(localInstrument);
            }
        });
    }
    syncCandles(instrument) {
        return __awaiter(this, void 0, void 0, function* () {
            let candleService = new candle.CandleSyncService();
            for (let granularity of instrument.granularities) {
                candleService.instrument = shared.InstrumentEnum[instrument.title];
                candleService.granularity = shared.GranularityEnum[granularity];
                yield candleService.sync();
                break;
            }
        });
    }
}
exports.InstrumentService = InstrumentService;

//# sourceMappingURL=instrument.service.js.map
