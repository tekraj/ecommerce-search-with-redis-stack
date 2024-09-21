import cors from 'cors';
import 'dotenv/config';
import type { Application } from 'express';
import express from 'express';
import path from 'node:path';

import { env } from './env.mjs';
import { dirname } from './get-upload-dir';
import { adminRouter } from './routes/admin-router';
import { router } from './routes/router';

declare let global: NodeJS.Global & typeof globalThis;
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise rejection:', err);
});
process.on('uncaughtException', (error) => {
  console.error('uncaughtException error:', error);
});

const app: Application = express();
app.use(cors());
app.use('/images', express.static(path.join(dirname, '../uploads')));

const publicDir = path.join(dirname, '../public');
global.publicDir = publicDir;
app.use(express.static(publicDir));
const port: string | number = env.PORT;
app.use(express.json());
app.use('/admin', adminRouter);
app.use(router);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
