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
const api = require("../../instrument");
const shared = require("../../shared");
class InstrumentStartupService {
    static startup() {
        setTimeout(() => __awaiter(this, void 0, void 0, function* () {
            if (shared.Config.settings.run_startup) {
                let service = new api.InstrumentService();
                yield service.sync();
            }
        }), 5000);
    }
}
exports.InstrumentStartupService = InstrumentStartupService;
class KafkaTestConsumerService {
    static connect() {
        let client = new kafka.Client(shared.Config.settings.kafka_conn_string, shared.Config.settings.client_id);
        KafkaTestConsumerService._consumer = new kafka.Consumer(client, [
            { topic: 'test' },
        ], {
            autoCommit: true,
            groupId: shared.Config.settings.client_id,
        });
        // if you don't see any message coming, it may be because you have deleted the topic and the offset 
        // is not reset with this client id.
        KafkaTestConsumerService._consumer.on('message', (message) => __awaiter(this, void 0, void 0, function* () {
            if (message && message.value) {
                console.log(message.value);
            }
        }));
        KafkaTestConsumerService._consumer.on('error', (err) => {
            console.log(err);
        });
    }
    static resetOffset() {
        KafkaTestConsumerService._consumer.setOffset('test', 0, 0);
    }
}
exports.KafkaTestConsumerService = KafkaTestConsumerService;
KafkaTestConsumerService.connect();
// KafkaTestConsumerService.resetOffset();
InstrumentStartupService.startup();

//# sourceMappingURL=startup.service.js.map
