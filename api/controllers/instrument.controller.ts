import * as api from '../../api';

export async function getInstruments(req, res, next) {
    try {
        let result: api.models.Instrument[] = [];
        let title: api.enums.InstrumentEnum | undefined;
        if (req.swagger.params && req.swagger.params.title) {
            title = req.swagger.params.title.value;
        }

        let service = new api.services.InstrumentService();
        let data = await service.get(title);
        res.json(data);
    } catch (err) {
        res.statusCode = 500; // bad server
        next(err);
    }
}