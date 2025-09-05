import Database from 'better-sqlite3';
import { DatabaseManager } from '../database';

export abstract class BaseDAO {
  protected db: Database.Database;

  constructor() {
    this.db = DatabaseManager.getInstance().getDatabase();
  }

  protected executeInTransaction<T>(fn: () => T): T {
    const transaction = this.db.transaction(fn);
    return transaction();
  }

  protected handleError(operation: string, error: any): never {
    console.error(`数据库操作失败 [${operation}]:`, error);
    throw new Error(`数据库操作失败: ${operation}`);
  }
}