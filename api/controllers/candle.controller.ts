import * as api from '../../api';

export async function getCandles(req, res, next) {
    try {
        let result: api.models.Candle;
        let instrument: string;
        let granularity: api.enums.GranularityEnum;
        let topic: string;

        instrument = req.swagger.params.instrument.value;
        granularity = req.swagger.params.granularity.value;
        topic = req.swagger.params.topic.value;

        let service = new api.services.CandleService();

        let count = await service.publish(instrument, granularity, topic);

        res.status(200).json({ count: count });
    } catch (err) {
        res.statusCode = 500; // bad server
        next(err);
    }
}
