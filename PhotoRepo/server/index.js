import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import photosRouter from './routes/photos.js';
import searchRouter from './routes/search.js';
import { recoverPending } from './services/analysisQueue.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3001;

const app = express();
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

// Serve original photos and thumbnails as static files
app.use('/photos/original', express.static(join(__dirname, 'uploads')));
app.use('/thumbnails', express.static(join(__dirname, 'thumbnails')));

app.use('/api/photos', photosRouter);
app.use('/api/search', searchRouter);

app.listen(PORT, () => {
  console.log(`Photo Repo server running on http://localhost:${PORT}`);
  recoverPending();
});
