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
InstrumentStartupService.startup();