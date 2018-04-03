import * as kafka from 'kafka-node';

import * as api from '../../api';

export class KafkaTestProducerService {
    private static producer: kafka.Producer;
    public static connect() {

        console.log(`trying to connect to ${api.shared.Config.settings.kafka_conn_string} in producer`);
        const client = new kafka.Client(
            api.shared.Config.settings.kafka_conn_string,
            api.shared.Config.settings.client_id);

        KafkaTestProducerService.producer = new kafka.HighLevelProducer(client);
        (client as any).refreshMetadata(['test'], (err, data) => {
            const produceRequests: kafka.ProduceRequest[] = [{
                topic: 'test',
                messages: 'hi',
            }];

            this.producer.on('ready', () => {
                this.producer.send(produceRequests, (sendErr, sendData) => {
                    if (sendErr) {
                        console.log(sendErr);
                    } else {
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
