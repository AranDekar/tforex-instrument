import * as api from '../../candle';
import * as instrument from '../../instrument';
import * as shared from '../../shared';

export async function getCandles(req, res, next) {
    try {
        let result: api.models.Candle;
        let instrument: string;
        let granularity: shared.GranularityEnum;

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

export async function getHistoryData(req, res, next) {
    try {
        let instrument: shared.InstrumentEnum;
        let granularity: shared.GranularityEnum;
        let topic: string;

        topic = req.swagger.params.topic.value;
        instrument = req.swagger.params.instrument.value;
        granularity = req.swagger.params.granularity.value;

        let service = new api.services.CandleService();
        await service.getHistoryData(topic, instrument, granularity);
        res.status(200).json({ message: 'candles are being published' });
    } catch (err) {
        res.statusCode = 500; // bad server
        next(err);
    }
}