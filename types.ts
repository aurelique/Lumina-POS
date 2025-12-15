export interface Product {
  id: string;
  name: string;
  price: number;
  cost: number;
  stock: number;
  category: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Transaction {
  id: string;
  date: string; // ISO string
  items: CartItem[];
  total: number;
  paymentMethod: 'TUNAI' | 'QRIS' | 'DIGITAL';
  status: 'LUNAS' | 'PENDING' | 'DIBATALKAN';
}

export interface User {
  username: string;
  role: 'ADMIN' | 'STAFF';
  token?: string;
}

export interface SalesReport {
  date: string;
  totalSales: number;
  transactionCount: number;
}