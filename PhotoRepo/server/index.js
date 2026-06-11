import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import photosRouter from './routes/photos.js';
import searchRouter from './routes/search.js';
import { recoverPending } from './services/analysisQueue.js';

const PORT = process.env.PORT || 3001;

const app = express();
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
app.use(express.json());

app.use('/api/photos', photosRouter);
app.use('/api/search', searchRouter);

app.listen(PORT, () => {
  console.log(`Photo Repo server running on http://localhost:${PORT}`);
  recoverPending();
});
