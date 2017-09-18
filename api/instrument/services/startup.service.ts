import * as kafka from 'kafka-node';

import * as api from '../../instrument';

export class KafkaTestProducerService {
    private static _producer: kafka.Producer;
    public static connect() {

        console.log(`trying to connect to ${api.shared.Config.settings.kafka_conn_string} in producer`);
        let client = new kafka.Client(
            api.shared.Config.settings.kafka_conn_string,
            api.shared.Config.settings.client_id);

        KafkaTestProducerService._producer = new kafka.HighLevelProducer(client);
        (<any>client).refreshMetadata(['test'], (err, data) => {
            let produceRequests: kafka.ProduceRequest[] = [{
                topic: 'test',
                messages: 'hi',
            }];

            this._producer.on('ready', () => {
                this._producer.send(produceRequests, (sendErr, sendData) => {
                    if (sendErr) {
                        console.log(sendErr);
                    } else {
                        console.log('message is sent');
                    }
                });
            });
            this._producer.on('error', (prerr) => {
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
