"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const kafka = require("kafka-node");
const shared = require("../../shared");
const testTopic = 'tets';
class TestTopicConsumerProxy {
    connect() {
        console.log(`trying to connect to ${shared.Config.settings.kafka_conn_string} in consumer`);
        let client = new kafka.KafkaClient({
            kafkaHost: shared.Config.settings.kafka_conn_string,
        });
        this._consumer = new kafka.Consumer(client, [
            { topic: testTopic },
        ], {
            autoCommit: true,
            groupId: shared.Config.settings.client_id,
        });
        // if you don't see any message coming, it may be because you have deleted the topic and the offset 
        // is not reset with this client id.
        this._consumer.on('message', (message) => __awaiter(this, void 0, void 0, function* () {
            console.log('new message is received');
            if (message && message.value) {
                console.log(message.value);
            }
        }));
        this._consumer.on('error', (err) => {
            console.log(err);
        });
    }
    resetOffset() {
        this._consumer.setOffset(testTopic, 0, 0);
    }
}
exports.TestTopicConsumerProxy = TestTopicConsumerProxy;
setTimeout(() => __awaiter(this, void 0, void 0, function* () {
    let prx = new TestTopicConsumerProxy();
    prx.connect();
}), 2000);

//# sourceMappingURL=test-topic-consumer.proxy.js.map
