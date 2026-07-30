import express from 'express';
const app = express();
app.get('/api/ping', (req, res) => {
  res.json({ success: true, message: 'pong', stage: 'test-index' });
});
app.get('/api/hello', (req, res) => {
  res.json({ success: true, message: 'hello from test-index' });
});
export default app;
