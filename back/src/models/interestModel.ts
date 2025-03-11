import mongoose, { Schema, Document } from 'mongoose';

export interface IInterest extends Document {
    name: string;
    createdAt: Date;
}

const InterestSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    }
}, {
    timestamps: true
});

InterestSchema.index({ name: 1 });

export default mongoose.model<IInterest>('Interest', InterestSchema);