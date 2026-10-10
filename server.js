import express from 'express';
import { randomUUID } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer as createViteServer } from 'vite';

const directory = path.dirname(fileURLToPath(import.meta.url));
const dataDirectory = path.join(directory, 'data');
const dataFile = path.join(dataDirectory, 'reviews.json');
const production = process.env.NODE_ENV === 'production';
const port = Number(process.env.PORT) || 3000;

mkdirSync(dataDirectory, { recursive: true });
if (!readFileSyncSafe(dataFile)) writeFileSync(dataFile, '[]\n', 'utf8');

function readFileSyncSafe(file) {
  try {
    return readFileSync(file, 'utf8');
  } catch {
    return null;
  }
}

function getReviews() {
  try {
    const reviews = JSON.parse(readFileSync(dataFile, 'utf8'));
    return Array.isArray(reviews) ? reviews : [];
  } catch {
    return [];
  }
}

const app = express();
app.use(express.json({ limit: '10kb' }));

app.get('/api/reviews', (_request, response) => {
  response.json(getReviews());
});

app.post('/api/reviews', (request, response) => {
  const name = typeof request.body?.name === 'string' ? request.body.name.trim() : '';
  const review = typeof request.body?.review === 'string' ? request.body.review.trim() : '';
  const course = typeof request.body?.course === 'string' ? request.body.course.trim() : '';
  const rating = Number(request.body?.rating);

  if (name.length < 1 || name.length > 40) {
    return response.status(400).json({ error: 'Name must be between 1 and 40 characters.' });
  }
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return response.status(400).json({ error: 'Choose a rating from 1 to 5 stars.' });
  }
  if (review.length < 10 || review.length > 600) {
    return response.status(400).json({ error: 'Review must be between 10 and 600 characters.' });
  }

  const savedReview = {
    id: randomUUID(),
    name,
    course: course.slice(0, 60) || 'General experience',
    rating,
    review,
    createdAt: Date.now(),
  };

  try {
    const reviews = getReviews();
    reviews.push(savedReview);
    writeFileSync(dataFile, `${JSON.stringify(reviews, null, 2)}\n`, 'utf8');
    response.status(201).json(savedReview);
  } catch {
    response.status(500).json({ error: 'Could not save your review. Please try again.' });
  }
});

if (production) {
  app.use(express.static(path.join(directory, 'dist')));
  app.get('*', (_request, response) => response.sendFile(path.join(directory, 'dist', 'index.html')));
} else {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
}

app.listen(port, '0.0.0.0', () => {
  console.log(`Next Programmers reviews running at http://localhost:${port}`);
});
