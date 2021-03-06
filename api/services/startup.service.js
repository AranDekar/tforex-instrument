"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const kafka = require("kafka-node");
const api = require("../../api");
class KafkaTestProducerService {
    static connect() {
        console.log(`trying to connect to ${api.shared.Config.settings.kafka_conn_string} in producer`);
        const client = new kafka.Client(api.shared.Config.settings.kafka_conn_string, api.shared.Config.settings.client_id);
        KafkaTestProducerService.producer = new kafka.HighLevelProducer(client);
        client.refreshMetadata(['test'], (err, data) => {
            const produceRequests = [{
                    topic: 'test',
                    messages: 'hi',
                }];
            this.producer.on('ready', () => {
                this.producer.send(produceRequests, (sendErr, sendData) => {
                    if (sendErr) {
                        console.log(sendErr);
                    }
                    else {
                        console.log('message is sent');
                    }
                });
            });
            this.producer.on('error', (prerr) => {
                console.log(prerr);
            });
        });
        // (<any>client).refreshMetadata(['test'], (err, data) => {
        //     if (err) {
        //         console.log(err);
        //     } else {
        //         KafkaTestProducerService._producer = new kafka.HighLevelProducer(client);
        //         let produceRequests: kafka.ProduceRequest[] = [{
        //             topic: 'test',
        //             messages: 'hi',
        //         }];
        //         this._producer.on('ready', () => {
        //             this._producer.send(produceRequests, (sendErr, sendData) => {
        //                 if (sendErr) {
        //                     console.log(sendErr);
        //                 } else {
        //                     console.log('message is sent');
        //                 }
        //             });
        //         });
        //         this._producer.on('error', (prerr) => {
        //             console.log(prerr);
        //         });
        //     }
        // });
    }
}
exports.KafkaTestProducerService = KafkaTestProducerService;
//# sourceMappingURL=startup.service.js.map