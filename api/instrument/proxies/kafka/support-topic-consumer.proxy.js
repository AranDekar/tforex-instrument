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
const api = require("../../../instrument");
let asyncLock = require('async-lock');
const supportTopic = 'support';
const importInstruments = 'import_instruments';
const importCandles = 'import_candles';
class SupportTopicConsumerProxy {
    connect() {
        console.log(`trying to connect to ${api.shared.Config.settings.kafka_conn_string} in consumer`);
        let client = new kafka.KafkaClient({
            kafkaHost: api.shared.Config.settings.kafka_conn_string,
        });
        this._consumer = new kafka.Consumer(client, [
            { topic: supportTopic },
        ], {
            autoCommit: true,
            groupId: api.shared.Config.settings.client_id,
        });
        // if you don't see any message coming, it may be because you have deleted the topic and the offset 
        // is not reset with this client id.
        this._consumer.on('message', (message) => __awaiter(this, void 0, void 0, function* () {
            if (message && message.value) {
                try {
                    let item = JSON.parse(message.value);
                    switch (item.command) {
                        case importInstruments:
                            let svc = new api.services.InstrumentService();
                            return yield svc.sync();
                        case importCandles:
                            let lock = new asyncLock();
                            let key, opts = null;
                            lock.acquire(key, function (done) {
                                return __awaiter(this, void 0, void 0, function* () {
                                    let instrumentService = new api.services.InstrumentService();
                                    let instrumentItem = yield instrumentService.get(item.instrument);
                                    if (instrumentItem[0] && item.granularity) {
                                        if (instrumentItem[0].granularities.indexOf(item.granularity) === -1) {
                                            instrumentItem[0].granularities.push(item.granularity);
                                            yield instrumentItem[0].save();
                                            let service = new api.services.CandleSyncService();
                                            service.instrument = item.instrument;
                                            service.granularity = item.granularity;
                                            yield service.sync();
                                        }
                                    }
                                    done(null, true);
                                });
                            }, opts).then(function () {
                                // lock released
                            });
                    }
                }
                catch (err) {
                    console.error(err);
                    return;
                }
            }
        }));
        this._consumer.on('error', (err) => {
            console.log(err);
        });
    }
    resetOffset() {
        this._consumer.setOffset(supportTopic, 0, 0);
    }
}
exports.SupportTopicConsumerProxy = SupportTopicConsumerProxy;
setTimeout(() => __awaiter(this, void 0, void 0, function* () {
    let prx = new SupportTopicConsumerProxy();
    prx.connect();
}), 5000);

//# sourceMappingURL=support-topic-consumer.proxy.js.map
