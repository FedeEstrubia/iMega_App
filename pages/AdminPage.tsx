
import React, { useState, useEffect } from 'react';
import { AppState, Product, Profile, LevelRule } from '../types';
import { Repository } from '../lib/repository';

export const AdminPage: React.FC<{ 
  appState: AppState, 
  refreshApp: () => void, 
  onOverride: (lvl: number | null) => void 
}> = ({ appState, refreshApp, onOverride }) => {
  const [tab, setTab] = useState<'products' | 'users' | 'settings'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProductForm, setShowProductForm] = useState(false);

  // Form state for new/edit product
  const [formProduct, setFormProduct] = useState<Partial<Product>>({
    model: 'iPhone ',
    storage: '128GB',
    color: 'Negro',
    condition: 'used',
    base_price_usd: 0,
    status: 'available',
    warranty_days: 90,
    box_included: true
  });

  const [editingBlueRate, setEditingBlueRate] = useState(appState.blueRate.toString());
  const [editingWA, setEditingWA] = useState(appState.whatsappNumber);

  const fetchData = async () => {
    setLoading(true);
    const [p, u] = await Promise.all([Repository.getProducts(), Repository.getAllProfiles()]);
    setProducts(p);
    setUsers(u);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [tab]);

  const handleUpdateSettings = async () => {
    await Repository.updateSetting('blue_rate', editingBlueRate);
    await Repository.updateSetting('whatsapp_number', editingWA);
    alert('Ajustes guardados');
    refreshApp();
  };

  const handleAddPoints = async (userId: string, points: number) => {
    const reason = prompt('Razón de los puntos:');
    if (!reason) return;
    try {
      await Repository.addPoints(userId, points, reason, appState.user!.id);
      alert('Puntos impactados exitosamente');
      fetchData();
      refreshApp();
    } catch (e) {
      alert('Error al agregar puntos');
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await Repository.saveProduct(formProduct, []);
      setShowProductForm(false);
      fetchData();
      alert('Producto guardado');
    } catch (error) {
      alert('Error al guardar producto');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <div>
          <h1 className="text-3xl font-bold">Panel Administrativo</h1>
          <p className="text-gray-400 text-sm mt-1">Gestiona el inventario, usuarios y cotización.</p>
        </div>
        
        <div className="flex bg-gray-100 p-1 rounded-2xl">
          <button onClick={() => setTab('products')} className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${tab === 'products' ? 'bg-white shadow-sm' : 'text-gray-500'}`}>Equipos</button>
          <button onClick={() => setTab('users')} className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${tab === 'users' ? 'bg-white shadow-sm' : 'text-gray-500'}`}>Usuarios</button>
          <button onClick={() => setTab('settings')} className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${tab === 'settings' ? 'bg-white shadow-sm' : 'text-gray-500'}`}>Global</button>
        </div>

        <div className="flex items-center space-x-2 bg-blue-50 px-4 py-2 rounded-xl border border-blue-100">
          <span className="text-[10px] font-bold text-blue-600 uppercase">Simular Nivel:</span>
          <select 
            className="bg-transparent border-none text-xs font-bold text-blue-700 focus:ring-0"
            onChange={e => onOverride(e.target.value ? parseInt(e.target.value) : null)}
          >
            <option value="">Mi perfil</option>
            {[1,2,3,4,5].map(l => <option key={l} value={l}>Nivel {l}</option>)}
          </select>
        </div>
      </div>

      {tab === 'products' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold">Catálogo Local</h3>
            <button 
              onClick={() => {
                setFormProduct({ model: 'iPhone ', storage: '128GB', color: 'Negro', condition: 'used', base_price_usd: 0, status: 'available', warranty_days: 90, box_included: true });
                setShowProductForm(true);
              }}
              className="bg-black text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-gray-800 transition-all"
            >
              + Agregar iPhone
            </button>
          </div>

          {showProductForm && (
            <div className="apple-card p-8 border-2 border-black/5 animate-in fade-in slide-in-from-top-4 duration-300">
              <form onSubmit={handleSaveProduct} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1 space-y-4">
                   <div>
                     <label className="text-xs font-bold text-gray-400 block mb-1">Modelo</label>
                     <input type="text" required value={formProduct.model} onChange={e => setFormProduct({...formProduct, model: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl" />
                   </div>
                   <div>
                     <label className="text-xs font-bold text-gray-400 block mb-1">Precio Base (USD)</label>
                     <input type="number" required value={formProduct.base_price_usd} onChange={e => setFormProduct({...formProduct, base_price_usd: parseFloat(e.target.value)})} className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl font-mono font-bold" />
                   </div>
                </div>
                <div className="md:col-span-1 space-y-4">
                   <div className="grid grid-cols-2 gap-4">
                     <div>
                       <label className="text-xs font-bold text-gray-400 block mb-1">Almacenamiento</label>
                       <input type="text" value={formProduct.storage} onChange={e => setFormProduct({...formProduct, storage: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl" />
                     </div>
                     <div>
                       <label className="text-xs font-bold text-gray-400 block mb-1">Color</label>
                       <input type="text" value={formProduct.color} onChange={e => setFormProduct({...formProduct, color: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl" />
                     </div>
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                     <div>
                       <label className="text-xs font-bold text-gray-400 block mb-1">Condición</label>
                       <select value={formProduct.condition} onChange={e => setFormProduct({...formProduct, condition: e.target.value as any})} className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl">
                         <option value="sealed">Sellado</option>
                         <option value="used">Usado</option>
                       </select>
                     </div>
                     <div>
                       <label className="text-xs font-bold text-gray-400 block mb-1">Batería %</label>
                       <input type="number" value={formProduct.battery_health || ''} onChange={e => setFormProduct({...formProduct, battery_health: parseInt(e.target.value)})} className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl" />
                     </div>
                   </div>
                </div>
                <div className="md:col-span-1 flex flex-col justify-end space-y-4">
                   <div className="flex items-center space-x-4">
                      <button type="button" onClick={() => setShowProductForm(false)} className="flex-1 bg-gray-100 py-3 rounded-xl font-bold">Cancelar</button>
                      <button type="submit" className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold">Guardar</button>
                   </div>
                </div>
              </form>
            </div>
          )}

          <div className="apple-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] tracking-widest font-bold">
                  <tr>
                    <th className="px-6 py-4">Equipo</th>
                    <th className="px-6 py-4">Estado</th>
                    <th className="px-6 py-4">Precio</th>
                    <th className="px-6 py-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {products.map(p => (
                    <tr key={p.id} className="hover:bg-gray-50/50">
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900">{p.model}</div>
                        <div className="text-xs text-gray-400">{p.storage} • {p.color} • {p.condition === 'sealed' ? 'Sellado' : 'Usado'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${p.status === 'available' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-gray-900">${p.base_price_usd}</td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => { setFormProduct(p); setShowProductForm(true); }}
                          className="text-blue-600 hover:text-blue-800 font-bold mr-4 text-xs"
                        >
                          EDITAR
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {tab === 'users' && (
        <div className="apple-card overflow-hidden">
           <div className="p-6 border-b border-gray-100 bg-gray-50/50">
             <h3 className="font-bold">Usuarios en la Plataforma</h3>
             <p className="text-xs text-gray-400">Los usuarios deben ser creados primero en Supabase Auth.</p>
           </div>
           <div className="overflow-x-auto">
             <table className="w-full text-left text-sm">
               <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] tracking-widest font-bold">
                 <tr>
                   <th className="px-6 py-4">Email</th>
                   <th className="px-6 py-4 text-center">Nivel</th>
                   <th className="px-6 py-4">Puntos</th>
                   <th className="px-6 py-4 text-right">Ajustar Puntos</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-gray-100">
                 {users.map(u => (
                   <tr key={u.id}>
                     <td className="px-6 py-4">
                       <div className="font-semibold text-gray-900">{u.email}</div>
                       <div className="text-[10px] text-gray-400 font-bold uppercase">{u.role}</div>
                     </td>
                     <td className="px-6 py-4 text-center">
                        <span className="bg-black text-white px-2.5 py-1 rounded-lg font-black text-xs">
                          {u.level}
                        </span>
                     </td>
                     <td className="px-6 py-4 font-mono font-bold text-gray-700">{u.points} pts</td>
                     <td className="px-6 py-4 text-right space-x-2">
                       <button onClick={() => handleAddPoints(u.id, 100)} className="bg-green-50 text-green-700 px-3 py-1 rounded-lg text-xs font-black border border-green-100 hover:bg-green-100 transition-colors">+100</button>
                       <button onClick={() => handleAddPoints(u.id, 1000)} className="bg-green-600 text-white px-3 py-1 rounded-lg text-xs font-black hover:bg-green-700 transition-colors">+1K</button>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        </div>
      )}

      {tab === 'settings' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="apple-card p-8">
            <h3 className="font-bold text-xl mb-6">Valores del Mercado</h3>
            <div className="space-y-6">
              <div>
                <label className="text-xs font-bold text-gray-400 block mb-2 uppercase">Cotización Dólar Blue (ARS)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">$</span>
                  <input 
                    type="number" 
                    value={editingBlueRate} 
                    onChange={e => setEditingBlueRate(e.target.value)}
                    className="w-full pl-8 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-black text-2xl focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 block mb-2 uppercase">WhatsApp de Reservas</label>
                <input 
                  type="text" 
                  placeholder="Ej: 54911..."
                  value={editingWA} 
                  onChange={e => setEditingWA(e.target.value)}
                  className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>
              <button 
                onClick={handleUpdateSettings}
                className="w-full bg-black text-white py-5 rounded-2xl font-black text-lg hover:shadow-xl hover:shadow-black/10 transition-all active:scale-[0.98]"
              >
                Actualizar Globales
              </button>
            </div>
          </div>
          
          <div className="apple-card p-10 bg-[#1d1d1f] text-white">
             <div className="text-3xl mb-6"></div>
             <h3 className="text-xl font-bold mb-6">Reglas de Negocio</h3>
             <ul className="space-y-4 text-sm text-gray-400 font-medium">
               <li className="flex items-start">
                 <span className="text-blue-500 mr-2">●</span>
                 <span>Los precios se cargan en <b>USD base</b> y se muestran en <b>ARS</b> según la cotización blue cargada.</span>
               </li>
               <li className="flex items-start">
                 <span className="text-blue-500 mr-2">●</span>
                 <span>El descuento se aplica sobre el USD y se <b>redondea hacia arriba (CEIL)</b> para evitar centavos.</span>
               </li>
               <li className="flex items-start">
                 <span className="text-blue-500 mr-2">●</span>
                 <span>Los niveles de usuario se recalculan <b>automáticamente</b> en la DB al insertar transacciones de puntos.</span>
               </li>
               <li className="flex items-start">
                 <span className="text-blue-500 mr-2">●</span>
                 <span>Para que un usuario vea precios, su email debe estar en la tabla <b>profiles</b> con su ID de Auth correspondiente.</span>
               </li>
             </ul>
          </div>
        </div>
      )}
    </div>
  );
};
