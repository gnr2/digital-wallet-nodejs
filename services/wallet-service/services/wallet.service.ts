import { UserDocument } from '../models/user.model'; // Assuming you have a UserDocument type
import { TransactionDocument } from '../models/transaction.model'; // Assuming you have a TransactionDocument type
import StripeService from './stripe.service';

interface WalletResponse {
  success: boolean;
  wallet?: { balance: number; stripeCustomerId: string };
  newBalance?: number;
  transaction?: TransactionDocument;
  fromBalance?: number;
  toBalance?: number;
  balance?: number;
  transactions?: TransactionDocument[];
}

class WalletService {
  private stripeService: typeof StripeService;

  constructor() {
    this.stripeService = StripeService;
  }

  async createWallet(userId: string, email: string): Promise<WalletResponse> {
    const user = await User.findById(userId) as UserDocument | null;
    if (!user) {
      throw new Error('User not found');
    }
    if (user.wallet) {
      throw new Error('Wallet already exists for this user');
    }

    const customer = await this.stripeService.createCustomer(email);
    user.wallet = { balance: 0, stripeCustomerId: customer.id };
    await user.save();

    return { success: true, wallet: user.wallet };
  }

  async deposit(userId: string, amount: number, paymentMethodId: string): Promise<WalletResponse> {
    const user = await User.findById(userId) as UserDocument | null;
    if (!user || !user.wallet) {
      throw new Error('Wallet not found');
    }

    try {
      const paymentIntent = await this.stripeService.createPaymentIntent(amount, 'usd', user.wallet.stripeCustomerId);
      const confirmedPayment = await this.stripeService.confirmPaymentIntent(paymentIntent.id, paymentMethodId);

      if (confirmedPayment.status === 'succeeded') {
        user.wallet.balance += amount;
        await user.save();

        const transaction = new Transaction({
          type: 'deposit',
          userId,
          amount,
          timestamp: new Date(),
        }) as TransactionDocument;
        await transaction.save();

        return { success: true, transaction, newBalance: user.wallet.balance };
      } else {
        throw new Error('Payment failed');
      }
    } catch (error: any) {
      console.error('Deposit failed:', error);
      throw new Error('Deposit failed: ' + error.message);
    }
  }

  async transfer(fromUserId: string, toUserId: string, amount: number): Promise<WalletResponse> {
    const fromUser = await User.findById(fromUserId) as UserDocument | null;
    const toUser = await User.findById(toUserId) as UserDocument | null;

    if (!fromUser || !fromUser.wallet || !toUser || !toUser.wallet) {
      throw new Error('One or both wallets not found');
    }

    if (fromUser.wallet.balance < amount) {
      throw new Error('Insufficient funds');
    }

    fromUser.wallet.balance -= amount;
    toUser.wallet.balance += amount;

    await fromUser.save();
    await toUser.save();

    const transaction = new Transaction({
      type: 'transfer',
      fromUserId,
      toUserId,
      amount,
      timestamp: new Date(),
    }) as TransactionDocument;
    await transaction.save();

    return {
      success: true,
      transaction,
      fromBalance: fromUser.wallet.balance,
      toBalance: toUser.wallet.balance,
    };
  }

  async withdraw(userId: string, amount: number, destinationAccount: string): Promise<WalletResponse> {
    const user = await User.findById(userId) as UserDocument | null;
    if (!user || !user.wallet) {
      throw new Error('Wallet not found');
    }

    if (user.wallet.balance < amount) {
      throw new Error('Insufficient funds');
    }

    try {
      await this.stripeService.createPayout(amount, 'usd', destinationAccount);

      user.wallet.balance -= amount;
      await user.save();

      const transaction = new Transaction({
        type: 'withdraw',
        userId,
        amount,
        destinationAccount,
        timestamp: new Date(),
      }) as TransactionDocument;
      await transaction.save();

      return { success: true, transaction, newBalance: user.wallet.balance };
    } catch (error: any) {
      console.error('Withdrawal failed:', error);
      throw new Error('Withdrawal failed: ' + error.message);
    }
  }

  async getBalance(userId: string): Promise<WalletResponse> {
    const user = await User.findById(userId) as UserDocument | null;
    if (!user || !user.wallet) {
      throw new Error('Wallet not found');
    }

    return { success: true, balance: user.wallet.balance };
  }

  async getTransactionHistory(userId: string): Promise<WalletResponse> {
    const transactions = await Transaction.find({
      $or: [
        { userId: userId },
        { fromUserId: userId },
        { toUserId: userId },
      ],
    }).sort({ timestamp: -1 }) as TransactionDocument[];

    return { success: true, transactions };
  }
}

export default new WalletService();
