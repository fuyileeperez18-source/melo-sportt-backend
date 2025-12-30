import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Plus,
  Tag,
  Calendar,
  DollarSign,
  TrendingUp,
  Edit,
  Trash2,
  Copy,
  Percent,
} from 'lucide-react';

import { Button, IconButton } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

// Mock data - En el futuro se conectaría con el backend
const coupons = [
  // Aquí irían los cupones reales cuando se implemente el backend
];

export function AdminCoupons() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-black">Cupones</h1>
          <p className="text-gray-600">Crea y gestiona códigos de descuento</p>
        </div>
        <Button leftIcon={<Plus className="h-4 w-4" />}>
          Crear Cupón
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <Tag className="h-5 w-5 text-blue-600" />
            <p className="text-gray-600 text-sm font-medium">Total Cupones</p>
          </div>
          <p className="text-2xl font-bold text-black">0</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            <p className="text-gray-600 text-sm font-medium">Activos</p>
          </div>
          <p className="text-2xl font-bold text-green-600">0</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <Percent className="h-5 w-5 text-purple-600" />
            <p className="text-gray-600 text-sm font-medium">Usos Totales</p>
          </div>
          <p className="text-2xl font-bold text-black">0</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="h-5 w-5 text-red-600" />
            <p className="text-gray-600 text-sm font-medium">Descuento Total</p>
          </div>
          <p className="text-2xl font-bold text-black">$0</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar cupones..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 pl-10 pr-4 bg-white border border-gray-300 rounded-lg text-black placeholder-gray-500 focus:outline-none focus:border-black transition-colors"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['all', 'active', 'expired', 'scheduled'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize',
                statusFilter === status
                  ? 'bg-black text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:border-black'
              )}
            >
              {status === 'all' ? 'Todos' :
               status === 'active' ? 'Activos' :
               status === 'expired' ? 'Expirados' : 'Programados'}
            </button>
          ))}
        </div>
      </div>

      {/* Coupons List - Empty State */}
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
        <Tag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-black mb-2">No hay cupones disponibles</h3>
        <p className="text-gray-600 mb-6">
          Crea tu primer cupón de descuento para atraer más clientes.
        </p>
        <Button leftIcon={<Plus className="h-4 w-4" />}>
          Crear Primer Cupón
        </Button>
      </div>

      {/* Future: Coupon List
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr className="border-b border-gray-200">
                <th className="text-left py-4 px-6 text-sm font-semibold text-black">Código</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-black">Descuento</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-black">Usos</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-black">Validez</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-black">Estado</th>
                <th className="text-right py-4 px-6 text-sm font-semibold text-black">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((coupon) => (
                <tr key={coupon.id}>
                  // Coupon item
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      */}
    </div>
  );
}
