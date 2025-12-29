import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  Settings,
  MessageSquare,
  Tag,
  Menu,
  X,
  Bell,
  Search,
  ChevronDown,
  LogOut,
  DollarSign,
  TrendingUp,
  Package as PackageIcon,
  AlertTriangle,
  Clock,
  RefreshCw,
} from 'lucide-react';

import { useAuthStore } from '@/stores/authStore';
import { cn, formatCurrency } from '@/lib/utils';
import { analyticsService } from '@/lib/services';
import { StatCard, MiniStat } from '@/components/admin/StatCard';
import { RevenueChart, OrdersChart, CategoryChart, MonthlyChart, GenderChart } from '@/components/admin/Charts';
import type { DashboardMetrics, Order, SalesOverview, CategoryRevenue, MonthlyRevenue, SalesByGender } from '@/types';

// Sidebar navigation
const sidebarItems = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Pedidos', href: '/admin/orders', icon: ShoppingCart, badge: 5 },
  { name: 'Productos', href: '/admin/products', icon: Package },
  { name: 'Clientes', href: '/admin/customers', icon: Users },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { name: 'Mensajes', href: '/admin/messages', icon: MessageSquare, badge: 3 },
  { name: 'Cupones', href: '/admin/coupons', icon: Tag },
  { name: 'Configuración', href: '/admin/settings', icon: Settings },
];

// Order status badge
function OrderStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700',
    confirmed: 'bg-blue-100 text-blue-700',
    processing: 'bg-purple-100 text-purple-700',
    shipped: 'bg-cyan-100 text-cyan-700',
    delivered: 'bg-emerald-100 text-emerald-700',
    cancelled: 'bg-red-100 text-red-700',
    refunded: 'bg-gray-100 text-gray-700',
  };

  const labels: Record<string, string> = {
    pending: 'Pendiente',
    confirmed: 'Confirmado',
    processing: 'Procesando',
    shipped: 'Enviado',
    delivered: 'Entregado',
    cancelled: 'Cancelado',
    refunded: 'Reembolsado',
  };

  return (
    <span className={cn('px-2.5 py-1 rounded-full text-xs font-medium capitalize', styles[status] || 'bg-gray-100 text-gray-700')}>
      {labels[status] || status}
    </span>
  );
}

// Sidebar component
function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const location = useLocation();
  const { signOut, user } = useAuthStore();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full w-64 bg-gradient-to-b from-gray-900 to-gray-950 border-r border-gray-800 flex flex-col',
          'lg:translate-x-0 lg:static',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-800">
          <Link to="/admin" className="flex items-center gap-2" onClick={onClose}>
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              MELO SPORTT
            </span>
            <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded">Admin</span>
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {sidebarItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
                  isActive
                    ? 'bg-white text-gray-900 shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className="flex-1 font-medium">{item.name}</span>
                {item.badge && (
                  <span className={cn(
                    'px-2 py-0.5 text-xs font-bold rounded-full',
                    isActive ? 'bg-gray-900 text-white' : 'bg-red-500 text-white'
                  )}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3 mb-3 px-4 py-2">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
              {user?.full_name?.[0] || user?.email?.[0] || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user?.full_name || 'Administrador'}
              </p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 w-full px-4 py-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium">Cerrar Sesión</span>
          </button>
        </div>
      </motion.aside>
    </>
  );
}

// Main Dashboard component
export function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const isMainDashboard = location.pathname === '/admin';

  // Real data state
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [salesOverview, setSalesOverview] = useState<SalesOverview[]>([]);
  const [ordersByStatus, setOrdersByStatus] = useState<{ status: string; count: number }[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [revenueByCategory, setRevenueByCategory] = useState<CategoryRevenue[]>([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState<MonthlyRevenue[]>([]);
  const [salesByGender, setSalesByGender] = useState<SalesByGender[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch real data
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [
        metricsData,
        salesData,
        ordersStatus,
        ordersData,
        productsData,
        categoriesData,
        monthlyData,
        genderData,
      ] = await Promise.all([
        analyticsService.getDashboardMetrics().catch(() => null),
        analyticsService.getSalesOverview(30).catch(() => []),
        analyticsService.getOrdersByStatus().catch(() => []),
        analyticsService.getRecentOrders(5).catch(() => []),
        analyticsService.getTopProducts(5).catch(() => []),
        analyticsService.getRevenueByCategory().catch(() => []),
        analyticsService.getMonthlyRevenue().catch(() => []),
        analyticsService.getSalesByGender().catch(() => []),
      ]);

      if (metricsData) setMetrics(metricsData);
      setSalesOverview(salesData);
      setOrdersByStatus(ordersStatus);
      setRecentOrders(ordersData);
      setTopProducts(productsData);
      setRevenueByCategory(categoriesData);
      setMonthlyRevenue(monthlyData);
      setSalesByGender(genderData);
    } catch (err) {
      setError('Error al cargar datos');
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Calculate total revenue from sales overview
  const totalRevenue = salesOverview.reduce((acc, item) => acc + (item.revenue || 0), 0);
  const totalOrders = salesOverview.reduce((acc, item) => acc + (item.orders || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Menu className="h-5 w-5 text-gray-600" />
            </button>
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar productos, pedidos..."
                className="w-72 h-10 pl-10 pr-4 bg-gray-100 border-none rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
              disabled={loading}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-5 w-5 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <Bell className="h-5 w-5 text-gray-600" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
            </button>
            <div className="h-8 w-px bg-gray-200" />
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                A
              </div>
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </div>
          </div>
        </header>

        {/* Content */}
        {isMainDashboard ? (
          <main className="flex-1 p-6 overflow-y-auto">
            {loading && !metrics ? (
              <div className="flex items-center justify-center h-96">
                <div className="text-center">
                  <RefreshCw className="h-8 w-8 animate-spin text-indigo-600 mx-auto mb-4" />
                  <p className="text-gray-500">Cargando estadísticas...</p>
                </div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-96">
                <div className="text-center">
                  <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
                  <p className="text-gray-700 font-medium mb-2">{error}</p>
                  <button
                    onClick={fetchData}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Reintentar
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Page title */}
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-gray-500">Bienvenido de nuevo. Aquí están tus estadísticas en tiempo real.</p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="h-4 w-4" />
                    Última actualización: {new Date().toLocaleTimeString('es-CO')}
                  </div>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <StatCard
                    title="Ingresos Hoy"
                    value={metrics?.today_revenue || 0}
                    change={metrics?.revenue_change}
                    icon={DollarSign}
                    iconColor="text-emerald-600"
                    iconBg="bg-emerald-100"
                    format="currency"
                    delay={0}
                  />
                  <StatCard
                    title="Pedidos Hoy"
                    value={metrics?.today_orders || 0}
                    change={metrics?.orders_change}
                    icon={ShoppingCart}
                    iconColor="text-blue-600"
                    iconBg="bg-blue-100"
                    delay={0.1}
                  />
                  <StatCard
                    title="Pedidos Pendientes"
                    value={metrics?.pending_orders || 0}
                    icon={Clock}
                    iconColor="text-amber-600"
                    iconBg="bg-amber-100"
                    delay={0.2}
                  />
                  <StatCard
                    title="Stock Bajo"
                    value={metrics?.low_stock_products || 0}
                    icon={AlertTriangle}
                    iconColor="text-orange-600"
                    iconBg="bg-orange-100"
                    delay={0.3}
                  />
                </div>

                {/* Mini stats row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  <MiniStat
                    title="Ingresos Totales"
                    value={formatCurrency(totalRevenue)}
                    icon={DollarSign}
                    color="green"
                  />
                  <MiniStat
                    title="Total Pedidos"
                    value={totalOrders}
                    icon={ShoppingCart}
                    color="blue"
                  />
                  <MiniStat
                    title="Nuevos Clientes"
                    value={metrics?.new_customers_today || 0}
                    icon={Users}
                    color="purple"
                  />
                  <MiniStat
                    title="Productos Activos"
                    value={topProducts.length}
                    icon={PackageIcon}
                    color="pink"
                  />
                </div>

                {/* Charts row */}
                <div className="grid lg:grid-cols-3 gap-6 mb-8">
                  <div className="lg:col-span-2">
                    <RevenueChart
                      data={salesOverview.map(item => ({
                        date: item.date,
                        revenue: item.revenue,
                        orders: item.orders,
                      }))}
                      title="Ingresos de los últimos 30 días"
                    />
                  </div>
                  <OrdersChart data={ordersByStatus} />
                </div>

                {/* Category and Gender charts */}
                <div className="grid lg:grid-cols-2 gap-6 mb-8">
                  <CategoryChart data={revenueByCategory} />
                  <GenderChart data={salesByGender} />
                </div>

                {/* Monthly Revenue */}
                {monthlyRevenue.length > 0 && (
                  <div className="mb-8">
                    <MonthlyChart data={monthlyRevenue} />
                  </div>
                )}

                {/* Tables row */}
                <div className="grid lg:grid-cols-2 gap-6 mb-8">
                  {/* Recent orders */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-lg font-semibold text-gray-900">Pedidos Recientes</h2>
                      <Link
                        to="/admin/orders"
                        className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1 font-medium"
                      >
                        Ver todos <TrendingUp className="h-4 w-4" />
                      </Link>
                    </div>
                    <div className="space-y-4">
                      {recentOrders.length > 0 ? recentOrders.map((order) => (
                        <div key={order.id} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium">
                              {order.user?.full_name?.[0] || order.user?.email?.[0] || 'C'}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {order.user?.full_name || 'Cliente'}
                              </p>
                              <p className="text-sm text-gray-500">{order.order_number}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-gray-900">{formatCurrency(order.total)}</p>
                            <OrderStatusBadge status={order.status} />
                          </div>
                        </div>
                      )) : (
                        <p className="text-center text-gray-500 py-8">No hay pedidos recientes</p>
                      )}
                    </div>
                  </motion.div>

                  {/* Top products */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-lg font-semibold text-gray-900">Productos Más Vendidos</h2>
                      <Link
                        to="/admin/products"
                        className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1 font-medium"
                      >
                        Ver todos <TrendingUp className="h-4 w-4" />
                      </Link>
                    </div>
                    <div className="space-y-4">
                      {topProducts.length > 0 ? topProducts.map((product, index) => (
                        <div key={product.id} className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                          <span className="text-gray-400 font-bold w-6">{index + 1}</span>
                          <img
                            src={product.images?.[0]?.url || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=100'}
                            alt={product.name}
                            className="w-12 h-12 rounded-xl object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">{product.name}</p>
                            <p className="text-sm text-gray-500">{product.total_sold || 0} vendidos</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-gray-900">{formatCurrency(product.total_revenue || 0)}</p>
                            <p className="text-xs text-gray-500">{formatCurrency(product.price)} c/u</p>
                          </div>
                        </div>
                      )) : (
                        <p className="text-center text-gray-500 py-8">No hay productos vendidos aún</p>
                      )}
                    </div>
                  </motion.div>
                </div>
              </>
            )}
          </main>
        ) : (
          <main className="flex-1 p-6 overflow-y-auto bg-gray-50">
            <Outlet />
          </main>
        )}
      </div>
    </div>
  );
}
