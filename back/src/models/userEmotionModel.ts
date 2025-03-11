import mongoose, { Schema, Document } from 'mongoose';

export interface IUserEmotion extends Document {
    user_id: mongoose.Types.ObjectId;
    emotion_id: mongoose.Types.ObjectId;
    post_id: mongoose.Types.ObjectId;
    createdAt: Date;
}

const UserEmotionSchema = new Schema({
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    emotion_id: {
        type: Schema.Types.ObjectId,
        ref: 'Emotion',
        required: true
    },
    post_id: {
        type: Schema.Types.ObjectId,
        ref: 'Post',
        required: true
    }
}, {
    timestamps: true
});

UserEmotionSchema.index({ user_id: 1, post_id: 1 }, { unique: true });

export default mongoose.model<IUserEmotion>('UserEmotion', UserEmotionSchema);