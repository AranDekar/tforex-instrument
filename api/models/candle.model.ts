import { Document, Schema, Model, Types } from 'mongoose';

import * as api from 'api';

const mongoose = api.shared.DataAccess.mongooseInstance;

export interface Candle {
    close: number;
    complete: boolean;
    high: number;
    low: number;
    open: number;
    time: string;
    volume: number;
    granularity: string;
}
export interface CandleDocument extends api.models.Candle, Document {
}
export interface CandleModel extends Model<CandleDocument> {
    getAllCandles(model: Model<CandleDocument>, granularity: string): Promise<CandleDocument[]>;
    findLastCandle(model: Model<CandleDocument>, granularity: string): Promise<CandleDocument>;
    findCandleByTime(model: Model<CandleDocument>, time: string, granularityVal: string): Promise<CandleDocument>;
    findPrevious(
        model: Model<CandleDocument>, time: string,
        granularity: string): Promise<CandleDocument>;
}

const schema = new Schema({
    close: { type: Number },
    complete: { type: Boolean },
    high: { type: Number },
    low: { type: Number },
    open: { type: Number },
    volume: { type: Number },
    time: { type: String },
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
    model: Model<CandleDocument>, time: string,
    granularityVal: string) => {
    return model
        .findOne({ granularity: granularityVal, time: { $lt: time } })
        .sort({ time: -1 })
        .exec();
};

export class Candles {
    public static audUsd = mongoose.model<CandleDocument>('aud-usd-candles', schema) as CandleModel;
    public static gbpUsd = mongoose.model<CandleDocument>('gbp-usd-candles', schema) as CandleModel;
    public static eurUsd = mongoose.model<CandleDocument>('eur-usd-candles', schema) as CandleModel;
}