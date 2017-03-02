import * as mongoose from 'mongoose';
import * as kafka from 'kafka-node';

import * as api from '../../../api';

export class CandleHistoryMessageProducerService {
    private _producer: kafka.Producer;

    public async ProduceHistoryData(topic: string, candles: api.Candle[]): Promise<void> {
        let client = new kafka.Client(
            api.Config.settings.kafka_conn_string,
            api.Config.settings.candle_history_client_id);

        this._producer = new kafka.Producer(client);

        this._producer.on('ready', () => {
            for (let item of candles) {
                let keyedMessages: kafka.KeyedMessage[] = [];
                keyedMessages.push(new kafka.KeyedMessage(item.time, JSON.stringify(item)));
                // this topic is not created yet so we first need to create the topic
                // there is a property in config/server.properties called auto.create.topics.enable
                // by default this property is set to true and it means if you send a message to a
                // non-existing topic kafka creates it for you

                let produceRequests: kafka.ProduceRequest[] = [{
                    topic: topic,
                    messages: keyedMessages,
                }];

                if (keyedMessages.length > 0) {
                    this._producer.send(produceRequests, (err, data) => {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log(`${candles.length} number of candles were published for backtesting`);
                        }
                    });
                }
            }
        });

        this._producer.on('error', (err) => {
            console.log(err);
        });
    }
}
