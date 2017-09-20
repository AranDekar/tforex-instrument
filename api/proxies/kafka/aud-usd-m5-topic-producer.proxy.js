"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const kafka = require("kafka-node");
const api = require("../../../api");
const audUsdM5Topic = 'audUsdM5';
class AudUsdM5TopicProducerProxy {
    send(candle) {
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
exports.AudUsdM5TopicProducerProxy = AudUsdM5TopicProducerProxy;

//# sourceMappingURL=aud-usd-m5-topic-producer.proxy.js.map
