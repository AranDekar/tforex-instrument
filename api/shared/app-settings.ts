process.env.NODE_ENV = process.env.NODE_ENV || 'development';

export class Config {
    public static settings: AppSettings;

    public static setup(): AppSettings {
        if (Config.settings) {
            return Config.settings;
        }

        console.log(`app running in ${process.env.NODE_ENV} mode`);

        if (process.env.NODE_ENV === 'development') {
            this.settings = {
                gateway_base_path: 'http://localhost:10020',
                strategy_base_path: 'http://localhost:10010',
                ui_base_path: 'http://localhost:8080',
                // mongo_db_connection_string:
                // `mongodb://tforex-user:tforex-password@cluster0-shard-00-00-tyqk3.mongodb.net:27017,` +
                // `cluster0-shard-00-01-tyqk3.mongodb.net:27017,cluster0-shard-00-02-tyqk3.mongodb.net:27017/tforex?` +
                // `ssl=true&replicaSet=Cluster0-shard-0&authSource=admin`,
                mongo_db_connection_string: process.env.MONGO || `mongodb://mongodb/tforex`,
                api_key: '1234',
                kafka_conn_string: process.env.KAFKA || 'kafka:9092',
                client_id: 'instrument',
                oanda_access_token_key: '77b8d34f242ab412698eba34bc577edb-9126983f28bbf9348c2e2f5697c9d1b3',
                candle_history_client_id: 'candle-history',
                topic_m5: 'm5',
                mockup_oanda: false,
                oanda_account_number: 7841664,
                run_startup: false,
            };
        }
        return this.settings;
    }
    constructor() {
        Config.setup();
    }
}
Config.setup();

interface AppSettings {
    gateway_base_path: string;
    strategy_base_path: string;
    ui_base_path: string;
    api_key: string;
    mongo_db_connection_string: string;
    kafka_conn_string: string;
    client_id: string;
    oanda_access_token_key: string;
    candle_history_client_id: string;
    topic_m5: string;
    mockup_oanda: boolean;
    oanda_account_number: string | number;
    run_startup: boolean;
}
