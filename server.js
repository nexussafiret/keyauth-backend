import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import licenseRoutes from './routes/licenses.js';
import userRoutes from './routes/users.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage (untuk demo, bisa diganti dengan database real)
export const db = {
  users: [],
  applications: [],
  licenses: []
};

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/licenses', licenseRoutes);
app.use('/api/users', userRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'KeyAuth API is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 KeyAuth Backend running on http://localhost:${PORT}`);
  console.log(`📊 API endpoints:`);
  console.log(`   - POST /api/auth/signup`);
  console.log(`   - POST /api/auth/login`);
  console.log(`   - POST /api/licenses/create`);
  console.log(`   - GET  /api/licenses`);
  console.log(`   - POST /api/licenses/verify`);
  console.log(`   - DELETE /api/licenses/:id`);
});
