import mongoose, { Document, Schema } from 'mongoose';

interface IToken extends Document {
    token: string;
    expiresAt: Date;
}

const tokenSchema = new Schema<IToken>({
    token: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true }
});

const Token = mongoose.model<IToken>('Token', tokenSchema);

export default Token;