import express from 'express';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { Service, ServiceModifier, Material, ColorMultiplier } from '../models/index.js';

const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  try {
    const services = await Service.find({ isActive: true }).populate('modifiers');
    res.json(services);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch services' });
  }
});

router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const newService = await Service.create(req.body);
    res.status(201).json(newService);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create service' });
  }
});

router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const updated = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update service' });
  }
});

// Materials
router.get('/materials', authenticate, async (req, res) => {
  try {
    const mats = await Material.find();
    res.json(mats);
  } catch (error) {
    res.status(500).json({ error: 'Failed' });
  }
});

router.post('/materials', authenticate, requireAdmin, async (req, res) => {
  try {
    const mat = await Material.create(req.body);
    res.status(201).json(mat);
  } catch (error) {
    res.status(400).json({ error: 'Failed' });
  }
});

// Color Multipliers
router.get('/colors', authenticate, async (req, res) => {
  try {
    const colors = await ColorMultiplier.find();
    res.json(colors);
  } catch (error) {
    res.status(500).json({ error: 'Failed' });
  }
});

router.post('/colors', authenticate, requireAdmin, async (req, res) => {
  try {
    const col = await ColorMultiplier.create(req.body);
    res.status(201).json(col);
  } catch (error) {
    res.status(400).json({ error: 'Failed' });
  }
});

router.post('/compute-price', authenticate, async (req, res) => {
  try {
    const { service_id, dimensions, material_id, color_id } = req.body;
    const service: any = await Service.findById(service_id);
    if (!service) return res.status(404).json({ error: 'Service not found' });
    
    let basePrice = service.basePrice;
    
    if (service.pricingType !== 'FORMULA') {
        return res.json({ price: basePrice });
    }
    
    const config = service.formulaConfig || {};
    const { width, height } = dimensions || {};
    if (!width || !height || width <= 0 || height <= 0) {
        return res.status(400).json({ error: 'Valid dimensions required' });
    }
    if (config.min_width && width < config.min_width) return res.status(400).json({ error: `Minimum width is ${config.min_width}` });
    if (config.max_width && width > config.max_width) return res.status(400).json({ error: `Maximum width is ${config.max_width}` });
    if (config.min_height && height < config.min_height) return res.status(400).json({ error: `Minimum height is ${config.min_height}` });
    if (config.max_height && height > config.max_height) return res.status(400).json({ error: `Maximum height is ${config.max_height}` });
    
    let mAddition = 0;
    let selectedMat = null;
    if (service.supports_materials && material_id) {
        const mat = await Material.findById(material_id);
        if (mat) {
           mAddition = mat.additional_rate;
           selectedMat = mat.material_name;
        }
    }
    
    let cMultiplier = 1;
    let selectedCol = null;
    if (service.supports_color_multiplier && color_id) {
        const col = await ColorMultiplier.findById(color_id);
        if (col) {
            cMultiplier = col.multiplier;
            selectedCol = col.label;
        }
    }
    
    const computed_formula = `(${basePrice} + ${mAddition}) x ${width} x ${height} x ${cMultiplier}`;
    const price = (basePrice + mAddition) * width * height * cMultiplier;
    
    res.json({ price, computed_formula, basePrice, mAddition, cMultiplier, selectedMat, selectedCol });
  } catch (error) {
    res.status(500).json({ error: 'Compute failed' });
  }
});

// Modifiers CRUD
router.post('/modifiers', authenticate, requireAdmin, async (req, res) => {
  try {
    const modifier = await ServiceModifier.create(req.body);
    res.status(201).json(modifier);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create modifier' });
  }
});
router.get('/modifiers', authenticate, requireAdmin, async (req, res) => {
  try {
    const modifiers = await ServiceModifier.find();
    res.json(modifiers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch modifiers' });
  }
});

export default router;
