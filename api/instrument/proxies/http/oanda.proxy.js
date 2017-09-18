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
let oanda = require('oanda-adapter');
const api = require("../../../instrument");
class OandaProxy {
    constructor() {
        this.accountId = 7841664;
        this.client = new oanda({
            // 'live', 'practice' or 'sandbox' 
            environment: 'practice',
            // Generate your API access in the 'Manage API Access' section of 'My Account' on OANDA's website 
            accessToken: api.shared.Config.settings.oanda_access_token_key,
        });
    }
    getCandles(instrument, start, end, granularity) {
        return __awaiter(this, void 0, void 0, function* () {
            if (api.shared.Config.settings.mockup_oanda) {
                return Promise.resolve([{
                        closeAsk: 0.72824,
                        closeBid: 0.72809,
                        complete: true,
                        highAsk: 0.72838,
                        highBid: 0.72821,
                        lowAsk: 0.72761,
                        lowBid: 0.72744,
                        openAsk: 0.72761,
                        openBid: 0.72744,
                        time: end,
                        volume: 56,
                    }]);
            }
            else {
                return new Promise((resolve, reject) => {
                    this.client.getCandles(api.enums.InstrumentEnum[instrument], start, end, api.enums.GranularityEnum[granularity], (err, candles) => {
                        if (err) {
                            return reject(err);
                        }
                        return resolve(candles);
                    });
                });
            }
        });
    }
    getInstruments() {
        return __awaiter(this, void 0, void 0, function* () {
            if (api.shared.Config.settings.mockup_oanda) {
                return Promise.resolve([{
                        displayName: "AUD/USD",
                        halted: false,
                        instrument: "AUD_USD",
                        marginRate: 0.003333,
                        maxTradeUnits: 10000000,
                        maxTrailingStop: 10000,
                        minTrailingStop: 5,
                        pip: "0.0001",
                        precision: "0.00001",
                        granularities: [],
                    }]);
            }
            else {
                return new Promise((resolve, reject) => {
                    this.client.getInstruments(api.shared.Config.settings.oanda_account_number, (err, instruments) => {
                        if (err) {
                            return reject(err);
                        }
                        return resolve(instruments);
                    });
                });
            }
        });
    }
}
exports.OandaProxy = OandaProxy;
/**
 *  this is to test the oanda apis
 * https://tonicdev.com/npm/oanda-adapter
 *


    var OANDAAdapter= require("oanda-adapter")
    var client = new OANDAAdapter({
        environment: 'practice',
        accessToken: '77b8d34f242ab412698eba34bc577edb-9126983f28bbf9348c2e2f5697c9d1b3',
    });
            client.getInstruments(7841664,function (err, instruments) {
                console.log(instruments);
            });
*
*
*
          client.getCandles("AUD_USD","2015-12-15T02:50:00+00:00","2015-12-15T02:55:00+00:00","M5",function (err, data) {
              console.log(data);
          });
        
 *
 */ 

//# sourceMappingURL=oanda.proxy.js.map
