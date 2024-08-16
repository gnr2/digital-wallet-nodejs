import mongoose, { Document, Schema } from 'mongoose';

// Define an interface representing a document in MongoDB.
export interface Wallet extends Document {
  user: mongoose.Schema.Types.ObjectId;
  balance: number;
  currency: string;
  stripeCustomerId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Create a Schema corresponding to the document interface.
const walletSchema = new Schema<Wallet>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  balance: {
    type: Number,
    default: 0,
    min: 0,
  },
  currency: {
    type: String,
    default: 'USD',
  },
  stripeCustomerId: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt field before saving
walletSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

// Create a Model.
const Wallet = mongoose.model<Wallet>('Wallet', walletSchema);

export default Wallet;
