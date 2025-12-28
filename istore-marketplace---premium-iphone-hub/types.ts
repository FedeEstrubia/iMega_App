
export type UserRole = 'user' | 'admin';
export type ProductStatus = 'available' | 'reserved';
export type ProductCondition = 'sealed' | 'used';

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  points: number;
  level: number;
  role: UserRole;
  created_at: string;
}

export interface LevelRule {
  level: number;
  min_points: number;
  discount_percent: number;
  benefits_text: string;
}

export interface Product {
  id: string;
  model: string;
  storage: string;
  color: string;
  condition: ProductCondition;
  battery_health: number | null;
  box_included: boolean;
  accessories: string | null;
  warranty_days: number;
  description: string;
  status: ProductStatus;
  base_price_usd: number;
  created_at: string;
  updated_at: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
}

export interface Settings {
  blue_rate: number;
  whatsapp_number: string;
}

export interface PointsTransaction {
  id: string;
  user_id: string;
  delta_points: number;
  reason: string;
  created_at: string;
  created_by: string;
}

export interface Reservation {
  id: string;
  product_id: string;
  user_id: string | null;
  status: string;
  created_at: string;
}

export interface AppState {
  user: Profile | null;
  isAdmin: boolean;
  viewingAsLevel: number | null; // For admin simulation
  blueRate: number;
  whatsappNumber: string;
  levelRules: LevelRule[];
}
