import cors from 'cors';
import express from 'express';
import {chatRouter} from './routes/chatRoutes.js';
import {errorHandler} from './middleware/errorHandler.js';

export const app = express();

app.use(cors());
app.use(express.json({limit: '2mb'}));

app.get('/api/health', (req, res) => {
  res.json({ok: true, service: 'medical-research-assistant'});
});

app.use('/api/chat', chatRouter);
app.use(errorHandler);
