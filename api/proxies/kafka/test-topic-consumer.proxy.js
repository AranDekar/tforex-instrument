"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const kafka = require("kafka-node");
const api = require("../../../api");
const testTopic = 'tets';
class TestTopicConsumerProxy {
    connect() {
        console.log(`trying to connect to ${api.shared.Config.settings.kafka_conn_string} in consumer`);
        const client = new kafka.KafkaClient({
            kafkaHost: api.shared.Config.settings.kafka_conn_string,
        });
        this.consumer = new kafka.Consumer(client, [
            { topic: testTopic },
        ], {
            autoCommit: true,
            groupId: api.shared.Config.settings.client_id,
        });
        // if you don't see any message coming, it may be because you have deleted the topic and the offset
        // is not reset with this client id.
        this.consumer.on('message', async (message) => {
            console.log('new message is received');
            if (message && message.value) {
                console.log(message.value);
            }
        });
        this.consumer.on('error', (err) => {
            console.log(err);
        });
    }
    resetOffset() {
        this.consumer.setOffset(testTopic, 0, 0);
    }
}
exports.TestTopicConsumerProxy = TestTopicConsumerProxy;
setTimeout(async () => {
    const prx = new TestTopicConsumerProxy();
    prx.connect();
}, 2000);
//# sourceMappingURL=test-topic-consumer.proxy.js.map