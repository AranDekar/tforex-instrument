import { Document, Schema, Model, Types } from 'mongoose';

import * as api from 'api';

const mongoose = api.shared.DataAccess.mongooseInstance;

export interface Candle {
    closeMid: number;
    closeAsk: number;
    closeBid: number;
    complete: boolean;
    high: number;
    low: number;
    open: number;
    time: Date;
    volume: number;
    granularity: string;
}
export interface CandleDocument extends api.models.Candle, Document {
}
export interface CandleModel extends Model<CandleDocument> {
    getAllCandles(model: Model<CandleDocument>, granularity: string): Promise<CandleDocument[]>;
    findLastCandle(model: Model<CandleDocument>, granularity: string): Promise<CandleDocument>;
    findCandleByTime(model: Model<CandleDocument>, time: Date, granularityVal: string): Promise<CandleDocument>;
    findPrevious(
        model: Model<CandleDocument>, time: Date,
        granularity: string): Promise<CandleDocument>;
    findLimit(
        model: Model<CandleDocument>, time: Date,
        granularity: string, limit: number): Promise<CandleDocument[]>;
}

const schema = new Schema({
    closeMid: { type: Number },
    closeAsk: { type: Number },
    closeBid: { type: Number },
    complete: { type: Boolean },
    high: { type: Number },
    low: { type: Number },
    open: { type: Number },
    volume: { type: Number },
    time: { type: Date },
    granularity: { type: String },
});

schema.index({ granularity: 1, time: 1 }); // schema level ascending index on time

schema.statics.getAllCandles = async (model: Model<CandleDocument>, granularityVal: string) => {
    return model
        .find()
        .where({ granularity: granularityVal })
        .sort({ time: 1 })
        .exec();
};

schema.statics.findLastCandle = async (model: Model<CandleDocument>, granularityVal: string) => {
    return model
        .findOne()
        .where({ granularity: granularityVal })
        .sort({ time: -1 })
        .exec();
};

schema.statics.findCandleByTime = async (model: Model<CandleDocument>, timeVal: string, granularityVal) => {
    return model
        .findOne({ time: timeVal, granularity: granularityVal })
        .exec();
};

schema.statics.findPrevious = async (
    model: Model<CandleDocument>, time: Date,
    granularityVal: string) => {
    return model
        .findOne({ granularity: granularityVal, time: { $lt: time } })
        .sort({ time: -1 })
        .exec();
};

schema.statics.findLimit = async (
    model: Model<CandleDocument>, time: Date,
    granularityVal: string, limit: number) => {
    return model
        .find({ granularity: granularityVal, time: { $lte: time } })
        .sort({ time: -1 })
        .limit(limit)
        .exec();
};

export let audUsdCandlesModel = mongoose.model<CandleDocument>('aud_usd_candles', schema) as CandleModel;
export let gbpUsdCandlesModel = mongoose.model<CandleDocument>('gbp_usd_candles', schema) as CandleModel;
export let eurUsdCandlesModel = mongoose.model<CandleDocument>('eur_usd_candles', schema) as CandleModel;