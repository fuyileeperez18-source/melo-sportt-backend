import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Download,
  Eye,
  Mail,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  ShoppingBag,
  DollarSign,
  User,
} from 'lucide-react';

import { Button, IconButton } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { formatCurrency, formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { userService } from '@/lib/services';
import toast from 'react-hot-toast';

interface Customer {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  created_at: string;
  role: string;
}

export function AdminCustomers() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    setIsLoading(true);
    try {
      const response = await userService.getAll();
      // Si response es un objeto con data, usar response.data, sino usar response directamente
      const data = Array.isArray(response) ? response : (response?.data || []);
      setCustomers(data);
    } catch (error) {
      console.error('Error loading customers:', error);
      toast.error('Error al cargar los clientes');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      customer.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || customer.role === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalCustomers = customers.length;
  const activeCustomers = customers.filter((c) => c.role !== 'inactive').length;

  const openCustomerDetail = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsDetailOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-black">Clientes</h1>
          <p className="text-gray-600">Gestiona tu base de clientes</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button leftIcon={<Download className="h-4 w-4" />} variant="outline">
            Exportar
          </Button>
          <Button leftIcon={<UserPlus className="h-4 w-4" />}>
            Agregar Cliente
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <p className="text-gray-600 text-sm font-medium">Total Clientes</p>
          <p className="text-2xl font-bold text-black mt-1">{totalCustomers}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <p className="text-gray-600 text-sm font-medium">Activos</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{activeCustomers}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <p className="text-gray-600 text-sm font-medium">Administradores</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">
            {customers.filter((c) => c.role === 'admin' || c.role === 'super_admin').length}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <p className="text-gray-600 text-sm font-medium">Usuarios</p>
          <p className="text-2xl font-bold text-purple-600 mt-1">
            {customers.filter((c) => c.role === 'user').length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar clientes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 pl-10 pr-4 bg-white border border-gray-300 rounded-lg text-black placeholder-gray-500 focus:outline-none focus:border-black transition-colors"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['all', 'user', 'admin'].map((status) => (
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
              {status === 'all' ? 'Todos' : status === 'admin' ? 'Administradores' : 'Usuarios'}
            </button>
          ))}
        </div>
      </div>

      {/* Table - Desktop */}
      <div className="hidden lg:block bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr className="border-b border-gray-200">
                <th className="text-left py-4 px-6 text-sm font-semibold text-black">Cliente</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-black">Email</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-black">Rol</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-black">Fecha de Registro</th>
                <th className="text-right py-4 px-6 text-sm font-semibold text-black">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((customer) => (
                  <motion.tr
                    key={customer.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-black font-medium">
                          {customer.full_name?.charAt(0).toUpperCase() || customer.email?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                          <p className="text-black font-medium">{customer.full_name || 'Sin nombre'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-gray-700">{customer.email}</td>
                    <td className="py-4 px-6">
                      <span className={cn(
                        'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize',
                        customer.role === 'admin' || customer.role === 'super_admin'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-green-100 text-green-800'
                      )}>
                        {customer.role === 'super_admin' ? 'Super Admin' : customer.role}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-gray-600 text-sm">
                      {formatDate(customer.created_at, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-end gap-2">
                        <IconButton onClick={() => openCustomerDetail(customer)}>
                          <Eye className="h-4 w-4" />
                        </IconButton>
                        <IconButton>
                          <Mail className="h-4 w-4" />
                        </IconButton>
                        <IconButton>
                          <MoreVertical className="h-4 w-4" />
                        </IconButton>
                      </div>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-12 text-center">
                    <User className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">No hay clientes disponibles</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cards - Mobile */}
      <div className="lg:hidden space-y-4">
        {filteredCustomers.length > 0 ? (
          filteredCustomers.map((customer) => (
            <motion.div
              key={customer.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-black font-medium">
                  {customer.full_name?.charAt(0).toUpperCase() || customer.email?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-black font-semibold truncate">{customer.full_name || 'Sin nombre'}</p>
                  <p className="text-gray-600 text-sm truncate">{customer.email}</p>
                  <span className={cn(
                    'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize mt-1',
                    customer.role === 'admin' || customer.role === 'super_admin'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-green-100 text-green-800'
                  )}>
                    {customer.role === 'super_admin' ? 'Super Admin' : customer.role}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => openCustomerDetail(customer)}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  leftIcon={<Eye className="h-4 w-4" />}
                >
                  Ver
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  leftIcon={<Mail className="h-4 w-4" />}
                >
                  Contactar
                </Button>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <User className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No hay clientes disponibles</p>
          </div>
        )}
      </div>

      {/* Customer Detail Modal */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title="Detalles del Cliente"
        size="lg"
      >
        {selectedCustomer && (
          <div className="space-y-6">
            {/* Profile */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-black text-2xl font-medium">
                {selectedCustomer.full_name?.charAt(0).toUpperCase() || selectedCustomer.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-black">{selectedCustomer.full_name || 'Sin nombre'}</h3>
                <p className="text-gray-600">{selectedCustomer.email}</p>
                <span className={cn(
                  'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize mt-1',
                  selectedCustomer.role === 'admin' || selectedCustomer.role === 'super_admin'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-green-100 text-green-800'
                )}>
                  {selectedCustomer.role === 'super_admin' ? 'Super Admin' : selectedCustomer.role}
                </span>
              </div>
            </div>

            {/* Stats - Placeholder */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-center">
                <ShoppingBag className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-black">0</p>
                <p className="text-gray-600 text-sm">Pedidos</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-center">
                <DollarSign className="h-6 w-6 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-black">{formatCurrency(0)}</p>
                <p className="text-gray-600 text-sm">Total Gastado</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-center col-span-2 sm:col-span-1">
                <DollarSign className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-black">{formatCurrency(0)}</p>
                <p className="text-gray-600 text-sm">Promedio</p>
              </div>
            </div>

            {/* Details */}
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Cliente desde</span>
                <span className="text-black font-medium">{formatDate(selectedCustomer.created_at)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Último pedido</span>
                <span className="text-black font-medium">N/A</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">ID</span>
                <span className="text-black font-mono text-sm">{selectedCustomer.id.slice(0, 8)}...</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="outline" className="flex-1" leftIcon={<Mail className="h-4 w-4" />}>
                Enviar Email
              </Button>
              <Button className="flex-1" leftIcon={<ShoppingBag className="h-4 w-4" />}>
                Ver Pedidos
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
