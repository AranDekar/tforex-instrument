import * as mongoose from 'mongoose';
import * as kafka from 'kafka-node';

import * as api from '../../../api';

export class InstrumentEventProducerProxy {

    constructor(private topic: string) {
    }

    public publish(events: api.models.InstrumentEventDocument[]) {
        console.log(`trying to connect to ${api.shared.Config.settings.kafka_conn_string} in producer`);
        const client = new kafka.KafkaClient({
            kafkaHost: api.shared.Config.settings.kafka_conn_string,
        });
        const producer = new kafka.Producer(client);
        producer.on('ready', () => {
            for (const event of events) {
                const payload = { topic: this.topic, messages: JSON.stringify(event) };
                producer.send([payload], (err, data) => {
                    if (err) {
                        console.log(err);
                    }
                    event.isDispatched = true;
                    event.save();
                });
            }
        });

        producer.on('error', (err) => {
            console.log(err);
        });
    }
}