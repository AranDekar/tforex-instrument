"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const kafka = require("kafka-node");
const api = require("../../../api");
class InstrumentEventProducerProxy {
    constructor(topic) {
        this.topic = topic;
    }
    publish(events) {
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
exports.InstrumentEventProducerProxy = InstrumentEventProducerProxy;
//# sourceMappingURL=instrument-event-producer.proxy.js.map