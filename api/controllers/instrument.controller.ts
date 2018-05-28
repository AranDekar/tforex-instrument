import * as api from 'api';

export async function getInstruments(req, res, next) {
    try {
        let title: api.enums.InstrumentEnum | undefined;
        if (req.swagger.params && req.swagger.params.title) {
            title = req.swagger.params.title.value;
        }

        const service = new api.services.InstrumentService();
        const data = await service.get(title);
        res.json(data);
    } catch (err) {
        res.statusCode = 500; // bad server
        next(err);
    }
}

export async function getEvents(req, res, next) {
    try {
        const service = new api.services.InstrumentService();
        const data = await service.getEvents(req.swagger.params.instrument.value,
            req.swagger.params.candleTime.value,
            req.swagger.params.events.value);
        res.json(data);
    } catch (err) {
        res.statusCode = 500; // bad server
        next(err);
    }
}
