"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const api = require("api");
async function getInstruments(req, res, next) {
    try {
        let title;
        if (req.swagger.params && req.swagger.params.title) {
            title = req.swagger.params.title.value;
        }
        const service = new api.services.InstrumentService();
        const data = await service.get(title);
        res.json(data);
    }
    catch (err) {
        res.statusCode = 500; // bad server
        next(err);
    }
}
exports.getInstruments = getInstruments;
//# sourceMappingURL=instrument.controller.js.map