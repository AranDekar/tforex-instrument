import * as api from '../../instrument';

export async function getCandles(req, res, next) {
    try {
        let result: api.models.Candle;
        let instrument: string;
        let granularity: api.enums.GranularityEnum;

        instrument = req.swagger.params.instrument.value;
        granularity = req.swagger.params.granularity.value;

        let service = new api.services.CandleService();

        let data = await service.get(instrument, granularity);
        if (data) {
            res.status(200).json(data);
        } else {
            res.statusCode = 404;
            next(new Error('Not found'));
        }
    } catch (err) {
        res.statusCode = 500; // bad server
        next(err);
    }
}
