import { Product, Transaction, User } from '../../types';
import { MOCK_PRODUCTS, INITIAL_CATEGORIES } from '../constants';

const SCRIPT_URL_KEY = 'lumina_gscript_url';
// URL Default yang Anda berikan. Aplikasi akan menggunakan ini jika tidak ada setting manual.
export const DEFAULT_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzSfxDe8PxwW07GI7dJYWgzSn8WWQ9bx7js9XVH8FA8YDcU21JESet3RgqNuUXpUBAI/exec';

class GoogleSheetsService {
  private get scriptUrl() {
    // Cek LocalStorage dulu, jika kosong gunakan URL Default (Hardcoded)
    return localStorage.getItem(SCRIPT_URL_KEY) || DEFAULT_SCRIPT_URL;
  }

  // Generic helper for API calls
  private async callApi(action: string, payload: any = {}) {
    const url = this.scriptUrl;
    
    // --- SAFETY CHECK ---
    if (!url) {
      // Fallback ini jarang tereksekusi karena sekarang sudah ada DEFAULT_SCRIPT_URL
      if (action === 'login') {
         const isDefaultAdmin = payload.username === 'admin' && (payload.password === 'admin' || payload.password === '123');
         if (isDefaultAdmin) return { success: true, user: { username: 'admin', role: 'ADMIN' } };
         throw new Error('Database belum terhubung.');
      }
      return null;
    }

    // --- MODE ONLINE (Connected to Sheets) ---
    try {
      const response = await fetch(url, {
        method: 'POST',
        body: JSON.stringify({ action, ...payload })
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || 'Unknown error from spreadsheet');
      }
      return data;
    } catch (error) {
      console.error(`API Error (${action}):`, error);
      throw error;
    }
  }

  async testConnection(url: string): Promise<boolean> {
    try {
      const response = await fetch(url, {
        method: 'POST',
        body: JSON.stringify({ action: 'test' })
      });
      const data = await response.json();
      return data.success === true;
    } catch (e) {
      return false;
    }
  }

  // --- Auth ---
  async login(username: string, password: string): Promise<User> {
    const res = await this.callApi('login', { username, password });
    if (res && res.user) return res.user;
    throw new Error('Login gagal');
  }

  // --- Categories ---
  async getCategories(): Promise<string[]> {
    try {
      const res = await this.callApi('getCategories');
      return res && res.data ? res.data : INITIAL_CATEGORIES;
    } catch (e) {
      return INITIAL_CATEGORIES;
    }
  }

  async addCategory(category: string): Promise<void> {
    await this.callApi('addCategory', { category });
  }

  async deleteCategory(category: string): Promise<void> {
    await this.callApi('deleteCategory', { category });
  }

  // --- Products ---
  async getProducts(): Promise<Product[]> {
    try {
      const res = await this.callApi('getProducts');
      return res && res.data ? res.data : [];
    } catch (e) {
      console.warn("Failed to fetch products, using fallback if needed");
      return [];
    }
  }

  async saveProduct(product: Product): Promise<void> {
    await this.callApi('saveProduct', { product });
  }

  async deleteProduct(id: string): Promise<void> {
    await this.callApi('deleteProduct', { id });
  }

  async addProductsBulk(newProducts: Omit<Product, 'id'>[]): Promise<number> {
    const productsWithIds = newProducts.map(p => ({
      ...p,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 5)
    }));

    await this.callApi('addProductsBulk', { products: productsWithIds });
    return productsWithIds.length;
  }

  // --- Transactions ---
  async getTransactions(): Promise<Transaction[]> {
    try {
      const res = await this.callApi('getTransactions');
      return res && res.data ? res.data : [];
    } catch (e) {
      return [];
    }
  }

  async createTransaction(transaction: Transaction): Promise<void> {
    await this.callApi('createTransaction', { transaction });
  }

  async voidTransaction(id: string): Promise<boolean> {
    try {
      await this.callApi('updateTransactionStatus', { id, status: 'DIBATALKAN' });
      return true;
    } catch (e) {
      return false;
    }
  }

  async markAsPaid(id: string): Promise<boolean> {
    try {
      await this.callApi('updateTransactionStatus', { id, status: 'LUNAS' });
      return true;
    } catch (e) {
      return false;
    }
  }

  async migrateLocalToCloud(): Promise<any> {
    return { success: true, message: "Not applicable for Sheets" };
  }
  
  public get useFirebase() { return false; }
}

export const db = new GoogleSheetsService();