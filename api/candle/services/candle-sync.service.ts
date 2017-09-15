import { Types, Model } from 'mongoose';
import * as request from 'request';

import * as api from '../../candle';
import * as shared from '../../shared';

export class CandleSyncService {
    public instrument: shared.InstrumentEnum;
    public granularity: shared.GranularityEnum;
    private startTime: string;
    private endTime: string;
    public async sync() {
        let service = new shared.OandaService();
        let candleService = new api.services.CandleService();
        let candleModel = candleService.getModel(this.instrument, this.granularity);
        if (!candleModel) {
            throw new Error('candle model in undefined in CandleService!');
        }

        let lastCandle: api.models.Candle = await candleModel.findLastCandle(candleModel);

        if (lastCandle) {
            this.endTime = new Date(Number(lastCandle.time)).toISOString();
        }
        let stillInLoop = false;
        do {
            this.setStartTime();
            stillInLoop = this.setEndTime();
            if (this.startTime >= this.endTime) {
                break;
            }
            let candles = await service.getCandles(
                this.instrument,
                this.startTime, this.endTime,
                this.granularity);

            for (let candle of candles) {
                if (candle.complete) {
                    candle.time = candle.time / 1000;
                    let existing = await candleModel.findCandleByTime(candleModel, candle.time);
                    if (!existing) {
                        let model = new candleModel(candle);
                        await model.save();
                    }
                }
            }
        } while (stillInLoop);

    }
    private setStartTime() {
        let startTime = new Date();
        if (this.endTime) {
            startTime = new Date(this.endTime);
        } else {
            switch (this.granularity) {
                case shared.GranularityEnum.M5:
                    if (!this.endTime) {
                        startTime = new Date(startTime.getFullYear(), startTime.getMonth() - 1, 0);  // 1 months data for M5
                    }
                    break;
                case shared.GranularityEnum.M15:
                    if (!this.endTime) {
                        startTime = new Date(startTime.getFullYear(), startTime.getMonth() - 3, 0);  // 3 months data for M15
                    }
                    break;
                case shared.GranularityEnum.M30:
                    if (!this.endTime) {
                        startTime = new Date(startTime.getFullYear(), startTime.getMonth() - 6, 0);  // 6 months data for M30
                    }
                    break;
                case shared.GranularityEnum.H1:
                    if (!this.endTime) {
                        startTime = new Date(startTime.getFullYear() - 1, startTime.getMonth(), 0);  // 1 year data for H1
                    }
                    break;
                case shared.GranularityEnum.H4:
                    if (!this.endTime) {
                        startTime = new Date(startTime.getFullYear() - 4, startTime.getMonth(), 0);  // 4 years data for H4
                    }
                    break;
                case shared.GranularityEnum.D1:
                    if (!this.endTime) {
                        startTime = new Date(startTime.getFullYear() - 10, startTime.getMonth(), 0);  // 10 years data for H1
                    }
                    break;
            }
        }
        this.startTime = startTime.toISOString();
    }

    private setEndTime(): boolean {
        let endTime = new Date(this.startTime);
        switch (this.granularity) {
            case shared.GranularityEnum.M5:
                // 15 days for M5, 288 candles per day
                endTime = new Date(endTime.getFullYear(), endTime.getMonth(), endTime.getDate() + 15);
                break;
            case shared.GranularityEnum.M15:
                // 45 days for M15, 98 candles per day
                endTime = new Date(endTime.getFullYear(), endTime.getMonth(), endTime.getDate() + 45);
                break;
            case shared.GranularityEnum.M30:
                // 90 days for M30, 48 candles per day
                endTime = new Date(endTime.getFullYear(), endTime.getMonth(), endTime.getDate() + 90);
                break;
            case shared.GranularityEnum.H1:
                // 180 days for H1, 24 candles per day
                endTime = new Date(endTime.getFullYear(), endTime.getMonth(), endTime.getDate() + 180);
                break;
            case shared.GranularityEnum.H4:
                // 720 days for H4, 6 candles per day
                endTime = new Date(endTime.getFullYear(), endTime.getMonth(), endTime.getDate() + 720);
                break;
            case shared.GranularityEnum.D1:
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
