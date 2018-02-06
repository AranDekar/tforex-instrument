import { Document, Schema, Model, Types } from 'mongoose';

import * as api from '../../api';

const mongoose = api.shared.DataAccess.mongooseInstance;

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

export interface InstrumentDocument extends api.models.Instrument, Document {
}

const schema = new Schema({
    displayName: String,
    halted: Boolean,
    title: String,
    marginRate: Number,
    maxTradeUnits: Number,
    maxTrailingStop: Number,
    minTrailingStop: Number,
    pip: String,
    precision: String,
    granularities: [{ type: String, enum: ['M5', 'H1', 'H4'] }],
    path: { type: String, default: null },
});

export let instrumentModel = mongoose.model<InstrumentDocument>('instruments', schema);