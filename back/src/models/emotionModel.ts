import mongoose, { Schema, Document } from 'mongoose';

export interface IEmotion extends Document {
    name: string;
    createdAt: Date;
}

const EmotionSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    }
}, {
    timestamps: true
});

export default mongoose.model<IEmotion>('Emotion', EmotionSchema);