
import { createClient } from '@supabase/supabase-js';
import { 
  Profile, 
  Product, 
  ProductImage, 
  LevelRule, 
  Settings, 
  PointsTransaction, 
  Reservation 
} from '../types';

// Credenciales de la instancia proporcionada
const supabaseUrl = 'https://osgknmskwiyzcqrnjvwi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zZ2tubXNrd2l5emNxcm5qdndpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY4OTIzNjAsImV4cCI6MjA4MjQ2ODM2MH0.WMBGN2QXFoHx5WIHGN-NaeTnPGSr1Mm07XWEIYS3Cuc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const Repository = {
  isConfigured(): boolean {
    return !!supabaseUrl && !!supabaseAnonKey;
  },

  // --- AUTH ---
  async signInWithEmail(email: string) {
    return await supabase.auth.signInWithOtp({ 
      email,
      options: {
        emailRedirectTo: window.location.origin,
      }
    });
  },

  async getSession() {
    return await supabase.auth.getSession();
  },

  async signOut() {
    return await supabase.auth.signOut();
  },

  // --- PROFILES ---
  async getMyProfile(): Promise<Profile | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error || !data) {
      // Si el usuario existe en Auth pero no en Profiles (ej: creado manualmente en Dashboard), lo creamos.
      const { data: newProfile } = await supabase.from('profiles').insert({
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0],
        points: 0,
        level: 1,
        role: 'user'
      }).select().single();
      return newProfile as Profile;
    }
    return data as Profile;
  },

  async getAllProfiles(): Promise<Profile[]> {
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    return (data || []) as Profile[];
  },

  // --- PRODUCTS ---
  async getProducts(): Promise<Product[]> {
    const { data } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    return (data || []) as Product[];
  },

  async getProductById(id: string): Promise<Product | null> {
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
    return data as Product;
  },

  async getProductImages(productId: string): Promise<ProductImage[]> {
    const { data } = await supabase
      .from('product_images')
      .select('*')
      .eq('product_id', productId);
    return (data || []) as ProductImage[];
  },

  async saveProduct(product: Partial<Product>, images: string[]) {
    const isNew = !product.id;
    const cleanProduct = { ...product };
    delete (cleanProduct as any).created_at;
    delete (cleanProduct as any).updated_at;

    const { data, error } = isNew 
      ? await supabase.from('products').insert(cleanProduct).select().single()
      : await supabase.from('products').update(cleanProduct).eq('id', product.id).select().single();

    if (error) throw error;

    if (images.length > 0) {
      await supabase.from('product_images').delete().eq('product_id', data.id);
      await supabase.from('product_images').insert(
        images.map(url => ({ product_id: data.id, image_url: url }))
      );
    }

    return data;
  },

  // --- SETTINGS & LEVELS ---
  async getSettings(): Promise<Settings> {
    const { data } = await supabase.from('settings').select('*');
    const settingsObj: any = {};
    data?.forEach(s => {
      settingsObj[s.key] = s.value;
    });
    return {
      blue_rate: parseFloat(settingsObj.blue_rate || '1300'),
      whatsapp_number: settingsObj.whatsapp_number || ''
    };
  },

  async updateSetting(key: string, value: string) {
    return await supabase.from('settings').upsert({ key, value });
  },

  async getLevelRules(): Promise<LevelRule[]> {
    const { data } = await supabase.from('level_rules').select('*').order('level', { ascending: true });
    return (data || []) as LevelRule[];
  },

  async updateLevelRule(rule: LevelRule) {
    return await supabase.from('level_rules').upsert(rule);
  },

  // --- TRANSACTIONS & RESERVATIONS ---
  async addPoints(userId: string, delta: number, reason: string, adminId: string) {
    const { error } = await supabase.from('points_transactions').insert({
      user_id: userId,
      delta_points: delta,
      reason,
      created_by: adminId
    });
    if (error) throw error;
  },

  async getMyTransactions(): Promise<PointsTransaction[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    const { data } = await supabase
      .from('points_transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    return (data || []) as PointsTransaction[];
  },

  async createReservation(productId: string, userId: string | null) {
    return await supabase.from('reservations').insert({
      product_id: productId,
      user_id: userId,
      status: 'pending'
    });
  },

  async getAllReservations() {
    const { data } = await supabase
      .from('reservations')
      .select('*, products(model, storage, color), profiles(email)')
      .order('created_at', { ascending: false });
    return data || [];
  }
};
