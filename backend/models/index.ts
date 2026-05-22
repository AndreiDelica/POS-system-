import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['ADMIN', 'BRANCH_USER'], required: true },
  branch_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' }
}, { timestamps: true });

const branchSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String }
}, { timestamps: true });

const employeeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String },
  branch_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },
  nfc_uid: { type: String, unique: true, sparse: true },
  position: { type: String },
  salary_rate: { type: Number }
}, { timestamps: true });

const serviceModifierSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['TOGGLE', 'SELECTION', 'ADD_ON'], required: true },
  priceDelta: { type: Number, default: 0 },
  multiplierDelta: { type: Number, default: 0 },
});

const serviceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  image: { type: String },
  pricingType: { type: String, enum: ['FIXED', 'FORMULA', 'MANUAL', 'BUNDLE'], required: true },
  basePrice: { type: Number, default: 0 },
  unit: { type: String, default: 'ft' },
  supports_dimensions: { type: Boolean, default: false },
  supports_materials: { type: Boolean, default: false },
  supports_color_multiplier: { type: Boolean, default: false },
  formulaConfig: {
    min_width: Number,
    max_width: Number,
    min_height: Number,
    max_height: Number,
    multiplier: Number
  },
  modifiers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ServiceModifier' }],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const materialSchema = new mongoose.Schema({
  service_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
  material_name: { type: String, required: true },
  additional_rate: { type: Number, default: 0 },
  description: String
});

const colorMultiplierSchema = new mongoose.Schema({
  label: { type: String, required: true },
  multiplier: { type: Number, required: true }
});

const orderSchema = new mongoose.Schema({
  branch_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    service_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
    service_name: String,
    quantity: { type: Number, required: true, min: 1 },
    dimensions: { width: Number, height: Number },
    manualPrice: Number,
    selected_material: String,
    color_intensity: String,
    base_price: Number,
    material_addition: Number,
    color_multiplier: Number,
    computed_formula: String,
    subtotal: Number,
    modifiers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ServiceModifier' }],
    calculatedPrice: { type: Number, required: true }
  }],
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ['Pending', 'Printing', 'Ready', 'Completed'], default: 'Pending' }
}, { timestamps: true });

const attendanceSchema = new mongoose.Schema({
  employee_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  branch_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  timeIn: { type: Date, required: true },
  timeOut: { type: Date }
});

export const User = mongoose.model('User', userSchema);
export const Branch = mongoose.model('Branch', branchSchema);
export const Employee = mongoose.model('Employee', employeeSchema);
export const ServiceModifier = mongoose.model('ServiceModifier', serviceModifierSchema);
export const Service = mongoose.model('Service', serviceSchema);
export const Material = mongoose.model('Material', materialSchema);
export const ColorMultiplier = mongoose.model('ColorMultiplier', colorMultiplierSchema);
export const Order = mongoose.model('Order', orderSchema);
export const Attendance = mongoose.model('Attendance', attendanceSchema);
