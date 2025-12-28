
import React, { useState, useEffect } from 'react';
import { AppState, PointsTransaction } from '../types';
import { Repository } from '../lib/repository';

export const AccountPage: React.FC<{ appState: AppState, refreshUser: () => void }> = ({ appState, refreshUser }) => {
  const [history, setHistory] = useState<PointsTransaction[]>([]);
  const user = appState.user!;
  
  const currentLevelRule = appState.levelRules.find(r => r.level === user.level);
  const nextLevelRule = appState.levelRules.find(r => r.level === user.level + 1);
  
  const pointsToNext = nextLevelRule ? nextLevelRule.min_points - user.points : 0;
  const progressPercent = nextLevelRule 
    ? Math.min(100, (user.points / nextLevelRule.min_points) * 100)
    : 100;

  useEffect(() => {
    const fetch = async () => {
      const data = await Repository.getMyTransactions();
      setHistory(data);
    };
    fetch();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <header className="mb-12">
        <h1 className="text-4xl font-bold mb-2">Hola, {user.full_name || 'Usuario'}</h1>
        <p className="text-gray-500">{user.email}</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="apple-card p-8 text-center md:col-span-1">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 block">Tu Nivel</span>
          <div className="text-6xl font-black mb-4">{user.level}</div>
          <span className="text-sm font-bold bg-black text-white px-3 py-1 rounded-full">
            {currentLevelRule?.discount_percent}% de descuento
          </span>
        </div>

        <div className="apple-card p-8 md:col-span-2">
          <div className="flex justify-between items-end mb-4">
            <div>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 block">Tus Puntos</span>
              <div className="text-4xl font-bold">{user.points} pts</div>
            </div>
            {nextLevelRule && (
              <div className="text-right">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 block">Próximo Nivel</span>
                <span className="text-sm font-bold text-blue-600">Faltan {pointsToNext} pts</span>
              </div>
            )}
          </div>
          
          <div className="h-4 bg-gray-100 rounded-full overflow-hidden mb-4">
            <div 
              className="h-full bg-black transition-all duration-1000 ease-out" 
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          
          <p className="text-sm text-gray-500 italic">
            "{currentLevelRule?.benefits_text}"
          </p>
        </div>
      </div>

      <div className="apple-card overflow-hidden">
        <div className="p-8 border-b border-gray-100">
          <h2 className="text-xl font-bold">Historial de Puntos</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {history.length > 0 ? (
            history.map(t => (
              <div key={t.id} className="p-6 flex justify-between items-center">
                <div>
                  <p className="font-semibold">{t.reason}</p>
                  <p className="text-xs text-gray-400">{new Date(t.created_at).toLocaleDateString()}</p>
                </div>
                <div className={`font-bold ${t.delta_points > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {t.delta_points > 0 ? '+' : ''}{t.delta_points}
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center text-gray-400 italic">
              No tienes transacciones aún.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
