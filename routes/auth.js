import express from 'express';
import { db } from '../server.js';
import { generateUserId } from '../utils/generateKey.js';
import { logUserRegistration } from '../utils/discord.js';

const router = express.Router();

// Signup
router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;
  
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  
  // Check if user exists
  const existingUser = db.users.find(u => u.email === email);
  if (existingUser) {
    return res.status(400).json({ error: 'User already exists' });
  }
  
  // Create user
  const user = {
    id: generateUserId(),
    name,
    email,
    password, // In production, hash this!
    ownerId: generateUserId(),
    createdAt: new Date().toISOString()
  };
  
  db.users.push(user);
  
  // Create default application for user
  const application = {
    id: generateUserId(),
    userId: user.id,
    name: name.toUpperCase().replace(/\s+/g, '_'),
    ownerId: user.ownerId,
    version: '1.0',
    createdAt: new Date().toISOString()
  };
  
  db.applications.push(application);
  
  // Log to Discord
  await logUserRegistration(user);
  
  res.json({
    success: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      ownerId: user.ownerId
    },
    application
  });
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  
  const user = db.users.find(u => u.email === email && u.password === password);
  
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  const application = db.applications.find(a => a.userId === user.id);
  
  res.json({
    success: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      ownerId: user.ownerId
    },
    application
  });
});

export default router;
