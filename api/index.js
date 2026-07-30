import express from 'express';
import { greet } from './_lib/helper.js';

const app = express();

app.get('/api/ping', (req, res) => {
  res.json({ success: true, message: 'pong', greet: greet('world') });
});

export default app;
