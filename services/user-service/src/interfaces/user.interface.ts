import { Document } from "mongoose";

// Define the wallet schema
export interface IWallet {
  balance: number;
  stripeCustomerId: string;
}

export interface IUser extends Document {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  wallet: IWallet;
  createdAt: Date;
  checkPassword(candidatePassword: string): Promise<boolean>;
}
