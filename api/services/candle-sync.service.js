"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const api = require("api");
class CandleSyncService {
    async sync(instrument) {
        const allCandles = [];
        const granularities = [
            api.enums.GranularityEnum.M5,
            api.enums.GranularityEnum.M15,
            api.enums.GranularityEnum.M30,
            api.enums.GranularityEnum.H1,
            api.enums.GranularityEnum.H4,
            api.enums.GranularityEnum.D,
        ];
        const proxy = new api.proxies.OandaProxy();
        const candleService = new api.services.CandleService();
        const candleModel = candleService.getModel(instrument);
        if (!candleModel) {
            throw new Error('candle model is undefined in CandleService!');
        }
        for (const currGranularity of granularities) {
            this.startTime = null;
            this.endTime = null;
            const lastCandle = await candleModel.findLastCandle(candleModel, currGranularity);
            if (lastCandle) {
                this.endTime = lastCandle.time;
            }
            let stillInLoop = false;
            do {
                this.setStartTime(currGranularity);
                stillInLoop = this.setEndTime(currGranularity);
                if (!this.startTime || !this.endTime) {
                    throw new Error('start or end time is null');
                }
                if (this.startTime >= this.endTime) {
                    break;
                }
                const candles = await proxy.getCandles(instrument, this.startTime, this.endTime, currGranularity);
                allCandles.push(...candles);
            } while (stillInLoop);
        }
        const completedCandles = allCandles.filter((x) => x.complete);
        const sortedCompletedCandles = completedCandles.sort((a, b) => a.time - b.time);
        await candleModel.collection.insertMany(sortedCompletedCandles);
        // for (const candle of allCandles.sort((a, b) => a.time - b.time)) {
        //     if (candle.complete) {
        //         candle.time = candle.time / 1000;
        //         // const existing = await candleModel.findCandleByTime(candleModel, candle.time, candle.granularity);
        //         // if (!existing) {
        //         const model = new candleModel(candle);
        //         await model.save();
        //         // }
        //     }
        // }
    }
    setStartTime(granularity) {
        let startTime = new Date();
        if (this.endTime) {
            startTime = this.endTime;
        }
        else {
            switch (granularity) {
                case api.enums.GranularityEnum.M5:
                    if (!this.endTime) {
                        startTime = new Date(startTime.getFullYear(), startTime.getMonth() - 1, 0);
                        // startTime = new Date(startTime.getFullYear(), startTime.getMonth(), startTime.getDate() - 1);
                        // 1 months data for M5
                    }
                    break;
                case api.enums.GranularityEnum.M15:
                    if (!this.endTime) {
                        startTime = new Date(startTime.getFullYear(), startTime.getMonth() - 3, 0);
                        // startTime = new Date(startTime.getFullYear(), startTime.getMonth(), startTime.getDate() - 3);
                        // 3 months data for M15
                    }
                    break;
                case api.enums.GranularityEnum.M30:
                    if (!this.endTime) {
                        startTime = new Date(startTime.getFullYear(), startTime.getMonth() - 6, 0);
                        // startTime = new Date(startTime.getFullYear(), startTime.getMonth(), startTime.getDate() - 6);
                        // 6 months data for M30
                    }
                    break;
                case api.enums.GranularityEnum.H1:
                    if (!this.endTime) {
                        startTime = new Date(startTime.getFullYear() - 1, startTime.getMonth(), 0);
                        // startTime = new Date(startTime.getFullYear(), startTime.getMonth(),
                        // startTime.getDate() - 12);
                        // 1 year data for H1
                    }
                    break;
                case api.enums.GranularityEnum.H4:
                    if (!this.endTime) {
                        startTime = new Date(startTime.getFullYear() - 4, startTime.getMonth(), 0);
                        // startTime = new Date(startTime.getFullYear(), startTime.getMonth(),
                        // startTime.getDate() - 48);
                        // 4 years data for H4
                    }
                    break;
                case api.enums.GranularityEnum.D:
                    if (!this.endTime) {
                        startTime = new Date(startTime.getFullYear() - 10, startTime.getMonth(), 0);
                        // startTime = new Date(startTime.getFullYear(), startTime.getMonth(),
                        // startTime.getDate() - 288);
                        // 10 years data for D1
                    }
                    break;
            }
        }
        this.startTime = startTime;
    }
    setEndTime(granularity) {
        let endTime = this.startTime;
        if (!endTime) {
            throw new Error('end time is null');
        }
        switch (granularity) {
            case api.enums.GranularityEnum.M5:
                // 15 days for M5, 288 candles per day
                endTime = new Date(endTime.getFullYear(), endTime.getMonth(), endTime.getDate() + 15);
                break;
            case api.enums.GranularityEnum.M15:
                // 45 days for M15, 98 candles per day
                endTime = new Date(endTime.getFullYear(), endTime.getMonth(), endTime.getDate() + 45);
                break;
            case api.enums.GranularityEnum.M30:
                // 90 days for M30, 48 candles per day
                endTime = new Date(endTime.getFullYear(), endTime.getMonth(), endTime.getDate() + 90);
                break;
            case api.enums.GranularityEnum.H1:
                // 180 days for H1, 24 candles per day
                endTime = new Date(endTime.getFullYear(), endTime.getMonth(), endTime.getDate() + 180);
                break;
            case api.enums.GranularityEnum.H4:
                // 720 days for H4, 6 candles per day
                endTime = new Date(endTime.getFullYear(), endTime.getMonth(), endTime.getDate() + 720);
                break;
            case api.enums.GranularityEnum.D:
                // 4320 days for D1, 1 candle per day
                endTime = new Date(endTime.getFullYear(), endTime.getMonth(), endTime.getDate() + 4320);
                break;
        }
        if (endTime > new Date()) {
            this.endTime = new Date();
            return false;
        }
        this.endTime = endTime;
        return true;
    }
}
exports.CandleSyncService = CandleSyncService;
//# sourceMappingURL=candle-sync.service.js.map