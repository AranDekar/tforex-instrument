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
const api = require("../../../api");
class InstrumentGranularityTopicProducerProxy {
    constructor(_topicName, _candles, _candleModel) {
        this._topicName = _topicName;
        this._candles = _candles;
        this._candleModel = _candleModel;
    }
    publish() {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            console.log(`trying to connect to ${api.shared.Config.settings.kafka_conn_string} in consumer`);
            let undispatched;
            if (this._candles) {
                undispatched = this._candles;
            }
            else if (this._candleModel) {
                undispatched = yield this._candleModel.findUndispatchedCandles(this._candleModel);
            }
            if (undispatched.length === 0) {
                console.log('no candles to publish!');
                return;
            }
            let client = new kafka.KafkaClient({
                kafkaHost: api.shared.Config.settings.kafka_conn_string,
            });
            this._producer = new kafka.Producer(client);
            this._producer.on('ready', () => {
                let payloads = [];
                for (let item of undispatched) {
                    payloads.push({ topic: this._topicName, messages: JSON.stringify(item) });
                }
                this._producer.send(payloads, (err, data) => {
                    if (err) {
                        console.log(err);
                        reject(err);
                    }
                    else if (!this._candles) {
                        for (let item of undispatched) {
                            item.isDispatched = true;
                            item.save();
                        }
                    }
                    resolve(true);
                });
            });
            this._producer.on('error', (err) => {
                console.log(err);
                reject(err);
            });
        }));
    }
}
exports.InstrumentGranularityTopicProducerProxy = InstrumentGranularityTopicProducerProxy;
//# sourceMappingURL=instrument-granularity-topic-producer.proxy.js.map