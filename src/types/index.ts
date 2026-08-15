export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  created_at: string;
  updated_at: string;
}

export interface Address {
  id: number;
  user_id: number;
  type: 'billing' | 'shipping';
  line1: string;
  line2?: string;
  city_id: number;
  state_id: number;
  country_id: number;
  postal_code: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  parent_id?: number;
  name: string;
  slug: string;
  created_at: string;
  updated_at: string;
}

export interface Product {
  product_id: number;
  name: string;
  description: string;
  category_id: number;
  brand: string;
  base_price: number;
  b2b_price: number;
  stock_quantity: number;
  sku_code: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  category?: Category;
}

export interface Cart {
  id: number;
  user_id?: number;
  session_id?: string;
  status: 'active' | 'checked_out' | 'abandoned';
  currency_code: string;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  id: number;
  cart_id: number;
  product_id: number;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface Order {
  id: number;
  user_id: number;
  cart_id: number;
  order_type: 'retail' | 'b2b';
  total_amount: number;
  discount: number;
  final_amount: number;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_method: 'cod' | 'card' | 'upi' | 'netbanking';
  delivery_status: 'pending' | 'assigned' | 'shipped' | 'delivered' | 'cancelled';
  address_id: number;
  invoice_number: string;
  created_at: string;
  updated_at: string;
  user?: User;
  items?: OrderItem[];
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  price: number;
  subtotal: number;
  product?: Product;
}