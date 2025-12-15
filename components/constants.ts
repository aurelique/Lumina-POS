import { User } from './types';

export const APP_NAME = "Lumina POS";

export const DEFAULT_USER: User = {
  username: 'admin',
  role: 'ADMIN'
};

// Simple hardcoded auth for demo purposes
export const DEMO_CREDENTIALS = {
  username: 'admin',
  password: 'password123'
};

export const INITIAL_CATEGORIES = [
  'Semua',
  'Makanan',
  'Minuman',
  'Retail',
  'Jasa',
  'Lainnya'
];

export const formatRupiah = (number: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(number);
};

export const MOCK_PRODUCTS = [
  { id: '1', name: 'Kopi Susu Gula Aren', price: 18000, cost: 6000, stock: 50, category: 'Minuman' },
  { id: '2', name: 'Croissant Almond', price: 25000, cost: 12000, stock: 24, category: 'Makanan' },
  { id: '3', name: 'Matcha Latte', price: 22000, cost: 8000, stock: 30, category: 'Minuman' },
  { id: '4', name: 'Nasi Goreng Spesial', price: 35000, cost: 15000, stock: 15, category: 'Makanan' },
  { id: '5', name: 'Es Teh Manis', price: 5000, cost: 1000, stock: 100, category: 'Minuman' },
];
