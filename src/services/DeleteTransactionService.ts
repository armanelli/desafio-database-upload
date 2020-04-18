import { getCustomRepository } from 'typeorm';

import AppError from '../errors/AppError';
import TransactionsRepository from '../repositories/TransactionsRepository';

class DeleteTransactionService {
  public async execute(id: string): Promise<void> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);

    const existingTransaction = await transactionsRepository.findOne(id);

    if (!existingTransaction) {
      throw new AppError('The specified transaction doest not exist', 404);
    }

    await transactionsRepository.delete(id);
  }
}

export default DeleteTransactionService;
