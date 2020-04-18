import { getCustomRepository } from 'typeorm';

import AppError from '../errors/AppError';
import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';
import CategoriesRepository from '../repositories/CategoriesRepository';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const categoriesRepository = getCustomRepository(CategoriesRepository);

    if (value <= 0) {
      throw new AppError('Value must be greater than zero', 400);
    }

    if (!['income', 'outcome'].includes(type)) {
      throw new AppError('The type of the transaction is invalid.', 400);
    }

    const { total: totalBalance } = await transactionsRepository.getBalance();

    if (type === 'outcome' && value > totalBalance) {
      throw new AppError('Insufficient funds.', 400);
    }

    const { id: category_id } = await categoriesRepository.findOrCreate(
      category,
    );

    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category_id,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
