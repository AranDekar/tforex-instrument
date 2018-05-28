import { Document, Schema, Model, Types } from 'mongoose';

import * as api from 'api';
import { InstrumentEventEnum } from '../enums';

const mongoose = api.shared.DataAccess.mongooseInstance;

export interface InstrumentEvent {
    event: string;
    eventTime: Date;
    candleTime: Date;
    candleBid: number;
    candleAsk: number;
    isDispatched: boolean;
    payload: {};
}
export interface InstrumentEventDocument extends InstrumentEvent, Document {
}
export interface InstrumentEventModel extends Model<InstrumentEventDocument> {
    findUndispatchedEvents(model: InstrumentEventModel): Promise<InstrumentEventDocument[]>;
    findLastEvent(model: Model<InstrumentEventDocument>): Promise<InstrumentEventDocument>;
    findEventsByTimeEvents(model: Model<InstrumentEventDocument>, time: Date, events: string[]):
        Promise<InstrumentEventDocument[]>;
}

const schema = new Schema({
    event: {
        type: String, enum: [
            'm5_closed', 'm15_closed', 'm30_closed', 'h1_closed', 'h4_closed', 'd_closed',

            'm5_line_break_closed', 'm15_line_break_closed', 'm30_line_break_closed', 'h1_line_break_closed',
            'h4_line_break_closed', 'd_line_break_closed',

            'm5_heikin_ashi_closed', 'm15_heikin_ashi_closed', 'm30_heikin_ashi_closed', 'h1_heikin_ashi_closed',
            'h4_heikin_ashi_closed', 'd_heikin_ashi_closed',

            'm5_dmi_changed', 'm15_dmi_changed', 'm30_dmi_changed', 'h1_dmi_changed', 'h4_dmi_changed',
            'd_dmi_changed',

            'm5_heikin_ashi_dmi_changed', 'm15_heikin_ashi_dmi_changed', 'm30_heikin_ashi_dmi_changed',
            'h1_heikin_ashi_dmi_changed', 'h4_heikin_ashi_dmi_changed', 'd_heikin_ashi_dmi_changed',

            'm5_line_break_dmi_changed', 'm15_line_break_dmi_changed', 'm30_line_break_dmi_changed',
            'h1_line_break_dmi_changed', 'h4_line_break_dmi_changed', 'd_line_break_dmi_changed',

            'm5_rsi_changed', 'm15_rsi_changed', 'm30_rsi_changed', 'h1_rsi_changed', 'h4_rsi_changed',
            'd_rsi_changed',

            'm5_heikin_ashi_rsi_changed', 'm15_heikin_ashi_rsi_changed', 'm30_heikin_ashi_rsi_changed',
            'h1_heikin_ashi_rsi_changed', 'h4_heikin_ashi_rsi_changed', 'd_heikin_ashi_rsi_changed',

            'm5_line_break_rsi_changed', 'm15_line_break_rsi_changed', 'm30_line_break_rsi_changed',
            'h1_line_break_rsi_changed', 'h4_line_break_rsi_changed', 'd_line_break_rsi_changed',

            'm5_macd_changed', 'm15_macd_changed', 'm30_macd_changed', 'h1_macd_changed', 'h4_macd_changed',
            'd_macd_changed',

            'm5_heikin_ashi_macd_changed', 'm15_heikin_ashi_macd_changed', 'm30_heikin_ashi_macd_changed',
            'h1_heikin_ashi_macd_changed', 'h4_heikin_ashi_macd_changed', 'd_heikin_ashi_macd_changed',

            'm5_line_break_macd_changed', 'm15_line_break_macd_changed', 'm30_line_break_macd_changed',
            'h1_line_break_macd_changed', 'h4_line_break_macd_changed', 'd_line_break_macd_changed',

            'm5_sma_changed', 'm15_sma_changed', 'm30_sma_changed', 'h1_sma_changed', 'h4_sma_changed',
            'd_sma_changed',

            'm5_heikin_ashi_sma_changed', 'm15_heikin_ashi_sma_changed', 'm30_heikin_ashi_sma_changed',
            'h1_heikin_ashi_sma_changed', 'h4_heikin_ashi_sma_changed', 'd_heikin_ashi_sma_changed',

            'm5_line_break_sma_changed', 'm15_line_break_sma_changed', 'm30_line_break_sma_changed',
            'h1_line_break_sma_changed', 'h4_line_break_sma_changed', 'd_line_break_sma_changed',

            'm5_ema_changed', 'm15_ema_changed', 'm30_ema_changed', 'h1_ema_changed', 'h4_ema_changed',
            'd_ema_changed',

            'm5_heikin_ashi_ema_changed', 'm15_heikin_ashi_ema_changed', 'm30_heikin_ashi_ema_changed',
            'h1_heikin_ashi_ema_changed', 'h4_heikin_ashi_ema_changed', 'd_heikin_ashi_ema_changed',

            'm5_line_break_ema_changed', 'm15_line_break_ema_changed', 'm30_line_break_ema_changed',
            'h1_line_break_ema_changed', 'h4_line_break_ema_changed', 'd_line_break_ema_changed',
        ],
    },
    isDispatched: { type: Boolean, default: false },
    eventTime: { type: Date },
    candleTime: { type: Date },
    candleBid: { type: Number },
    candleAsk: { type: Number },
    payload: { type: Schema.Types.Mixed },
});

schema.index({ candleTime: 1 }); // schema level ascending index on candleTime

schema.statics.findUndispatchedEvents = async (model: Model<InstrumentEventDocument>) => {
    return model
        .find({ isDispatched: false })
        .sort({ candleTime: 1 })
        .exec();
};
schema.statics.findLastEvent = async (model: Model<InstrumentEventDocument>) => {
    return model
        .findOne()
        .sort({ candleTime: -1 })
        .exec();
};

schema.statics.findEventsByTimeEvents = async (
    model: Model<InstrumentEventDocument>, time: Date,
    events: string[]) => {
    return model
        // tslint:disable-next-line:object-literal-key-quotes
        .find({
            candleTime: { $gt: time },
            event: { $in: events },
        })
        .sort({ candleTime: 1 })
        .limit(250)
        .exec();
};

export let gbpUsdEvents = mongoose.model<InstrumentEventDocument>(
    'gbp_usd_events', schema) as InstrumentEventModel;

export let audUsdEvents = mongoose.model<InstrumentEventDocument>(
    'aud_usd_events', schema) as InstrumentEventModel;

export let eurUsdEvents = mongoose.model<InstrumentEventDocument>(
    'eur_usd_events', schema) as InstrumentEventModel;
