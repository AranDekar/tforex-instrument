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
const shared = require("../../../shared");
class CandleProducerProxy {
    ProduceHistoryData(topic, candles) {
        return __awaiter(this, void 0, void 0, function* () {
            let client = new kafka.Client(shared.Config.settings.kafka_conn_string, shared.Config.settings.candle_history_client_id);
            this._producer = new kafka.Producer(client);
            this._producer.on('ready', () => {
                for (let item of candles) {
                    let keyedMessages = [];
                    keyedMessages.push(new kafka.KeyedMessage(item.time, JSON.stringify(item)));
                    // this topic is not created yet so we first need to create the topic
                    // there is a property in config/server.properties called auto.create.topics.enable
                    // by default this property is set to true and it means if you send a message to a
                    // non-existing topic kafka creates it for you
                    let produceRequests = [{
                            topic: topic,
                            messages: keyedMessages,
                        }];
                    if (keyedMessages.length > 0) {
                        this._producer.send(produceRequests, (err, data) => {
                            if (err) {
                                console.log(err);
                            }
                            else {
                                console.log(`${candles.length} number of candles were published for backtesting`);
                            }
                        });
                    }
                }
            });
            this._producer.on('error', (err) => {
                console.log(err);
            });
        });
    }
}
exports.CandleProducerProxy = CandleProducerProxy;

//# sourceMappingURL=candle-producer.proxy.js.map
