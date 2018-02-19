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
const api = require("api");
function getInstruments(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let title;
            if (req.swagger.params && req.swagger.params.title) {
                title = req.swagger.params.title.value;
            }
            const service = new api.services.InstrumentService();
            const data = yield service.get(title);
            res.json(data);
        }
        catch (err) {
            res.statusCode = 500; // bad server
            next(err);
        }
    });
}
exports.getInstruments = getInstruments;
//# sourceMappingURL=instrument.controller.js.map