import path from 'path';
import fs from 'fs';
import csv from 'csv-parse';

import uploadConfig from '../config/upload';
import Transaction from '../models/Transaction';
import CreateTransactionService from './CreateTransactionService';

interface TransactionDto {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class ImportTransactionsService {
  private extractTransactions(
    filePath: string,
  ): Promise<Array<TransactionDto>> {
    return new Promise((resolve, reject) => {
      let output = new Array<TransactionDto>();

      fs.createReadStream(filePath)
        .pipe(csv({ from_line: 2 }))
        .on('data', row => {
          const item = {
            title: row[0].trim(),
            type: row[1].trim(),
            value: Number(row[2].trim()),
            category: row[3].trim(),
          };

          output = output.concat(item);
        })
        .on('end', () => {
          fs.promises.unlink(filePath).then(() => {
            resolve(output);
          });
        })
        .on('error', () => {
          reject();
        });
    });
  }

  async execute(fileName: string): Promise<Transaction[]> {
    const filePath = path.join(uploadConfig.directory, fileName);
    const createTransaction = new CreateTransactionService();
    const savedTransactions: Transaction[] = [];
    const extractedTransactions = await this.extractTransactions(filePath);

    for (const transaction of extractedTransactions) {
      const { title, value, type, category } = transaction;

      const savedTransaction = await createTransaction.execute({
        title,
        value,
        type,
        category,
      });

      savedTransactions.push(savedTransaction);
    }

    return savedTransactions;
  }
}

export default ImportTransactionsService;
