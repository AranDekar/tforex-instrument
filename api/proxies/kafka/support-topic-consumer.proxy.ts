import * as kafka from 'kafka-node';

import * as api from 'api';

const asyncLock = require('async-lock');

const supportTopic = 'support';
const importInstruments = 'import_instruments';
const importCandles = 'import_candles';
const produceEvents = 'produce_events';

export class SupportTopicConsumerProxy {
    private consumer: kafka.Consumer;

    public connect() {
        console.log(`trying to connect to ${api.shared.Config.settings.kafka_conn_string} in consumer`);
        const client = new kafka.KafkaClient({
            kafkaHost: api.shared.Config.settings.kafka_conn_string,
        });

        this.consumer = new kafka.Consumer(
            client, [
                { topic: supportTopic },
            ], {
                autoCommit: true,
                groupId: api.shared.Config.settings.client_id,
            },
        );
        // if you don't see any message coming, it may be because you have deleted the topic and the offset
        // is not reset with this client id.
        const lock = new asyncLock();
        const key = null;
        const opts = null;
        this.consumer.on('message', async (message: any) => {
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
                                const instrumentService = new api.services.InstrumentService();

                                const instrumentItem = await instrumentService.get(item.instrument);
                                if (instrumentItem[0] && item.granularity) {
                                    if (instrumentItem[0].granularities.indexOf(item.granularity) === -1) {
                                        instrumentItem[0].granularities.push(item.granularity);
                                        await instrumentItem[0].save();
                                    }

                                    const service = new api.services.CandleSyncService();
                                    await service.sync(item.instrument);
                                } else {
                                    throw new Error('instrument is not imported!');
                                }
                                return;
                            }, opts).then(() => {
                                console.log('lock released');
                            }).catch((err) => {
                                console.error(err.message);
                            });
                            break;
                        case produceEvents:
                            lock.acquire(key, async () => {
                                const instrumentEventProducerService =
                                    new api.services.InstrumentEventProducerService();

                                const service = new api.services.CandleSyncService();
                                await instrumentEventProducerService.produceNewEvents(item.instrument);
                                await instrumentEventProducerService.publishNewEvents(item.instrument);

                                return;
                            }, opts).then(() => {
                                console.log('lock released');
                            }).catch((err) => {
                                console.error(err.message);
                            });
                            break;
                    }
                } catch (err) {
                    console.error(err);
                    return;
                }
            }
        });

        this.consumer.on('error', (err: string) => {
            console.log(err);
        });
    }
    public resetOffset() {
        this.consumer.setOffset(supportTopic, 0, 0);
    }
}

setTimeout(async () => {
    const prx = new SupportTopicConsumerProxy();
    prx.connect();
}, 5000);