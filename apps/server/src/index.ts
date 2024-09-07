import cors from 'cors';
import 'dotenv/config';
import type { Application } from 'express';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { env } from './env.mjs';
import { router } from './routes/router';

declare let global: NodeJS.Global & typeof globalThis;

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);
const app: Application = express();
app.use(cors());
const publicDir = path.join(dirname, '../public');
global.publicDir = publicDir;
app.use(express.static(publicDir));
const port: string | number = env.PORT;
app.use(express.json());
app.use(router);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
