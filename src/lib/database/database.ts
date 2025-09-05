import Database from 'better-sqlite3';
import { app } from 'electron';
import { join } from 'path';
import { promises as fs } from 'fs';

export class DatabaseManager {
  private static instance: DatabaseManager;
  private db: Database.Database | null = null;
  private dbPath: string;

  private constructor() {
    const userDataPath = app.getPath('userData');
    this.dbPath = join(userDataPath, 'promptmate.db');
  }

  public static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  public async init(): Promise<void> {
    try {
      // 创建数据库连接
      this.db = new Database(this.dbPath);
      
      // 启用WAL模式以提高性能
      this.db.pragma('journal_mode = WAL');
      
      // 执行Schema
      await this.createTables();
      
      console.log('数据库初始化成功:', this.dbPath);
    } catch (error) {
      console.error('数据库初始化失败:', error);
      throw error;
    }
  }

  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('数据库未初始化');
    
    try {
      // 读取schema.sql文件
      const schemaPath = join(__dirname, 'schema.sql');
      const schema = await fs.readFile(schemaPath, 'utf-8');
      
      // 执行schema SQL
      this.db.exec(schema);
      console.log('数据库表创建成功');
    } catch (error) {
      console.error('创建数据库表失败:', error);
      throw error;
    }
  }

  public getDatabase(): Database.Database {
    if (!this.db) {
      throw new Error('数据库未初始化');
    }
    return this.db;
  }

  public close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }

  public backup(backupPath: string): void {
    if (!this.db) throw new Error('数据库未初始化');
    
    this.db.backup(backupPath);
  }
}