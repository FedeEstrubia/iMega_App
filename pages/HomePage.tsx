
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Product, AppState } from '../types';
import { Repository } from '../lib/repository';
import { getDiscountedUSD, getARS, formatCurrency } from '../lib/pricing';

export const HomePage: React.FC<{ appState: AppState }> = ({ appState }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ model: '', condition: '', status: 'available' });

  useEffect(() => {
    const fetch = async () => {
      const data = await Repository.getProducts();
      setProducts(data);
      setLoading(false);
    };
    fetch();
  }, []);

  const filteredProducts = products.filter(p => {
    const matchModel = p.model.toLowerCase().includes(filter.model.toLowerCase());
    const matchCondition = !filter.condition || p.condition === filter.condition;
    const matchStatus = !filter.status || p.status === filter.status;
    return matchModel && matchCondition && matchStatus;
  });

  const getEffectiveDiscount = () => {
    if (appState.viewingAsLevel) {
      const rule = appState.levelRules.find(r => r.level === appState.viewingAsLevel);
      return rule?.discount_percent || 0;
    }
    if (appState.user) {
      const rule = appState.levelRules.find(r => r.level === appState.user?.level);
      return rule?.discount_percent || 0;
    }
    return 0;
  };

  const discountPercent = getEffectiveDiscount();
  const showPrices = appState.user !== null || appState.viewingAsLevel !== null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <header className="mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">iPhone. Simplemente perfecto.</h1>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto">
          Explora nuestra selección curada de dispositivos nuevos y reacondicionados con garantía oficial.
        </p>
      </header>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-8 justify-center">
        <input 
          type="text" 
          placeholder="Buscar modelo..." 
          className="px-4 py-2 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5 w-full max-w-xs"
          value={filter.model}
          onChange={e => setFilter({ ...filter, model: e.target.value })}
        />
        <select 
          className="px-4 py-2 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5 bg-white text-sm"
          value={filter.condition}
          onChange={e => setFilter({ ...filter, condition: e.target.value })}
        >
          <option value="">Cualquier condición</option>
          <option value="sealed">Sellado</option>
          <option value="used">Reacondicionado</option>
        </select>
        <select 
          className="px-4 py-2 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5 bg-white text-sm"
          value={filter.status}
          onChange={e => setFilter({ ...filter, status: e.target.value })}
        >
          <option value="available">Disponible</option>
          <option value="reserved">Reservado</option>
          <option value="">Todos</option>
        </select>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="apple-card h-80 animate-pulse bg-gray-50 rounded-[24px]"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredProducts.map(product => {
            const discUsd = getDiscountedUSD(product.base_price_usd, discountPercent);
            const ars = getARS(discUsd, appState.blueRate);

            return (
              <Link key={product.id} to={`/product/${product.id}`} className="apple-card group p-6 flex flex-col">
                <div className="aspect-square bg-gray-50 rounded-2xl mb-6 overflow-hidden flex items-center justify-center relative">
                  <img 
                    src={`https://picsum.photos/seed/${product.id}/400/400`} 
                    alt={product.model}
                    className="object-contain group-hover:scale-110 transition-transform duration-500 p-8"
                  />
                  {product.condition === 'sealed' && (
                    <span className="absolute top-4 right-4 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-widest">Sellado</span>
                  )}
                  {product.status === 'reserved' && (
                    <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                      <span className="bg-gray-800 text-white text-xs font-bold px-4 py-2 rounded-full">RESERVADO</span>
                    </div>
                  )}
                </div>
                
                <h3 className="text-xl font-semibold mb-1">{product.model}</h3>
                <p className="text-sm text-gray-500 mb-4">{product.storage} • {product.color}</p>
                
                <div className="mt-auto">
                  {showPrices ? (
                    <div className="flex flex-col">
                      <span className="text-2xl font-bold">{formatCurrency(discUsd, 'USD')}</span>
                      <span className="text-sm text-gray-400 font-medium">~ {formatCurrency(ars, 'ARS')}</span>
                    </div>
                  ) : (
                    <div className="py-2 px-4 bg-gray-100 rounded-lg text-center">
                      <span className="text-xs font-bold text-gray-400">LOGUEATE PARA VER PRECIO</span>
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
      
      {!loading && filteredProducts.length === 0 && (
        <div className="text-center py-24">
          <p className="text-gray-400 text-lg italic">No encontramos productos que coincidan con tu búsqueda.</p>
        </div>
      )}
    </div>
  );
};
