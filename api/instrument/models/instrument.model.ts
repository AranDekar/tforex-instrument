import { Document, Schema, Model, Types } from 'mongoose';

import * as api from '../../instrument';
import * as shared from '../../shared';

let mongoose = shared.DataAccess.mongooseInstance;

export interface Instrument {
    displayName: string;
    halted: boolean;
    marginRate: number;
    maxTradeUnits: number;
    maxTrailingStop: number;
    minTrailingStop: number;
    pip: string;
    precision: string;
    granularities: string[];
    title: string;
    path: string | null;
}

export interface InstrumentDocument extends api.Instrument, Document {
}

let schema = new Schema({
    displayName: String,
    halted: Boolean,
    title: String,
    marginRate: Number,
    maxTradeUnits: Number,
    maxTrailingStop: Number,
    minTrailingStop: Number,
    pip: String,
    precision: String,
    granularities: [{ type: String, enum: ['M5'] }],
    path: { type: String, default: null },
});


export let instrumentModel = mongoose.model<InstrumentDocument>('instruments', schema);