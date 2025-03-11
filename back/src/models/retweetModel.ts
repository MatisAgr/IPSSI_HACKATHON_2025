import mongoose, { Schema, Document } from 'mongoose';

export interface IRetweet extends Document {
    post_id: mongoose.Types.ObjectId;
    user_id: mongoose.Types.ObjectId;
    createdAt: Date;
}

const RetweetSchema = new Schema({
    post_id: {
        type: Schema.Types.ObjectId,
        ref: 'Post',
        required: true
    },
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

RetweetSchema.index({ user_id: 1, post_id: 1 }, { unique: true });

export default mongoose.model<IRetweet>('Retweet', RetweetSchema);