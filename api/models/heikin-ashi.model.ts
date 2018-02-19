import { Document, Schema, Model, Types } from 'mongoose';

import * as api from '../../api';

const mongoose = api.shared.DataAccess.mongooseInstance;

export interface HeikinAshi {
    close: number;
    complete: boolean;
    high: number;
    low: number;
    open: number;
    time: string;
    volume: number;
    granularity: string;
}
export interface HeikinAshiDocument extends api.models.HeikinAshi, Document {
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

schema.index({ time: 1 }); // schema level ascending index on time

export interface HeikinAshiModel extends Model<HeikinAshiDocument> {
    findPrevious(
        model: Model<HeikinAshiDocument>, time: string,
        granularity: string): Promise<HeikinAshiDocument>;
    findLimit(
        model: Model<HeikinAshiDocument>, time: string,
        granularity: string, limit: number): Promise<HeikinAshiDocument[]>;
}

schema.statics.findPrevious = async (
    model: Model<HeikinAshiDocument>, time: string,
    granularityVal: string) => {
    return model
        .findOne({ granularity: granularityVal, time: { $lt: time } })
        .sort({ time: -1 })
        .exec();
};

schema.statics.findLimit = async (
    model: Model<HeikinAshiDocument>, time: string,
    granularityVal: string, limit: number) => {
    return model
        .find({ granularity: granularityVal, time: { $lt: time } })
        .sort({ time: -1 })
        .limit(limit)
        .exec();
};

export class HeikinAshis { // they work only on daily basis
    public static audUsd = mongoose.model<HeikinAshiDocument>('aud-usd-heikin-ashi', schema) as HeikinAshiModel;
    public static gbpUsd = mongoose.model<HeikinAshiDocument>('gbp-usd-heikin-ashi', schema) as HeikinAshiModel;
    public static eurUsd = mongoose.model<HeikinAshiDocument>('eur-usd-heikin-ashi', schema) as HeikinAshiModel;
}