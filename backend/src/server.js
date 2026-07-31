require('dotenv').config();

const express = require('express');
const cors = require('cors');
const leadRoutes = require('./routes/leadRoutes');
const historyRoutes = require('./routes/historyRoutes');
const { errorHandler, notFoundHandler } = require('./middlewares/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';
app.use(
  cors({
    origin: corsOrigin.split(',').map((origin) => origin.trim()),
  })
);
app.use(express.json({ limit: '32kb' }));

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/api/leads', leadRoutes);
app.use('/api/history', historyRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`API de Leads rodando em http://localhost:${PORT}`);
});
