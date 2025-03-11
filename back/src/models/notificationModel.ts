import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
    user_id: mongoose.Types.ObjectId;
    post_id: mongoose.Types.ObjectId;
    type: string;
    read: boolean;
    createdAt: Date;
}

const NotificationSchema = new Schema({
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    post_id: {
        type: Schema.Types.ObjectId,
        ref: 'Post',
        required: true
    },
    type: {
        type: String,
        required: true,
        enum: ['like', 'retweet', 'reponse', 'follow', 'mention', 'signet']
    },
    read: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

NotificationSchema.index({ user_id: 1, createdAt: -1 });

export default mongoose.model<INotification>('Notification', NotificationSchema);