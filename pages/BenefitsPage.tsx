
import React from 'react';
import { LevelRule } from '../types';

export const BenefitsPage: React.FC<{ levelRules: LevelRule[] }> = ({ levelRules }) => {
  return (
    <div className="max-w-5xl mx-auto px-4 py-24 text-center">
      <header className="mb-20">
        <h1 className="text-5xl font-bold tracking-tight mb-6">Niveles de Lealtad</h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto">
          Cuanto más compras, más ahorras. Nuestra escala de beneficios está diseñada para premiar tu confianza.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {levelRules.map(rule => (
          <div key={rule.level} className="apple-card p-8 flex flex-col items-center">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center font-bold mb-4">
              {rule.level}
            </div>
            <h3 className="text-lg font-bold mb-1">Nivel {rule.level}</h3>
            <p className="text-sm text-gray-400 mb-6">{rule.min_points} pts mínimos</p>
            
            <div className="text-3xl font-bold mb-4 text-blue-600">
              {rule.discount_percent}%
              <span className="text-sm block text-gray-500 mt-1 font-medium">OFF</span>
            </div>
            
            <p className="text-xs text-gray-500 leading-relaxed italic">
              "{rule.benefits_text}"
            </p>
          </div>
        ))}
      </div>

      <div className="mt-20 p-10 bg-gray-50 rounded-[40px] text-left">
        <h2 className="text-2xl font-bold mb-6 text-center md:text-left">¿Cómo sumar puntos?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <h4 className="font-bold mb-2">1. Compras Directas</h4>
            <p className="text-sm text-gray-600">Cada USD invertido en equipos suma 1 punto a tu cuenta automáticamente tras la entrega.</p>
          </div>
          <div>
            <h4 className="font-bold mb-2">2. Recomienda Amigos</h4>
            <p className="text-sm text-gray-600">Si un amigo compra de tu parte, ambos reciben un bonus de 500 puntos para escalar de nivel.</p>
          </div>
          <div>
            <h4 className="font-bold mb-2">3. Plan Canje</h4>
            <p className="text-sm text-gray-600">Entregando tu equipo anterior sumas puntos adicionales proporcionales al valor del canje.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
