import '../server/env';
import express from 'express';

const app = express();

app.get('/api/ping', (req, res) => {
  res.json({ success: true, message: 'pong' });
});

export default app;
