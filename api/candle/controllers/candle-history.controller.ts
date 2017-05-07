
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

        let service = new api.Service.CandleService();
        await service.getHistoryData(topic, instrument, granularity);
        res.status(200).json({ message: 'candles are being published' });
    } catch (err) {
        res.statusCode = 500; // bad server
        next(err);
    }
}