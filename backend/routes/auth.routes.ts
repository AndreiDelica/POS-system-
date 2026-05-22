import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, Branch, Service, Material, ColorMultiplier } from '../models/index.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'delicas-secret-key-123';

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const normalizedUsername = username?.trim().toLowerCase();
    const user = await User.findOne({ username: { $regex: new RegExp(`^${normalizedUsername}$`, 'i') } }).populate('branch_id');
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const isMatch = await bcrypt.compare(password, user.password as string);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { id: user._id, role: user.role, branch_id: user.branch_id?._id },
      JWT_SECRET,
      { expiresIn: '8h' }
    );
    
    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        branch_id: user.branch_id?._id,
        branch_name: (user.branch_id as any)?.name
      }
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: 'Server error during login: ' + String(error.message) });
  }
});

// Seed Initial Admin
router.post('/reset-db', async (req, res) => {
  try {
    const mongoose = (await import('mongoose')).default;
    if(mongoose.connection.db) {
       await mongoose.connection.db.dropDatabase();
    }
    const adminCount = await User.countDocuments({ role: 'ADMIN' });
    if (adminCount === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await User.create({
        username: 'admin',
        password: hashedPassword,
        role: 'ADMIN',
      });
      
      const branchHashed = await bcrypt.hash('branch123', 10);
      
      const rtuBranch = await Branch.create({ name: 'RTU Branch', address: 'Boni Ave' });
      await User.create({ username: 'branch_rtu', password: branchHashed, role: 'BRANCH_USER', branch_id: rtuBranch._id });

      const maysiloBranch = await Branch.create({ name: 'MAYSILO Branch', address: 'Maysilo Circle' });
      await User.create({ username: 'branch_maysilo', password: branchHashed, role: 'BRANCH_USER', branch_id: maysiloBranch._id });

      const dfaBranch = await Branch.create({ name: 'DFA Branch', address: 'DFA' });
      await User.create({ username: 'branch_dfa', password: branchHashed, role: 'BRANCH_USER', branch_id: dfaBranch._id });

      const tarpService = await Service.create({
         name: "Tarpaulin Printing",
         category: "Large Format",
         pricingType: "FORMULA",
         basePrice: 35,
         unit: "ft",
         supports_dimensions: true,
         supports_materials: true,
         supports_color_multiplier: true,
         formulaConfig: {
           min_width: 2,
           max_width: 5,
           min_height: 3,
           max_height: 6,
           multiplier: 1
         }
      });
      
      await Material.insertMany([
         { service_id: tarpService._id, material_name: 'Glossy', additional_rate: 10 },
         { service_id: tarpService._id, material_name: 'Matte', additional_rate: 15 },
         { service_id: tarpService._id, material_name: 'Premium HD', additional_rate: 25 },
      ]);
      
      await ColorMultiplier.insertMany([
         { label: 'Light', multiplier: 1.0 },
         { label: 'Normal', multiplier: 1.2 },
         { label: 'Heavy Ink', multiplier: 1.5 }
      ]);

      return res.json({ message: 'Seeded initial admin (admin/admin123) and branch user (branch1/branch123), plus Tarpaulin service' });
    }
    res.json({ message: 'Already seeded' });
  } catch (error) {
    res.status(500).json({ error: 'Seed error' });
  }
});

export default router;
