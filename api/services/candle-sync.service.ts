import { Types, Model } from 'mongoose';
import * as request from 'request';

import * as api from 'api';

export class CandleSyncService {
    private startTime: string;
    private endTime: string;
    public async sync(instrument: api.enums.InstrumentEnum) {
        const allCandles: any[] = [];
        const granularities = [
            api.enums.GranularityEnum.M5,
            api.enums.GranularityEnum.M15,
            api.enums.GranularityEnum.M30,
            api.enums.GranularityEnum.H1,
            api.enums.GranularityEnum.H4,
            api.enums.GranularityEnum.D1,
        ];
        const proxy = new api.proxies.OandaProxy();
        const candleService = new api.services.CandleService();

        const candleModel = candleService.getModel(instrument);
        if (!candleModel) {
            throw new Error('candle model is undefined in CandleService!');
        }
        for (const currGranularity of granularities) {
            this.startTime = '';
            this.endTime = '';
            const lastCandle: api.models.Candle = await candleModel.findLastCandle(candleModel, currGranularity);

            if (lastCandle) {
                this.endTime = new Date(Number(lastCandle.time)).toISOString();
            }
            let stillInLoop = false;
            do {
                this.setStartTime(currGranularity);
                stillInLoop = this.setEndTime(currGranularity);
                if (this.startTime >= this.endTime) {
                    break;
                }
                const candles = await proxy.getCandles(
                    instrument,
                    this.startTime, this.endTime,
                    currGranularity);
                allCandles.push(candles);
            } while (stillInLoop);
        }
        const completedCandles = allCandles.filter((x) => x.completed);
        const sortedCompletedCandles = completedCandles.sort((a, b) => a.time - b.time);
        sortedCompletedCandles.forEach((x) => x.time = x.time / 1000);

        await candleModel.create(sortedCompletedCandles);

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

    private setStartTime(granularity: api.enums.GranularityEnum) {
        let startTime = new Date();
        if (this.endTime) {
            startTime = new Date(this.endTime);
        } else {
            switch (granularity) {
                case api.enums.GranularityEnum.M5:
                    if (!this.endTime) {
                        startTime = new Date(startTime.getFullYear(), startTime.getMonth() - 1, 0);
                        // 1 months data for M5
                    }
                    break;
                case api.enums.GranularityEnum.M15:
                    if (!this.endTime) {
                        startTime = new Date(startTime.getFullYear(), startTime.getMonth() - 3, 0);
                        // 3 months data for M15
                    }
                    break;
                case api.enums.GranularityEnum.M30:
                    if (!this.endTime) {
                        startTime = new Date(startTime.getFullYear(), startTime.getMonth() - 6, 0);
                        // 6 months data for M30
                    }
                    break;
                case api.enums.GranularityEnum.H1:
                    if (!this.endTime) {
                        startTime = new Date(startTime.getFullYear() - 1, startTime.getMonth(), 0);
                        // 1 year data for H1
                    }
                    break;
                case api.enums.GranularityEnum.H4:
                    if (!this.endTime) {
                        startTime = new Date(startTime.getFullYear() - 4, startTime.getMonth(), 0);
                        // 4 years data for H4
                    }
                    break;
                case api.enums.GranularityEnum.D1:
                    if (!this.endTime) {
                        startTime = new Date(startTime.getFullYear() - 10, startTime.getMonth(), 0);
                        // 10 years data for H1
                    }
                    break;
            }
        }
        this.startTime = startTime.toISOString();
    }

    private setEndTime(granularity: api.enums.GranularityEnum): boolean {
        let endTime = new Date(this.startTime);
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
            case api.enums.GranularityEnum.D1:
                // 4320 days for D1, 1 candle per day
                endTime = new Date(endTime.getFullYear(), endTime.getMonth(), endTime.getDate() + 4320);
                break;
        }
        if (endTime > new Date()) {
            this.endTime = new Date().toISOString();
            return false;
        }
        this.endTime = endTime.toISOString();
        return true;
    }
}
