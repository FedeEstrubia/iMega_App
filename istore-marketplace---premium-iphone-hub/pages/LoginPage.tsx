
import React, { useState } from 'react';
import { Repository } from '../lib/repository';

export const LoginPage: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const { error } = await Repository.signInWithEmail(email.trim());
      if (error) throw error;
      setMessage({ 
        type: 'success', 
        text: '¡Enviado! Revisa tu bandeja de entrada y haz clic en el botón de acceso. No cierres esta pestaña.' 
      });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Error al enviar el link.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-24">
      <div className="apple-card p-10 text-center animate-in fade-in zoom-in duration-500">
        <div className="text-5xl mb-8"></div>
        <h1 className="text-3xl font-bold mb-3 tracking-tight">Acceso Exclusivo</h1>
        <p className="text-gray-500 mb-10 leading-relaxed">
          Ingresa tu email para recibir un link de acceso seguro. No necesitas contraseña.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="nombre@ejemplo.com"
            required
            className="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:outline-none focus:ring-4 focus:ring-black/5 transition-all text-center font-medium"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-5 rounded-2xl font-bold hover:bg-gray-800 transition-all disabled:opacity-50 active:scale-[0.98] shadow-lg shadow-black/10"
          >
            {loading ? 'Preparando link...' : 'Enviar Link Mágico'}
          </button>
        </form>

        {message && (
          <div className={`mt-8 p-6 rounded-2xl text-sm leading-relaxed ${
            message.type === 'success' 
              ? 'bg-blue-50 text-blue-800 border border-blue-100' 
              : 'bg-red-50 text-red-700 border border-red-100'
          }`}>
            <p className="font-bold mb-1">{message.type === 'success' ? '📩 ¡Casi listo!' : '❌ Error'}</p>
            {message.text}
          </div>
        )}

        <div className="mt-12 pt-8 border-t border-gray-100">
          <p className="text-[11px] text-gray-400 uppercase font-black tracking-widest mb-4">¿Primera vez?</p>
          <p className="text-xs text-gray-500 px-4">
            Solo las cuentas autorizadas por administración pueden ver precios y realizar reservas.
          </p>
        </div>
      </div>
    </div>
  );
};
