"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const api = require("api");
async function getCandles(req, res, next) {
    try {
        let instrument;
        let granularity;
        let topic;
        instrument = req.swagger.params.instrument.value;
        granularity = req.swagger.params.granularity.value;
        topic = req.swagger.params.topic.value;
        const service = new api.services.CandleService();
        const data = service.get(instrument, granularity);
        res.status(200).json(data);
    }
    catch (err) {
        res.statusCode = 500; // bad server
        next(err);
    }
}
exports.getCandles = getCandles;
function subStringsKDist(inputStr, num) {
    // there are some constraints for num so I don't inclue any
    // validation here
}
//# sourceMappingURL=candle.controller.js.map