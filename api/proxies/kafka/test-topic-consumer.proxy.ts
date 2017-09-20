import * as kafka from 'kafka-node';

import * as api from '../../../api';

const testTopic = 'tets';

export class TestTopicConsumerProxy {
    private _consumer: kafka.Consumer;
    public connect() {
        console.log(`trying to connect to ${api.shared.Config.settings.kafka_conn_string} in consumer`);
        let client = new kafka.KafkaClient({
            kafkaHost: api.shared.Config.settings.kafka_conn_string,
        });

        this._consumer = new kafka.Consumer(
            client, [
                { topic: testTopic },
            ], {
                autoCommit: true,
                groupId: api.shared.Config.settings.client_id,
            },
        );
        // if you don't see any message coming, it may be because you have deleted the topic and the offset
        // is not reset with this client id.
        this._consumer.on('message', async (message: any) => {

            console.log('new message is received');
            if (message && message.value) {
                console.log(message.value);
            }
        });

        this._consumer.on('error', (err: string) => {
            console.log(err);
        });
    }
    public resetOffset() {
        this._consumer.setOffset(testTopic, 0, 0);
    }
}

setTimeout(async () => {
    let prx = new TestTopicConsumerProxy();
    prx.connect();
}, 2000);