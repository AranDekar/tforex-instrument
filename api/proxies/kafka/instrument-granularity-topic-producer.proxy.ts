import * as mongoose from 'mongoose';
import * as kafka from 'kafka-node';

import * as api from '../../../api';

export class InstrumentGranularityTopicProducerProxy {
    private _producer: kafka.Producer;

    constructor(private _topicName: string, private _candleModel: api.models.CandleModel) {
    }

    public async publish() {
        console.log(`trying to connect to ${api.shared.Config.settings.kafka_conn_string} in consumer`);
        let unpatched = await this._candleModel.findUndispatchedCandles(this._candleModel);

        let client = new kafka.KafkaClient({
            kafkaHost: api.shared.Config.settings.kafka_conn_string,
        });

        this._producer = new kafka.Producer(client);

        this._producer.on('ready', () => {
            let payloads: any[] = [];
            for (let item of unpatched) {
                payloads.push({ topic: this._topicName, messages: JSON.stringify(item) });
            }
            this._producer.send(payloads, (err, data) => {
                if (err) {
                    console.log(err);
                } else {
                    for (let item of unpatched) {
                        item.isDispatched = true;
                        item.save();
                    }
                }
            });
        });

        this._producer.on('error', (err) => {
            console.log(err);
        });
    }
}