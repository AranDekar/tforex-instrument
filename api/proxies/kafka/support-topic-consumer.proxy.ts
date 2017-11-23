import * as kafka from 'kafka-node';

import * as api from '../../../api';

let asyncLock = require('async-lock');

const supportTopic = 'support';
const importInstruments = 'import_instruments';
const importCandles = 'import_candles';

export class SupportTopicConsumerProxy {
    private _consumer: kafka.Consumer;

    public connect() {
        console.log(`trying to connect to ${api.shared.Config.settings.kafka_conn_string} in consumer`);
        let client = new kafka.KafkaClient({
            kafkaHost: api.shared.Config.settings.kafka_conn_string,
        });

        this._consumer = new kafka.Consumer(
            client, [
                { topic: supportTopic },
            ], {
                autoCommit: true,
                groupId: api.shared.Config.settings.client_id,
            },
        );
        // if you don't see any message coming, it may be because you have deleted the topic and the offset
        // is not reset with this client id.
        let lock = new asyncLock();
        let key, opts = null;
        this._consumer.on('message', async (message: any) => {
            if (message && message.value) {
                try {
                    let item = JSON.parse(message.value);
                    switch (item.command) {
                        case importInstruments:
                            let svc = new api.services.InstrumentService();
                            return await svc.sync();
                        case importCandles:
                            lock.acquire(key, async function () {
                                let instrumentService = new api.services.InstrumentService();

                                let instrumentItem = await instrumentService.get(item.instrument);
                                if (instrumentItem[0] && item.granularity) {
                                    if (instrumentItem[0].granularities.indexOf(item.granularity) === -1) {
                                        instrumentItem[0].granularities.push(item.granularity);
                                        await instrumentItem[0].save();
                                    }

                                    let service = new api.services.CandleSyncService();
                                    service.instrument = item.instrument;
                                    service.granularity = item.granularity;
                                    await service.sync();
                                } else {
                                    throw new Error('instrument is not imported!');
                                }
                                return;
                            }, opts).then(function () {
                                console.log('lock released');
                            }).catch(function (err) {
                                console.error(err.message);
                            });

                    }
                } catch (err) {
                    console.error(err);
                    return;
                }
            }
        });

        this._consumer.on('error', (err: string) => {
            console.log(err);
        });
    }
    public resetOffset() {
        this._consumer.setOffset(supportTopic, 0, 0);
    }
}


setTimeout(async () => {
    let prx = new SupportTopicConsumerProxy();
    prx.connect();
}, 5000);