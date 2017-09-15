let asyncLock = require('async-lock');
let lock = new asyncLock();
let key, opts = null;
import * as kafka from 'kafka-node';

import * as instrumentApi from '../../instrument';
import * as candleApi from '../../candle';
import * as shared from '../../shared';

const supportTopic = 'support';
const importInstruments = 'import_instruments';
const importCandles = 'import_candles';

export class SupportTopicConsumerProxy {
    private _consumer: kafka.Consumer;

    public connect() {
        console.log(`trying to connect to ${shared.Config.settings.kafka_conn_string} in consumer`);
        let client = new kafka.KafkaClient({
            kafkaHost: shared.Config.settings.kafka_conn_string,
        });

        this._consumer = new kafka.Consumer(
            client, [
                { topic: supportTopic },
            ], {
                autoCommit: true,
                groupId: shared.Config.settings.client_id,
            }
        );
        // if you don't see any message coming, it may be because you have deleted the topic and the offset 
        // is not reset with this client id.
        this._consumer.on('message', async (message: any) => {
            if (message && message.value) {
                try {
                    let item = JSON.parse(message.value);
                    switch (item.command) {
                        case importInstruments:
                            let svc = new instrumentApi.services.InstrumentService();
                            return await svc.sync();
                        case importCandles:
                            let instrumentService = new instrumentApi.services.InstrumentService();

                            // Promise mode
                            lock.acquire(key, async function (done) {
                                let instrumentItem = await instrumentService.get(item.instrument);
                                if (instrumentItem[0] && item.granularity) {
                                    if (instrumentItem[0].granularities.indexOf(item.granularity) === -1) {
                                        instrumentItem[0].granularities.push(item.granularity);
                                        await instrumentItem[0].save();

                                        let service = new candleApi.services.CandleSyncService();
                                        service.instrument = item.instrument;
                                        service.granularity = item.granularity;
                                        await service.sync();
                                    }
                                }
                                done(null, true);
                            }, opts).then(function () {
                                // lock released
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