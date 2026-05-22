import express from 'express';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { Order, Service, ServiceModifier, Material, ColorMultiplier } from '../models/index.js';

const router = express.Router();

router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { items } = req.body;
    let totalAmount = 0;
    const processedItems = [];

    for (const item of items) {
      const service: any = await Service.findById(item.service_id).populate('modifiers');
      if (!service) return res.status(404).json({ error: `Service undefined` });

      let basePrice = service.basePrice;
      let calculatedPrice = 0;
      let multiplier = 1;

      // Type specific checks
      if (service.pricingType === 'FIXED') {
        calculatedPrice = basePrice;
      } else if (service.pricingType === 'FORMULA') {
        if (!item.dimensions?.width || !item.dimensions?.height) {
          return res.status(400).json({ error: `Dimensions required for ${service.name}` });
        }
        const { width, height } = item.dimensions;
        if (width <= 0 || height <= 0) return res.status(400).json({ error: `Invalid dimensions` });
        
        const config = service.formulaConfig || {};
        if (config.min_width && width < config.min_width) return res.status(400).json({ error: `Min width ${config.min_width}` });
        if (config.max_width && width > config.max_width) return res.status(400).json({ error: `Max width ${config.max_width}` });
        if (config.min_height && height < config.min_height) return res.status(400).json({ error: `Min height ${config.min_height}` });
        if (config.max_height && height > config.max_height) return res.status(400).json({ error: `Max height ${config.max_height}` });
        
        // mAddition and cMultiplier from item data - need to validate that they map to realities, or since the prompt says "Never trust...", we should fetch them.
        let mAddition = 0;
        let selectedMatStr = "";
        if (service.supports_materials && item.selected_material) {
            const mat = await Material.findOne({ material_name: item.selected_material, service_id: service._id });
            if (mat) {
                mAddition = mat.additional_rate;
                selectedMatStr = mat.material_name;
            } else {
                return res.status(400).json({ error: 'Invalid material' });
            }
        }

        let cMultiplier = 1;
        let selectedColStr = "";
        if (service.supports_color_multiplier && item.color_intensity) {
             const col = await ColorMultiplier.findOne({ label: item.color_intensity });
             if (col) {
                 cMultiplier = col.multiplier;
                 selectedColStr = col.label;
             } else {
                 return res.status(400).json({ error: 'Invalid color multiplier' });
             }
        }

        calculatedPrice = (basePrice + mAddition) * width * height * cMultiplier;
        
        item.base_price = basePrice;
        item.material_addition = mAddition;
        item.color_multiplier = cMultiplier;
        item.computed_formula = `(${basePrice} + ${mAddition}) x ${width} x ${height} x ${cMultiplier}`;
        item.subtotal = calculatedPrice;
        item.service_name = service.name;
        item.selected_material = selectedMatStr;
        item.color_intensity = selectedColStr;
        
      } else if (service.pricingType === 'MANUAL') {
        if (!item.manualPrice || item.manualPrice < 0) {
          return res.status(400).json({ error: `Invalid manual price for ${service.name}` });
        }
        calculatedPrice = item.manualPrice;
      }

      // Modifier application
      if (item.modifiers && Array.isArray(item.modifiers)) {
        for (const modId of item.modifiers) {
          const modifierRecord = service.modifiers.find((m: any) => m._id.toString() === modId);
          if (modifierRecord) {
            calculatedPrice += modifierRecord.priceDelta;
            if (modifierRecord.multiplierDelta > 0) {
              multiplier *= modifierRecord.multiplierDelta; // E.g., x2
            }
          }
        }
      }

      calculatedPrice = calculatedPrice * multiplier * item.quantity;
      totalAmount += calculatedPrice;
      
      processedItems.push({
        ...item,
        calculatedPrice 
      });
    }

    const order = await Order.create({
      branch_id: req.user?.branch_id,
      user_id: req.user?.id,
      items: processedItems,
      totalAmount,
      status: 'Pending'
    });

    res.status(201).json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    let query: any = {};
    if (req.user?.role !== 'ADMIN') {
      query.branch_id = req.user?.branch_id;
    }
    
    // Sort logic (can be extended)
    const orders = await Order.find(query)
      .populate('items.service_id')
      .populate('user_id', 'username')
      .sort({ createdAt: -1 })
      .limit(50);
      
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

router.put('/:id/status', authenticate, async (req: AuthRequest, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json(order);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update order status' });
  }
});

export default router;
