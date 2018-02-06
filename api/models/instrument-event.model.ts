import { Document, Schema, Model, Types } from 'mongoose';

import * as api from 'api';

const mongoose = api.shared.DataAccess.mongooseInstance;

export interface InstrumentEvent {
    event: string;
    time: string;
    candleTime: string;
    isDispatched: boolean;
    payload: {};
}
export interface InstrumentEventDocument extends InstrumentEvent, Document {
}
export interface InstrumentEventDocumentOperations extends Model<InstrumentEventDocument> {
    findUndispatchedEvents(model: InstrumentEventDocumentOperations): Promise<InstrumentEventDocument[]>;
    findLastEvent(model: InstrumentEventDocumentOperations): Promise<InstrumentEventDocument>;
}

const schema = new Schema({
    event: {
        type: String, enum: [
            'm5-closed', 'm15-closed', 'm30-closed', 'h1-closed', 'h4-closed', 'd1-closed',

            'm5-line-break-closed', 'm15-line-break-closed', 'm30-line-break-closed', 'h1-line-break-closed',
            'h4-line-break-closed', 'd1-line-break-closed',

            'm5-heikin-ashi-closed', 'm15-heikin-ashi-closed', 'm30-heikin-ashi-closed', 'h1-heikin-ashi-closed',
            'h4-heikin-ashi-closed', 'd1-heikin-ashi-closed',

            'm5-dmi-changed', 'm15-dmi-changed', 'm30-dmi-changed', 'h1-dmi-changed', 'h4-dmi-changed',
            'd1-dmi-changed',

            'm5-heikin-ashi-dmi-changed', 'm15-heikin-ashi-dmi-changed', 'm30-heikin-ashi-dmi-changed',
            'h1-heikin-ashi-dmi-changed', 'h4-heikin-ashi-dmi-changed', 'd1-heikin-ashi-dmi-changed',

            'm5-line-break-dmi-changed', 'm15-line-break-dmi-changed', 'm30-line-break-dmi-changed',
            'h1-line-break-dmi-changed', 'h4-line-break-dmi-changed', 'd1-line-break-dmi-changed',

            'm5-rsi-changed', 'm15-rsi-changed', 'm30-rsi-changed', 'h1-rsi-changed', 'h4-rsi-changed',
            'd1-rsi-changed',

            'm5-heikin-ashi-rsi-changed', 'm15-heikin-ashi-rsi-changed', 'm30-heikin-ashi-rsi-changed',
            'h1-heikin-ashi-rsi-changed', 'h4-heikin-ashi-rsi-changed', 'd1-heikin-ashi-rsi-changed',

            'm5-line-break-rsi-changed', 'm15-line-break-rsi-changed', 'm30-line-break-rsi-changed',
            'h1-line-break-rsi-changed', 'h4-line-break-rsi-changed', 'd1-line-break-rsi-changed',

            'm5-macd-changed', 'm15-macd-changed', 'm30-macd-changed', 'h1-macd-changed', 'h4-macd-changed',
            'd1-macd-changed',

            'm5-heikin-ashi-macd-changed', 'm15-heikin-ashi-macd-changed', 'm30-heikin-ashi-macd-changed',
            'h1-heikin-ashi-macd-changed', 'h4-heikin-ashi-macd-changed', 'd1-heikin-ashi-macd-changed',

            'm5-line-break-macd-changed', 'm15-line-break-macd-changed', 'm30-line-break-macd-changed',
            'h1-line-break-macd-changed', 'h4-line-break-macd-changed', 'd1-line-break-macd-changed',

            'm5-ma-changed', 'm15-ma-changed', 'm30-ma-changed', 'h1-ma-changed', 'h4-ma-changed',
            'd1-ma-changed',

            'm5-heikin-ashi-ma-changed', 'm15-heikin-ashi-ma-changed', 'm30-heikin-ashi-ma-changed',
            'h1-heikin-ashi-ma-changed', 'h4-heikin-ashi-ma-changed', 'd1-heikin-ashi-ma-changed',

            'm5-line-break-ma-changed', 'm15-line-break-ma-changed', 'm30-line-break-ma-changed',
            'h1-line-break-ma-changed', 'h4-line-break-ma-changed', 'd1-line-break-ma-changed',

            'm5-ema-changed', 'm15-ema-changed', 'm30-ema-changed', 'h1-ema-changed', 'h4-ema-changed',
            'd1-ema-changed',

            'm5-heikin-ashi-ema-changed', 'm15-heikin-ashi-ema-changed', 'm30-heikin-ashi-ema-changed',
            'h1-heikin-ashi-ema-changed', 'h4-heikin-ashi-ema-changed', 'd1-heikin-ashi-ema-changed',

            'm5-line-break-ema-changed', 'm15-line-break-ema-changed', 'm30-line-break-ema-changed',
            'h1-line-break-ema-changed', 'h4-line-break-ema-changed', 'd1-line-break-ema-changed',
        ],
    },
    isDispatched: { type: Boolean, default: false },
    time: { type: Number },
    payload: { type: Schema.Types.Mixed },
});

schema.index({ time: 1 }); // schema level ascending index on time

schema.statics.findUndispatchedEvents = async (model: Model<InstrumentEventDocument>) => {
    return model
        .find({ isDispatched: false })
        .sort({ time: 1 })
        .exec();
};
schema.statics.findLastEvents = async (model: Model<InstrumentEventDocument>) => {
    return model
        .findOne()
        .sort({ time: -1 })
        .exec();
};

export let gbpUsdEvents = mongoose.model<InstrumentEventDocument>(
    'gbp-usd-events', schema) as InstrumentEventDocumentOperations;

export let audUsdEvents = mongoose.model<InstrumentEventDocument>(
    'aud-usd-events', schema) as InstrumentEventDocumentOperations;

export let eurUsdEvents = mongoose.model<InstrumentEventDocument>(
    'eur-usd-events', schema) as InstrumentEventDocumentOperations;