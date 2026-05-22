import express from 'express';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { Order, Employee, Branch, Service } from '../models/index.js';

const router = express.Router();

router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    let query: any = {};
    if (req.user?.role !== 'ADMIN') {
      query.branch_id = req.user?.branch_id;
    }
    
    const now = new Date();
    
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Start of week (Sunday)
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());

    // Start of month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const todayQuery = { ...query, createdAt: { $gte: today } };
    const weekQuery = { ...query, createdAt: { $gte: startOfWeek } };
    const monthQuery = { ...query, createdAt: { $gte: startOfMonth } };
    
    // Sales
    const [todayOrders, weekOrders, monthOrders, totalOrdersCount, pendingOrdersCount] = await Promise.all([
      Order.find(todayQuery),
      Order.find(weekQuery),
      Order.find(monthQuery),
      Order.countDocuments(query),
      Order.countDocuments({ ...query, status: 'Pending' })
    ]);
    
    const todaySales = todayOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const weeklySales = weekOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const monthlySales = monthOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    
    // Metadata
    const employeeCount = await Employee.countDocuments(req.user?.role === 'ADMIN' ? {} : { branch_id: req.user?.branch_id });
    const branchCount = req.user?.role === 'ADMIN' ? await Branch.countDocuments() : 1;
    
    res.json({
      todaySales,
      weeklySales,
      monthlySales,
      todayOrderCount: todayOrders.length,
      totalOrders: totalOrdersCount,
      pendingOrders: pendingOrdersCount,
      totalEmployees: employeeCount,
      activeBranches: branchCount
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

export default router;
