import * as kafka from 'kafka-node';

import * as api from '../../instrument';
import * as shared from '../../shared';

export class InstrumentStartupService {
    public static startup() {
        setTimeout(async () => {
            if (shared.Config.settings.run_startup) {
                let service = new api.InstrumentService();
                await service.sync();
            }
        }, 5000);
    }
}

export class KafkaTestConsumerService {
    private static _consumer: kafka.Consumer;
    public static connect() {
        let client = new kafka.Client(
            shared.Config.settings.kafka_conn_string,
            shared.Config.settings.client_id);

        KafkaTestConsumerService._consumer = new kafka.Consumer(
            client, [
                { topic: 'test' },
            ], {
                autoCommit: true,
                groupId: shared.Config.settings.client_id,
            }
        );

        // if you don't see any message coming, it may be because you have deleted the topic and the offset 
        // is not reset with this client id.
        KafkaTestConsumerService._consumer.on('message', async (message: any) => {
            if (message && message.value) {
                console.log(message.value);
            }
        });
        KafkaTestConsumerService._consumer.on('error', (err: string) => {
            console.log(err);
        });
    }
    public static resetOffset() {
        KafkaTestConsumerService._consumer.setOffset('test', 0, 0);
    }
}

KafkaTestConsumerService.connect();
// KafkaTestConsumerService.resetOffset();




InstrumentStartupService.startup();