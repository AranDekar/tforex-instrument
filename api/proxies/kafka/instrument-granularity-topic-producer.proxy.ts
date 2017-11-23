import * as mongoose from 'mongoose';
import * as kafka from 'kafka-node';

import * as api from '../../../api';

export class InstrumentGranularityTopicProducerProxy {
    private _producer: kafka.Producer;

    constructor(
        private _topicName: string,
        private _candles: api.models.Candle[] | null,
        private _candleModel: api.models.CandleModel | null) {
    }

    public publish() {
        return new Promise<boolean>(async (resolve, reject) => {
            console.log(`trying to connect to ${api.shared.Config.settings.kafka_conn_string} in consumer`);
            let undispatched;
            if (this._candles) {
                undispatched = this._candles;
            } else if (this._candleModel) {
                undispatched = await this._candleModel.findUndispatchedCandles(this._candleModel);
            }

            if (undispatched.length === 0) {
                console.log('no candles to publish!');
                return;
            }

            let client = new kafka.KafkaClient({
                kafkaHost: api.shared.Config.settings.kafka_conn_string,
            });

            this._producer = new kafka.Producer(client);

            this._producer.on('ready', () => {
                let payloads: any[] = [];
                for (let item of undispatched) {
                    payloads.push({ topic: this._topicName, messages: JSON.stringify(item) });
                }
                this._producer.send(payloads, (err, data) => {
                    if (err) {
                        console.log(err);
                        reject(err);
                    } else if (!this._candles) {
                        for (let item of undispatched) {
                            item.isDispatched = true;
                            item.save();
                        }
                    }
                    resolve(true);
                });
            });

            this._producer.on('error', (err) => {
                console.log(err);
                reject(err);
            });
        });
    }
}