import mongoose, { Schema, Document } from 'mongoose';

export interface IPost extends Document {
    author: mongoose.Types.ObjectId;
    texte: string;
    media?: {
        type: string;  
        url: string;
    };
    tags: string[];
    isThread: boolean;
    createdAt: Date;
    updatedAt: Date;
    popularityScore: number;
}

const PostSchema = new Schema({
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
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
    },
    tags: [{
        type: String,
        trim: true
    }],
    isThread: {
        type: Boolean,
        default: true
    },
    popularityScore: { 
        type: Number, 
        default: 0 } 
}, {
    timestamps: true 
});


PostSchema.index({ author: 1, createdAt: -1 });
PostSchema.index({ tags: 1 });
PostSchema.index({ texte: 'text' });

export default mongoose.model<IPost>('Post', PostSchema);