import { cp, mkdir } from 'fs/promises';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

async function copyMainFiles() {
  try {
    // 确保目标目录存在
    await mkdir(join(rootDir, 'dist-electron/main'), { recursive: true });
    
    // 复制main.cjs
    await cp(
      join(rootDir, 'src/main/main.cjs'),
      join(rootDir, 'dist-electron/main/main.cjs')
    );
    
    // 复制preload.cjs
    await cp(
      join(rootDir, 'src/main/preload.cjs'),
      join(rootDir, 'dist-electron/main/preload.cjs')
    );
    
    console.log('Main process files copied successfully!');
  } catch (err) {
    console.error('Error copying main files:', err);
  }
}

copyMainFiles(); 