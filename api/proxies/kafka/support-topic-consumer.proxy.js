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
const api = require("api");
const asyncLock = require('async-lock');
const supportTopic = 'support';
const importInstruments = 'import_instruments';
const importCandles = 'import_candles';
const produceEvents = 'produce_events';
class SupportTopicConsumerProxy {
    connect() {
        console.log(`trying to connect to ${api.shared.Config.settings.kafka_conn_string} in consumer`);
        const client = new kafka.KafkaClient({
            kafkaHost: api.shared.Config.settings.kafka_conn_string,
            requestTimeout: 180000,
        });
        this.consumer = new kafka.Consumer(client, [
            { topic: supportTopic },
        ], {
            autoCommit: true,
            groupId: api.shared.Config.settings.client_id,
        });
        // if you don't see any message coming, it may be because you have deleted the topic and the offset
        // is not reset with this client id.
        const lock = new asyncLock();
        const key = null;
        const opts = null;
        this.consumer.on('message', (message) => __awaiter(this, void 0, void 0, function* () {
            if (message && message.value) {
                try {
                    const item = JSON.parse(message.value);
                    switch (item.command) {
                        case importInstruments:
                            lock.acquire(key, () => __awaiter(this, void 0, void 0, function* () {
                                const svc = new api.services.InstrumentService();
                                yield svc.sync();
                                return;
                            }), opts).then(() => {
                                console.log('lock released');
                            }).catch((err) => {
                                console.error(err.message);
                            });
                            break;
                        case importCandles:
                            lock.acquire(key, () => __awaiter(this, void 0, void 0, function* () {
                                const service = new api.services.CandleSyncService();
                                yield service.sync(item.instrument);
                                return;
                            }), opts).then(() => {
                                console.log('lock released');
                            }).catch((err) => {
                                console.error(err.message);
                            });
                            break;
                        case produceEvents:
                            lock.acquire(key, () => __awaiter(this, void 0, void 0, function* () {
                                const instrumentEventProducerService = new api.services.InstrumentEventProducerService();
                                const service = new api.services.CandleSyncService();
                                yield instrumentEventProducerService.produceNewEvents(item.instrument);
                                yield instrumentEventProducerService.publishNewEvents(item.instrument);
                                return;
                            }), opts).then(() => {
                                console.log('lock released');
                            }).catch((err) => {
                                console.error(err.message);
                            });
                            break;
                    }
                }
                catch (err) {
                    console.error(err);
                    return;
                }
            }
        }));
        this.consumer.on('error', (err) => {
            console.log(err);
        });
    }
    resetOffset() {
        this.consumer.setOffset(supportTopic, 0, 0);
    }
}
exports.SupportTopicConsumerProxy = SupportTopicConsumerProxy;
setTimeout(() => __awaiter(this, void 0, void 0, function* () {
    const prx = new SupportTopicConsumerProxy();
    prx.connect();
}), 20000);
//# sourceMappingURL=support-topic-consumer.proxy.js.map