import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

import authRoutes from './backend/routes/auth.routes.js';
import serviceRoutes from './backend/routes/service.routes.js';
import orderRoutes from './backend/routes/order.routes.js';
import analyticsRoutes from './backend/routes/analytics.routes.js';
import employeeRoutes from './backend/routes/employee.routes.js';
import branchRoutes from './backend/routes/branch.routes.js';
import attendanceRoutes from './backend/routes/attendance.routes.js';

let currentFilename = '';
let currentDirname = '';
try {
  currentFilename = fileURLToPath(import.meta.url);
  currentDirname = path.dirname(currentFilename);
} catch (e) {
  // CommonJS fallback
  currentFilename = __filename;
  currentDirname = __dirname;
}

const PORT = 3000;
const app = express();

app.use(cors());
app.use(express.json());

// Database connection
const MONGODB_URI = process.env.MONGODB_URI;

async function startServer() {
  if (MONGODB_URI) {
    await mongoose.connect(MONGODB_URI)
      .then(() => console.log('MongoDB connected to external URI'))
      .catch(err => console.error('MongoDB connection error:', err));
  } else {
    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      const uri = mongoServer.getUri();
      await mongoose.connect(uri);
      console.log('MongoDB connected to Memory Server');
      import('fs').then(fs => fs.writeFileSync('db-connected.log', 'connected'));
      
      // Seed Initial Admin automatically if memory server
      const { User, Branch, Service, Material, ColorMultiplier } = await import('./backend/models/index.js');
      const bcrypt = await import('bcryptjs');
      const adminCount = await User.countDocuments({ role: 'ADMIN' });
      if (adminCount === 0) {
        const hashedPassword = await bcrypt.default.hash('admin123', 10);
        await User.create({ username: 'admin', password: hashedPassword, role: 'ADMIN' });
        
        const branchHashed = await bcrypt.default.hash('password123', 10);
      
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
           formulaConfig: { min_width: 2, max_width: 5, min_height: 3, max_height: 6, multiplier: 1 }
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
        
        console.log('Successfully seeded local memory db');
      }
    } catch (err) {
      console.error('Memory Server / Seed Failed', err);
    }
  }

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/services', serviceRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/analytics', analyticsRoutes);
  app.use('/api/employees', employeeRoutes);
  app.use('/api/branches', branchRoutes);
  app.use('/api/attendance', attendanceRoutes);

  app.get('/api/health', (req, res) => {
    import('mongoose').then(m => {
      res.json({ status: 'ok', readyState: m.default.connection.readyState });
    });
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);

    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        let template = await import('fs').then(m => m.readFileSync(path.resolve(process.cwd(), 'index.html'), 'utf-8'));
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });

  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
