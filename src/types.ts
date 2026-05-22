export type Role = 'ADMIN' | 'BRANCH_USER';

export interface User {
  _id: string;
  username: string;
  role: Role;
  branch_id?: string;
}

export interface Branch {
  _id: string;
  name: string;
  address: string;
}

export interface Employee {
  _id: string;
  name: string;
  image?: string;
  branch_id: string;
  nfc_uid?: string;
  position: string;
  salary_rate?: number;
  branch_id_obj?: Branch;
  attendances?: Attendance[];
}

export interface ServiceModifier {
  _id: string;
  name: string;
  type: 'TOGGLE' | 'SELECTION' | 'ADD_ON';
  priceDelta: number;
  multiplierDelta: number;
}

export type PricingType = 'FIXED' | 'FORMULA' | 'MANUAL' | 'BUNDLE';

export interface FormulaConfig {
  min_width?: number;
  max_width?: number;
  min_height?: number;
  max_height?: number;
  multiplier?: number;
}

export interface Service {
  _id: string;
  name: string;
  category: string;
  pricingType: PricingType;
  basePrice: number;
  unit: string;
  supports_dimensions: boolean;
  supports_materials: boolean;
  supports_color_multiplier: boolean;
  formulaConfig?: FormulaConfig;
  modifiers: ServiceModifier[];
  image?: string;
}

export interface Material {
  _id: string;
  service_id: string;
  material_name: string;
  additional_rate: number;
  description?: string;
}

export interface ColorMultiplier {
  _id: string;
  label: string;
  multiplier: number;
}

export interface OrderItem {
  service_id: Service;
  service_name?: string;
  quantity: number;
  modifiers: any[];
  dimensions?: { width: number; height: number };
  manualPrice?: number;
  selected_material?: string;
  color_intensity?: string;
  base_price?: number;
  material_addition?: number;
  color_multiplier?: number;
  computed_formula?: string;
  subtotal?: number;
  calculatedPrice: number;
}

export interface Order {
  _id: string;
  branch_id: string;
  user_id: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'Pending' | 'Printing' | 'Ready' | 'Completed';
  createdAt: string;
}

export interface Attendance {
  _id: string;
  employee_id: Employee;
  branch_id: string;
  timeIn: string;
  timeOut?: string;
  date: string; // YYYY-MM-DD
}
