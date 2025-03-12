import mongoose, { Schema, Document } from 'mongoose';

export interface IReponse extends Document {
    post_id: mongoose.Types.ObjectId;
    user_id: mongoose.Types.ObjectId;
    parent_reply_id?: mongoose.Types.ObjectId;
    texte: string;
    media?: {
        type: string;
        url: string;
    };
    createdAt: Date;
}

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
    parent_reply_id: {
        type: Schema.Types.ObjectId,
        ref: 'Reponse',
        default: null
    },
    texte: {
        type: String,
        required: true
    },
    media: {
        type: {
            type: String,
            enum: ['image', 'video']
        },
        url: String
    }
}, {
    timestamps: true
});

// Index pour optimiser les recherches
ReponseSchema.index({ post_id: 1, user_id: 1 });
ReponseSchema.index({ parent_reply_id: 1 });

export default mongoose.model<IReponse>('Reponse', ReponseSchema);