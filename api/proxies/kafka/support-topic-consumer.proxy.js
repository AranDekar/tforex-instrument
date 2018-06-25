"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const kafka = require("kafka-node");
const asyncLock = require("async-lock");
const api = require("api");
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
        const key = '';
        const opts = undefined;
        this.consumer.on('message', async (message) => {
            if (message && message.value) {
                try {
                    const item = JSON.parse(message.value);
                    switch (item.command) {
                        case importInstruments:
                            lock.acquire(key, async () => {
                                const svc = new api.services.InstrumentService();
                                await svc.sync();
                                return;
                            }, opts).then(() => {
                                console.log('lock released');
                            }).catch((err) => {
                                console.error(err.message);
                            });
                            break;
                        case importCandles:
                            lock.acquire(key, async () => {
                                const service = new api.services.CandleSyncService();
                                await service.sync(item.instrument);
                                return;
                            }, opts).then(() => {
                                console.log('lock released');
                            }).catch((err) => {
                                console.error(err.message);
                            });
                            break;
                        case produceEvents:
                            lock.acquire(key, async () => {
                                const instrumentEventProducerService = new api.services.InstrumentEventProducerService();
                                const service = new api.services.CandleSyncService();
                                await instrumentEventProducerService.reproduceEvents(item.instrument);
                                // events.forEach((e) => e.isDispatched = true);
                                // await instrumentEventProducerService.saveNewEvents(item.instrument, events, true);
                                return;
                            }, opts).then(() => {
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
        });
        this.consumer.on('error', (err) => {
            console.log(err);
            setTimeout(async () => {
                const prx = new SupportTopicConsumerProxy();
                prx.connect();
            }, 5000);
        });
    }
    resetOffset() {
        this.consumer.setOffset(supportTopic, 0, 0);
    }
}
exports.SupportTopicConsumerProxy = SupportTopicConsumerProxy;
setTimeout(async () => {
    const prx = new SupportTopicConsumerProxy();
    prx.connect();
}, 50000);
//# sourceMappingURL=support-topic-consumer.proxy.js.map