import express from 'express';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { Employee, Attendance } from '../models/index.js';

const router = express.Router();

router.get('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const employees = await Employee.find().populate('branch_id');
    const enrichedEmployees = await Promise.all(employees.map(async emp => {
      // get recent attendance or stats
      const attendances = await Attendance.find({ employee_id: emp._id }).sort({ date: -1 }).limit(30);
      return { 
        ...emp.toObject(), 
        attendances 
      };
    }));
    res.json(enrichedEmployees);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch employees' });
  }
});

router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const newEmp = await Employee.create(req.body);
    res.status(201).json(newEmp);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create employee' });
  }
});

router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const updated = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update employee' });
  }
});

router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
    try {
      await Employee.findByIdAndDelete(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: 'Failed to delete employee' });
    }
  });

export default router;
