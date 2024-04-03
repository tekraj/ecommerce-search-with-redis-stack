import type { Application } from 'express';
import express from 'express';
import { env } from './env.mjs';
import router from './routes/router';

const app: Application = express();
const port: string | number = env.PORT;
app.use(express.json());
app.use(router);
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
