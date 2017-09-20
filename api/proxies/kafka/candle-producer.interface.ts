import * as api from '../../../api';

export interface CandleProducer {
    send(candle: api.models.Candle);
}