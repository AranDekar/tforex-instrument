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
                api_key: '1234',
                kafka_conn_string: 'localhost:2181/',
                oanda_access_token_key: '77b8d34f242ab412698eba34bc577edb-9126983f28bbf9348c2e2f5697c9d1b3',
                client_id: 'instrument',
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
    kafka_conn_string: string;
    oanda_access_token_key: string;
    client_id: string;
    topic_m5: string;
    mockup_oanda: boolean;
    oanda_account_number: string | number;
    run_startup: boolean;
}
