import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import { IUser, IWallet } from '../interfaces/user.interface';

// Define the wallet schema
const walletSchema = new Schema<IWallet>({
  balance: {
    type: Number,
    default: 0,
    min: 0
  },
  stripeCustomerId: {
    type: String,
    required: true
  }
}, { _id: false }); // Disable _id for subdocument


const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  wallet: walletSchema,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre<IUser>('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Method to check password
userSchema.methods.checkPassword = async function(candidatePassword: string): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Export the User model
const User = mongoose.model<IUser>('User', userSchema);

export default User;
