import { Document, Schema, Model, Types } from 'mongoose';

import * as api from '../../api';

const mongoose = api.shared.DataAccess.mongooseInstance;

export interface LineBreak {
    open: number;
    close: number;
    complete: boolean;
    time: string;
    volume: number;
    granularity: string;
    color: string;
    number: number;
}
export interface LineBreakDocument extends api.models.LineBreak, Document {
}

const schema = new Schema({
    open: { type: Number },
    close: { type: Number },
    complete: { type: Boolean },
    volume: { type: Number },
    time: { type: String },
    granularity: { type: String },
    color: { type: String, enum: ['white', 'red'] },
    number: { type: Number },
});

schema.index({ time: 1 }); // schema level ascending index on time

export interface LineBreakModel extends Model<LineBreakDocument> {
    getAllLineBreaks(model: Model<LineBreakDocument>): Promise<LineBreakDocument[]>;
    findLastLineBreak(model: Model<LineBreakDocument>): Promise<LineBreakDocument>;
    findLineBreakByTime(model: Model<LineBreakDocument>, time: string): Promise<LineBreakDocument>;
    findUndispatchedLineBreaks(model: Model<LineBreakDocument>): Promise<LineBreakDocument[]>;
    findPrevious(
        model: Model<LineBreakDocument>, time: string,
        granularity: string): Promise<LineBreakDocument>;
}

schema.statics.getAllLineBreaks = async (model: Model<LineBreakDocument>) => {
    return model
        .find()
        .sort({ time: 1 })
        .exec();
};

schema.statics.findUndispatchedLineBreaks = async (model: Model<LineBreakDocument>) => {
    return model
        .find({ isDispatched: false })
        .sort({ time: -1 })
        .exec();
};
schema.statics.findLastLineBreak = async (model: Model<LineBreakDocument>) => {
    return model
        .findOne()
        .sort({ time: -1 })
        .exec();
};

schema.statics.findLineBreakByTime = async (model: Model<LineBreakDocument>, time: string) => {
    return model
        .findOne({ time })
        .exec();
};

schema.statics.findPrevious = async (
    model: Model<LineBreakDocument>, time: string,
    granularityVal: string) => {
    return model
        .findOne({ granularity: granularityVal, time: { $lt: time } })
        .sort({ time: -1 })
        .exec();
};
export class LineBreaks { // they work only on daily basis
    public static audUsd = mongoose.model<LineBreakDocument>('aud-usd-line-break', schema) as LineBreakModel;
    public static gbpUsd = mongoose.model<LineBreakDocument>('gbp-usd-line-break', schema) as LineBreakModel;
    public static eurUsd = mongoose.model<LineBreakDocument>('eur-usd-line-break', schema) as LineBreakModel;
}