import { Document, Schema, Model, Types } from 'mongoose';

import * as api from '../../candle';
import * as shared from '../../shared';

let mongoose = shared.DataAccess.mongooseInstance;

export interface Candle {
    closeAsk: number;
    closeBid: number;
    complete: boolean;
    highAsk: number;
    highBid: number;
    lowAsk: number;
    lowBid: number;
    openAsk: number;
    openBid: number;
    time: string;
    volume: number;
}
export interface CandleDocument extends api.models.Candle, Document {
}

let schema = new Schema({
    closeAsk: { type: Number },
    closeBid: { type: Number },
    complete: { type: Boolean },
    highAsk: { type: Number },
    highBid: { type: Number },
    lowAsk: { type: Number },
    lowBid: { type: Number },
    openAsk: { type: Number },
    openBid: { type: Number },
    volume: { type: Number },
    time: { type: String },
});

schema.index({ time: 1 }); // schema level ascending index on time


export interface CandleModel extends Model<CandleDocument> {
    getAllCandles(model: Model<CandleDocument>): Promise<CandleDocument[]>;
    findLastCandle(model: Model<CandleDocument>): Promise<CandleDocument>;
    findCandleByTime(model: Model<CandleDocument>, time: string): Promise<CandleDocument>;
}

schema.statics.getAllCandles = async (model: Model<CandleDocument>) => {
    return model
        .find()
        .sort({ 'time': 1 })
        .exec();
};

schema.statics.findLastCandle = async (model: Model<CandleDocument>) => {
    return model
        .findOne()
        .sort({ 'time': -1 })
        .exec();
};

schema.statics.findCandleByTime = async (model: Model<CandleDocument>, time: string) => {
    return model
        .findOne({ time: time })
        .exec();
};

export namespace candles {
    export let audUsdM5 = <CandleModel>mongoose.model<CandleDocument>('audusdm5', schema);
}