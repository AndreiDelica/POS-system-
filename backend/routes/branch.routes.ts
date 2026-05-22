import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { Branch } from '../models/index.js';

const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  try {
    const branches = await Branch.find();
    res.json(branches);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch branches' });
  }
});

export default router;
