
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Product, AppState, ProductImage } from '../types';
import { Repository } from '../lib/repository';
import { getDiscountedUSD, getARS, formatCurrency } from '../lib/pricing';

export const ProductDetailPage: React.FC<{ appState: AppState }> = ({ appState }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [reserving, setReserving] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      if (!id) return;
      const data = await Repository.getProductById(id);
      const imgs = await Repository.getProductImages(id);
      setProduct(data);
      setImages(imgs);
      setLoading(false);
    };
    fetch();
  }, [id]);

  const handleReserve = async () => {
    if (!product) return;
    setReserving(true);
    try {
      await Repository.createReservation(product.id, appState.user?.id || null);
      
      const discUsd = getDiscountedUSD(product.base_price_usd, discountPercent);
      const ars = getARS(discUsd, appState.blueRate);
      
      const message = `Hola! Quiero reservar: ${product.model} ${product.storage} ${product.color}. 
Precio: ${formatCurrency(discUsd, 'USD')} / ${formatCurrency(ars, 'ARS')}. 
Mi email: ${appState.user?.email || 'Visitante'}`;
      
      const whatsappUrl = `https://wa.me/${appState.whatsappNumber}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
      navigate('/');
    } catch (error) {
      alert("Hubo un error al crear la reserva.");
    } finally {
      setReserving(false);
    }
  };

  if (loading) return <div className="max-w-7xl mx-auto p-12 text-center">Cargando detalles...</div>;
  if (!product) return <div className="max-w-7xl mx-auto p-12 text-center">Producto no encontrado.</div>;

  const discountPercent = appState.viewingAsLevel 
    ? (appState.levelRules.find(r => r.level === appState.viewingAsLevel)?.discount_percent || 0)
    : (appState.levelRules.find(r => r.level === appState.user?.level)?.discount_percent || 0);

  const showPrices = appState.user !== null || appState.viewingAsLevel !== null;
  const discUsd = getDiscountedUSD(product.base_price_usd, discountPercent);
  const ars = getARS(discUsd, appState.blueRate);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 md:py-24">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
        {/* Gallery */}
        <div className="space-y-4">
          <div className="aspect-[4/5] bg-white rounded-[32px] overflow-hidden border border-gray-100 flex items-center justify-center">
            <img 
              src={`https://picsum.photos/seed/${product.id}/800/1000`} 
              alt={product.model}
              className="object-contain w-full h-full p-12"
            />
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2">
             {[...Array(3)].map((_, i) => (
                <div key={i} className="w-24 h-24 bg-gray-100 rounded-xl flex-shrink-0" />
             ))}
          </div>
        </div>

        {/* Info */}
        <div className="flex flex-col h-full">
          <div className="mb-8">
            <span className="text-xs font-bold tracking-widest text-blue-600 uppercase mb-2 block">
              {product.condition === 'sealed' ? 'Nuevo en Caja' : 'Reacondicionado Premium'}
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{product.model}</h1>
            <p className="text-xl text-gray-500 font-medium">{product.storage} • {product.color}</p>
          </div>

          <div className="bg-gray-50 rounded-3xl p-8 mb-8">
            {showPrices ? (
              <div className="flex items-baseline space-x-4 mb-4">
                <span className="text-5xl font-bold tracking-tight">{formatCurrency(discUsd, 'USD')}</span>
                <span className="text-lg text-gray-400">~ {formatCurrency(ars, 'ARS')}</span>
              </div>
            ) : (
              <div className="py-4 text-center border-2 border-dashed border-gray-200 rounded-2xl mb-4">
                <p className="text-sm font-bold text-gray-400">INGRESA PARA VER PRECIOS Y DESCUENTOS</p>
              </div>
            )}
            
            <p className="text-sm text-gray-600 leading-relaxed mb-6">
              {product.description || "Un equipo excepcional que combina potencia y diseño elegante. Listo para acompañarte en tu día a día."}
            </p>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex flex-col bg-white p-4 rounded-2xl border border-gray-100">
                <span className="text-gray-400 font-medium mb-1">Batería</span>
                <span className="font-bold">{product.battery_health ? `${product.battery_health}%` : 'N/A'}</span>
              </div>
              <div className="flex flex-col bg-white p-4 rounded-2xl border border-gray-100">
                <span className="text-gray-400 font-medium mb-1">Garantía</span>
                <span className="font-bold">{product.warranty_days} Días</span>
              </div>
              <div className="flex flex-col bg-white p-4 rounded-2xl border border-gray-100">
                <span className="text-gray-400 font-medium mb-1">Accesorios</span>
                <span className="font-bold">{product.accessories || 'Solo equipo'}</span>
              </div>
              <div className="flex flex-col bg-white p-4 rounded-2xl border border-gray-100">
                <span className="text-gray-400 font-medium mb-1">Caja Original</span>
                <span className="font-bold">{product.box_included ? 'Sí' : 'No'}</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleReserve}
            disabled={reserving || product.status === 'reserved'}
            className="w-full bg-black text-white py-5 rounded-full font-bold text-lg hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-black/10"
          >
            {reserving ? 'Procesando...' : product.status === 'reserved' ? 'No disponible' : 'Reservar por WhatsApp'}
          </button>
          
          <p className="text-center text-xs text-gray-400 mt-6 font-medium">
            La reserva bloquea el equipo por 24 horas hábiles.
          </p>
        </div>
      </div>
    </div>
  );
};
