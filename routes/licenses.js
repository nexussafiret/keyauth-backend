import express from 'express';
import { db } from '../server.js';
import { generateLicenseKey, generateUserId } from '../utils/generateKey.js';
import { logLicenseCreation, logLicenseVerification } from '../utils/discord.js';

const router = express.Router();

// Create license(s)
router.post('/create', async (req, res) => {
  const { 
    userId, 
    amount = 1, 
    mask = '******-******-******-******', 
    lowercase = true, 
    uppercase = true,
    duration = 'Lifetime',
    note = '',
    level = 'Lifetime'
  } = req.body;
  
  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }
  
  const user = db.users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  const licenses = [];
  const numLicenses = parseInt(amount);
  
  for (let i = 0; i < numLicenses; i++) {
    const license = {
      id: generateUserId(),
      key: generateLicenseKey(mask, { lowercase, uppercase, numbers: true }),
      userId: userId,
      createdBy: user.name,
      duration: duration,
      level: level,
      note: note,
      status: 'Unused',
      usedOn: null,
      usedBy: null,
      createdAt: new Date().toISOString(),
      expiresAt: duration === 'Lifetime' ? null : calculateExpiry(duration)
    };
    
    db.licenses.push(license);
    licenses.push(license);
    
    // Log to Discord
    await logLicenseCreation(license, user.name);
  }
  
  res.json({
    success: true,
    message: `${numLicenses} license(s) created successfully`,
    licenses
  });
});

// Get all licenses for a user
router.get('/', (req, res) => {
  const { userId } = req.query;
  
  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }
  
  const licenses = db.licenses.filter(l => l.userId === userId);
  
  res.json({
    success: true,
    count: licenses.length,
    licenses
  });
});

// Verify license (for app integration)
router.post('/verify', async (req, res) => {
  const { licenseKey, hwid } = req.body;
  
  if (!licenseKey) {
    return res.status(400).json({ 
      valid: false, 
      message: 'License key is required' 
    });
  }
  
  const license = db.licenses.find(l => l.key === licenseKey);
  
  if (!license) {
    await logLicenseVerification(licenseKey, { 
      valid: false, 
      message: 'License key not found' 
    });
    
    return res.json({
      valid: false,
      message: 'Invalid license key'
    });
  }
  
  // Check if license is already used
  if (license.status === 'Used' && license.hwid !== hwid) {
    await logLicenseVerification(licenseKey, { 
      valid: false, 
      message: 'License already used by another device' 
    });
    
    return res.json({
      valid: false,
      message: 'License key already in use by another device'
    });
  }
  
  // Check expiry
  if (license.expiresAt && new Date() > new Date(license.expiresAt)) {
    await logLicenseVerification(licenseKey, { 
      valid: false, 
      message: 'License expired' 
    });
    
    return res.json({
      valid: false,
      message: 'License key has expired'
    });
  }
  
  // Mark as used if first time
  if (license.status === 'Unused') {
    license.status = 'Used';
    license.usedOn = new Date().toISOString();
    license.hwid = hwid;
  }
  
  await logLicenseVerification(licenseKey, { 
    valid: true, 
    message: 'License verified successfully' 
  });
  
  res.json({
    valid: true,
    message: 'License key is valid',
    license: {
      key: license.key,
      level: license.level,
      expiresAt: license.expiresAt
    }
  });
});

// Delete license
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const { userId } = req.query;
  
  const index = db.licenses.findIndex(l => l.id === id && l.userId === userId);
  
  if (index === -1) {
    return res.status(404).json({ error: 'License not found' });
  }
  
  db.licenses.splice(index, 1);
  
  res.json({
    success: true,
    message: 'License deleted successfully'
  });
});

// Delete all licenses (with filters)
router.post('/delete-bulk', (req, res) => {
  const { userId, type } = req.body; // type: 'all', 'used', 'unused'
  
  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }
  
  let deletedCount = 0;
  
  if (type === 'all') {
    const beforeCount = db.licenses.length;
    db.licenses = db.licenses.filter(l => l.userId !== userId);
    deletedCount = beforeCount - db.licenses.length;
  } else if (type === 'used') {
    const beforeCount = db.licenses.length;
    db.licenses = db.licenses.filter(l => !(l.userId === userId && l.status === 'Used'));
    deletedCount = beforeCount - db.licenses.length;
  } else if (type === 'unused') {
    const beforeCount = db.licenses.length;
    db.licenses = db.licenses.filter(l => !(l.userId === userId && l.status === 'Unused'));
    deletedCount = beforeCount - db.licenses.length;
  }
  
  res.json({
    success: true,
    message: `${deletedCount} license(s) deleted`,
    deletedCount
  });
});

function calculateExpiry(duration) {
  // Parse duration (e.g., "30 days", "7 days", "1 year")
  const now = new Date();
  const parts = duration.toLowerCase().split(' ');
  
  if (parts.length !== 2) return null;
  
  const value = parseInt(parts[0]);
  const unit = parts[1];
  
  switch (unit) {
    case 'day':
    case 'days':
      now.setDate(now.getDate() + value);
      break;
    case 'week':
    case 'weeks':
      now.setDate(now.getDate() + (value * 7));
      break;
    case 'month':
    case 'months':
      now.setMonth(now.getMonth() + value);
      break;
    case 'year':
    case 'years':
      now.setFullYear(now.getFullYear() + value);
      break;
    default:
      return null;
  }
  
  return now.toISOString();
}

export default router;
