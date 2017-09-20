import * as mongoose from 'mongoose';
import * as kafka from 'kafka-node';

import * as api from '../../../api';

const audUsdM5Topic = 'audUsdM5';

export class AudUsdM5TopicProducerProxy implements api.proxies.CandleProducer {
    private _producer: kafka.Producer;

    public send(candle: api.models.Candle) {
        console.log(`trying to connect to ${api.shared.Config.settings.kafka_conn_string} in consumer`);
        let client = new kafka.KafkaClient({
            kafkaHost: api.shared.Config.settings.kafka_conn_string,
        });

        this._producer = new kafka.Producer(client);

        this._producer.on('ready', () => {
            let payloads = [
                { topic: audUsdM5Topic, messages: JSON.stringify(candle) },
            ];

            this._producer.send(payloads, (err, data) => {
                if (err) {
                    console.log(err);
                }
            });
        });

        this._producer.on('error', (err) => {
            console.log(err);
        });
    }
}