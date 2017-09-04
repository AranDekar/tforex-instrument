import * as api from '../../candle';
import * as instrument from '../../instrument';
import * as shared from '../../shared';

export async function getCandles(req, res, next) {
    try {
        let result: api.Model.Candle[] = [];
        let instrument: string | undefined;
        let granularity: shared.GranularityEnum | undefined;
        let timeFrom: Date | undefined;
        let timeTo: Date | undefined;

        instrument = req.swagger.params.instrument.value;
        granularity = req.swagger.params.granularity.value;
        timeFrom = req.swagger.params.timeFrom.value;
        timeTo = req.swagger.params.timeTo.value;

        let service = new api.Service.CandleService();

        if (!instrument || !granularity || !timeFrom) {
            throw new Error('arguments are not supplied!');
        }

        let data = await service.get(instrument, granularity, timeFrom, timeTo);
        res.json(data);
    } catch (err) {
        res.statusCode = 500; // bad server
        next(err);
    }
}

export async function importCandles(req, res, next) {
    let body = req.body;
    if (!body) {
        throw new Error('body is undefined');
    }
    try {

        let instrumentService = new instrument.InstrumentService();
        let instrumentItem = await instrumentService.getByTitle(body.instrument);
        if (instrumentItem.granularities.indexOf(body.granularity) === -1) {
            instrumentItem.granularities.push(body.granularity);
            await instrumentItem.save();
        }

        let service = new api.Service.CandleSyncService();
        service.instrument = body.instrument;
        service.granularity = body.granularity;

        await service.sync();

        res.json({ message: 'candles are being synced' });
    } catch (err) {
        res.statusCode = 500; // internal server error
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

        let service = new api.Service.CandleService();
        await service.getHistoryData(topic, instrument, granularity);
        res.status(200).json({ message: 'candles are being published' });
    } catch (err) {
        res.statusCode = 500; // bad server
        next(err);
    }
}