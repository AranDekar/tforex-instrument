import * as api from '../../../instrument';

export interface CandleProducer {
    send(candle: api.models.Candle);
}