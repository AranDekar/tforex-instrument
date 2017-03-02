
import * as api from '../../candle';
import * as shared from '../../shared';

export async function getHistoryData(req, res, next) {
    try {
        let instrument: shared.InstrumentEnum;
        let granularity: shared.GranularityEnum;
        let topic: string;

        topic = req.swagger.params.topic.value;
        instrument = req.swagger.params.instrument.value;
        granularity = req.swagger.params.granularity.value;

        let service = new api.CandleService();
        await service.getHistoryData(topic, instrument, granularity);
        res.json('candles are being published');
    } catch (err) {
        res.statusCode = 500; // bad server
        throw req.swagger.errors.notFound('pet');
        // next(err);
    }
}