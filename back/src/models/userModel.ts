import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcrypt';


export interface IUser extends Document {
  username: string;      
  hashtag: string;      
  bio?: string;         
  email: string;        
  premium: boolean;     
  password: string;     
  pdp?: string; 
  pdb?: string;
  age: number;  
  sexe?: string;  
  interests?: string[]; 
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;  
}


const UserSchema = new Schema({
  
  username: {
    type: String,
    required: true,     
    unique: false,       
    trim: true         
  },
  
  hashtag:{
    type: String,
    required: true,     
    unique: true,       
    trim: true         
  },

  bio:{
    type: String,
    trim: true         
  },

  email:{
    type: String,
    required: true,     
    unique: true,       
    trim: true         
  },

    premium:{
        type: Boolean,
        required: true,
        default: false
    },

    password: {
        type: String,
        required: true     
    },

    pdp:{
        type: String,
        trim: true         
    },

    pdb:{
        type: String,
        trim: true         
    },

    age:{
        type: Number
    },

    sexe:{
        type: String,
        trim: true         
    },

    interests:{
        type: [String],
        trim: true         
    }
  
}, {
  timestamps: true    
});


UserSchema.pre('save', async function(next) {
  
  if (!this.isModified('password')) return next();
    
  const salt = await bcrypt.genSalt(10);  
  this.password = await bcrypt.hash(this.password, salt);  
  next();
});


UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);  
};


export default mongoose.model<IUser>('User', UserSchema);