import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

interface TransactionsWithBalance {
  transactions: Array<Transaction>;
  balance: Balance;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transactions = await this.find();

    return this.calculateBalance(transactions);
  }

  public async getTransactionsWithBalance(): Promise<TransactionsWithBalance> {
    const transactions = await this.find();
    const balance = await this.getBalance();

    return {
      transactions,
      balance,
    };
  }

  private calculateBalance(transactions: Array<Transaction>): Balance {
    function sumTransactions(total: number, transaction: Transaction): number {
      return total + transaction.value;
    }

    const income = transactions
      .filter(t => t.type === 'income')
      .reduce(sumTransactions, 0);

    const outcome = transactions
      .filter(t => t.type === 'outcome')
      .reduce(sumTransactions, 0);

    return {
      income,
      outcome,
      total: income - outcome,
    };
  }
}

export default TransactionsRepository;
