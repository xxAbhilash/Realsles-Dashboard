// User and Subscription Types
export interface Subscription {
  subscription_id: string;
  plan_type: "free" | "starter" | "manager" | "enterprise";
  billing_cycle: "monthly" | "yearly";
  credits_per_month: number;
  monthly_price: number;
  yearly_price?: number;
  max_users: number;
  max_session_duration?: number;
  status_active: boolean;
  is_custom: boolean;
  features: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface UserSubscription {
  user_subscription_id: string;
  subscription: Subscription;
  user_id: string;
  subscription_id: string;
  status_active: boolean;
  start_date: string;
  end_date?: string;
  credits_allocated: number;
  credits_used: number;
  credits_remaining: number;
  sessions_completed: number;
  time_used: number;
  created_at: string;
  updated_at: string;
}

export interface Role {
  role_id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface UserData {
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  company_id?: string;
  role?: Role;
  user_subscriptions?: UserSubscription[];
  status_active: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

// Redux State Types
export interface AuthState {
  auth: string;
  user: UserData | {};
}

// Payment Types
export interface Payment {
  payment_id: string;
  user_id: string;
  subscription_id: string;
  amount: string; // API returns as string
  currency: string;
  payment_method: string; // API returns as "card" not specific types
  payment_status: string; // API returns as "paid" not "completed"
  provider: string; // e.g., "stripe"
  external_payment_id?: string;
  payment_date: string;
  receipt_url?: string;
  failure_reason?: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaymentMethod {
  payment_method_id: string;
  user_id: string;
  method_type: "credit_card" | "debit_card";
  card_last_four: string;
  card_brand: "visa" | "mastercard" | "amex" | "discover";
  expiry_month: number;
  expiry_year: number;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

// Root State Type
export interface RootState {
  auth: AuthState;
}
