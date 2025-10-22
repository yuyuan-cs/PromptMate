export { WebDAVClient } from './WebDAVClient';
export { OneDriveClient } from './OneDriveClient';
export { CloudStorageManager } from './CloudStorageManager';
export type { SyncData } from './CloudStorageManager';

// 导出单例实例
export const cloudStorageManager = CloudStorageManager.getInstance();