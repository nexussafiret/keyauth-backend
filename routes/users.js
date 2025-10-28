import express from 'express';
import { db } from '../server.js';

const router = express.Router();

// Get user info
router.get('/:id', (req, res) => {
  const { id } = req.params;
  
  const user = db.users.find(u => u.id === id);
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  const application = db.applications.find(a => a.userId === user.id);
  
  res.json({
    success: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      ownerId: user.ownerId,
      createdAt: user.createdAt
    },
    application
  });
});

export default router;
