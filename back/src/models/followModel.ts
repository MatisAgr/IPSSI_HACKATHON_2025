import mongoose, { Schema, Document } from 'mongoose';

export interface IFollow extends Document {
    follower: mongoose.Types.ObjectId;
    following: mongoose.Types.ObjectId;      
    createdAt: Date;
}

const FollowSchema = new Schema({
    follower: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    following: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

FollowSchema.index({ follower: 1, following: 1 }, { unique: true });

export default mongoose.model<IFollow>('Follow', FollowSchema);
