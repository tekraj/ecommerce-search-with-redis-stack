import path from 'node:path';
import { fileURLToPath } from 'node:url';

const filename = fileURLToPath(import.meta.url);
export const dirname = path.join(path.dirname(filename));
export const getUploadDir = () => {
  return path.join(dirname, '../uploads');
};
