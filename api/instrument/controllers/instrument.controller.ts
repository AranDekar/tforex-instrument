import * as api from '../../instrument';

export async function getInstruments(req, res, next) {
    try {
        let result: api.Instrument[] = [];
        let _id: string | undefined;
        if (req.swagger.params && req.swagger.params._id) {
            _id = req.swagger.params._id.value;
        }

        let service = new api.InstrumentService();
        let data = await service.get(_id);
        res.json(data);
    } catch (err) {
        res.statusCode = 500; // bad server
        next(err);
    }
}
export async function importInstruments(req, res, next) {
    try {
        let service = new api.InstrumentService();
        await service.sync();
        res.status(200).send({ message: 'imported successfully' });
    } catch (err) {
        res.statusCode = 500; // bad server
        next(err);
    }
}