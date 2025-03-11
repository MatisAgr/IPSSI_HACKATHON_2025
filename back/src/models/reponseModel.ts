import mongoose, { Schema, Document } from 'mongoose';

export interface IReponse extends Document {
    post_id: mongoose.Types.ObjectId;
    user_id: mongoose.Types.ObjectId;
    createdAt: Date;
}
0
const ReponseSchema = new Schema({
    post_id: {
        type: Schema.Types.ObjectId,
        ref: 'Post',
        required: true
    },
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    
}, {
    timestamps: true
});

ReponseSchema.index({ post_id: 1, user_id: 1 });

export default mongoose.model<IReponse>('Reponse', ReponseSchema);