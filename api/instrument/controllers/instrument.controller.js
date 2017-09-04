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
function getInstruments(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let result = [];
            let _id;
            if (req.swagger.params && req.swagger.params._id) {
                _id = req.swagger.params._id.value;
            }
            let service = new api.InstrumentService();
            let data = yield service.get(_id);
            res.json(data);
        }
        catch (err) {
            res.statusCode = 500; // bad server
            next(err);
        }
    });
}
exports.getInstruments = getInstruments;
function importInstruments(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let service = new api.InstrumentService();
            yield service.sync();
            res.status(200).send({ message: 'imported successfully' });
        }
        catch (err) {
            res.statusCode = 500; // bad server
            next(err);
        }
    });
}
exports.importInstruments = importInstruments;

//# sourceMappingURL=instrument.controller.js.map
