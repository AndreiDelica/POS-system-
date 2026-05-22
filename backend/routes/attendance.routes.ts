import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { Employee, Attendance } from '../models/index.js';

const router = express.Router();

router.post('/tap', authenticate, async (req, res) => {
  try {
    const { nfc_uid } = req.body;
    if (!nfc_uid) return res.status(400).json({ error: 'NFC UID required' });
    
    // 1. Find employee
    const emp = await Employee.findOne({ nfc_uid });
    if (!emp) return res.status(404).json({ error: 'Unknown NFC Card' });
    
    const today = new Date();
    today.setHours(0,0,0,0);
    
    // 2. Check today's attendance
    let att = await Attendance.findOne({
       employee_id: emp._id,
       date: { $gte: today }
    }).sort({ date: -1 });

    if (!att || (att.timeIn && att.timeOut)) {
        // Time IN
        att = await Attendance.create({
            employee_id: emp._id,
            date: new Date(),
            timeIn: new Date(),
            status: 'PRESENT'
        });
        return res.json({ message: `Time IN recorded for ${emp.name}`, type: 'IN' });
    } else if (att && att.timeIn && !att.timeOut) {
        // Time OUT
        att.timeOut = new Date();
        att.totalHours = (att.timeOut.getTime() - att.timeIn.getTime()) / (1000 * 60 * 60);
        await att.save();
        return res.json({ message: `Time OUT recorded for ${emp.name}`, type: 'OUT' });
    }

    res.status(400).json({ error: 'Invalid state' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/', authenticate, async (req, res) => {
    try {
        const query: any = {};
        const attendances = await Attendance.find(query)
            .sort({ date: -1 })
            .populate('employee_id');
        res.json(attendances);
    } catch (e) {
        res.status(500).json({ error: 'Failed to fetch attendance' });
    }
});

export default router;
