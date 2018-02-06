import * as api from 'api';

export async function getCandles(req, res, next) {
    try {
        let instrument: string;
        let granularity: api.enums.GranularityEnum;
        let topic: string;

        instrument = req.swagger.params.instrument.value;
        granularity = req.swagger.params.granularity.value;
        topic = req.swagger.params.topic.value;

        const service = new api.services.CandleService();
        const data = service.get(instrument, granularity);
        res.status(200).json(data);
    } catch (err) {
        res.statusCode = 500; // bad server
        next(err);
    }
}

function subStringsKDist(inputStr: string, num) {
    // there are some constraints for num so I don't inclue any
    // validation here

}
