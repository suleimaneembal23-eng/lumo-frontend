import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Typography,
  Card,
  Row,
  Col,
  message,
  Spin,
  Statistic,
  Button
} from "antd";
import {
  EuroOutlined,
  ShoppingOutlined,
  SkinOutlined,
  UsergroupAddOutlined,
  ArrowUpOutlined,
  RocketOutlined, // Adicionado
} from "@ant-design/icons";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

const { Title, Text } = Typography;

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const token = localStorage.getItem("adminToken");

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(false);
      const res = await fetch(`/api/admin/dashboard-stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      } else {
        message.error("Erro ao verificar status do sistema.");
        setError(true);
      }
    } catch (err) {
      console.error(err);
      message.error("Falha de conexÃ£o com o servidor");
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchStats();
    } else {
      setLoading(false);
      setError(true);
      message.warning("SessÃ£o expirada. FaÃ§a login novamente.");
    }
  }, [token]);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "400px" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div style={{ textAlign: "center", marginTop: 50 }}>
        <Title level={4} type="danger">NÃ£o foi possÃ­vel carregar o dashboard</Title>
        <Button type="primary" onClick={fetchStats}>Tentar Novamente</Button>
      </div>
    )
  }

  // Cards de EstatÃ­sticas com Gradiente
  const StatCard = ({ title, value, icon, color1, color2, prefix }) => (
    <Card
      bordered={false}
      style={{
        background: `linear-gradient(135deg, ${color1} 0%, ${color2} 100%)`,
        borderRadius: 12,
        color: "#fff",
        boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
        height: "100%",
      }}
      bodyStyle={{ padding: "24px" }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 14, textTransform: "uppercase", letterSpacing: "1px" }}>
            {title}
          </Text>
          <div style={{ fontSize: 32, fontWeight: "bold", marginTop: 8 }}>
            {prefix} {typeof value === 'number' ? value.toLocaleString() : value}
          </div>
        </div>
        <div style={{
          background: "rgba(255,255,255,0.2)",
          borderRadius: "50%",
          padding: 12,
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}>
          {React.cloneElement(icon, { style: { fontSize: 24, color: "#fff" } })}
        </div>
      </div>
    </Card>
  );

  return (
    <div style={{ paddingBottom: 40 }}>
      <div style={{ marginBottom: 30 }}>
        <Title level={2} style={{ marginBottom: 0 }}>Dashboard</Title>
        <Text type="secondary">VisÃ£o geral do desempenho da loja</Text>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Receita */}
        <div className="group relative overflow-hidden rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 hover:shadow-xl transition-all duration-300">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <EuroOutlined style={{ fontSize: 100, color: '#3b82f6' }} />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
                <EuroOutlined style={{ fontSize: 24 }} />
              </div>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Receita Total</span>
            </div>
            <h3 className="text-3xl font-extrabold text-slate-800 m-0 tracking-tight">
              {typeof stats.totalRevenue === 'number' ? Math.round(stats.totalRevenue).toLocaleString('de-DE') : stats.totalRevenue} FCFA
            </h3>
            {stats.monthlyRevenue && stats.monthlyRevenue.length >= 2 && (() => {
              const currentMonth = stats.monthlyRevenue[stats.monthlyRevenue.length - 1];
              const previousMonth = stats.monthlyRevenue[stats.monthlyRevenue.length - 2];
              const growth = previousMonth.revenue > 0
                ? (((currentMonth.revenue - previousMonth.revenue) / previousMonth.revenue) * 100).toFixed(1)
                : 0;
              const isPositive = growth > 0;

              return (
                <p className={`text-sm font-medium mt-2 flex items-center gap-1 ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                  <RocketOutlined /> {isPositive ? '+' : ''}{growth}% este mÃªs
                </p>
              );
            })()}
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500" />
        </div>

        {/* Pedidos */}
        <div className="group relative overflow-hidden rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 hover:shadow-xl transition-all duration-300">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <ShoppingOutlined style={{ fontSize: 100, color: '#10b981' }} />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600">
                <ShoppingOutlined style={{ fontSize: 24 }} />
              </div>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Pedidos</span>
            </div>
            <h3 className="text-3xl font-extrabold text-slate-800 m-0 tracking-tight">
              {stats.totalOrders}
            </h3>
            <p className="text-sm text-gray-400 mt-2 font-medium">Novos pedidos</p>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500" />
        </div>

        {/* Produtos */}
        <div className="group relative overflow-hidden rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 hover:shadow-xl transition-all duration-300">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <SkinOutlined style={{ fontSize: 100, color: '#f59e0b' }} />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-amber-50 rounded-2xl text-amber-600">
                <SkinOutlined style={{ fontSize: 24 }} />
              </div>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Produtos</span>
            </div>
            <h3 className="text-3xl font-extrabold text-slate-800 m-0 tracking-tight">
              {stats.totalProducts}
            </h3>
            <p className="text-sm text-gray-400 mt-2 font-medium">No catÃ¡logo</p>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500" />
        </div>

        {/* Clientes */}
        <div className="group relative overflow-hidden rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 hover:shadow-xl transition-all duration-300">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <UsergroupAddOutlined style={{ fontSize: 100, color: '#8b5cf6' }} />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-violet-50 rounded-2xl text-violet-600">
                <UsergroupAddOutlined style={{ fontSize: 24 }} />
              </div>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Clientes</span>
            </div>
            <h3 className="text-3xl font-extrabold text-slate-800 m-0 tracking-tight">
              {stats.totalUsers}
            </h3>
            <p className="text-sm text-gray-400 mt-2 font-medium">Registrados</p>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 to-purple-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500" />
        </div>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <Card
            title={<Title level={4} style={{ margin: 0 }}>Desempenho de Vendas (30 Dias)</Title>}
            bordered={false}
            style={{ borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}
          >
            <div style={{ height: 350, marginTop: 20 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.revenueLast30Days || []}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={(value) => `${Math.round(value).toLocaleString('de-DE')}`} />
                  <Tooltip
                    contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    formatter={(value) => [`${Math.round(value).toLocaleString('de-DE')} FCFA`, 'Receita']}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorValue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card
            title={<Title level={4} style={{ margin: 0 }}>Volume de Pedidos</Title>}
            bordered={false}
            style={{ borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.05)", height: '100%' }}
          >
            <div style={{ height: 350, marginTop: 20 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.ordersLast30Days || []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#9ca3af' }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ r: 4, fill: "#10b981", strokeWidth: 2, stroke: "#fff" }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
      </Row>

      {/* MONTHLY SALES HISTORY */}
      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col xs={24}>
          <Card
            title={<Title level={4} style={{ margin: 0 }}>ðŸ“Š HistÃ³rico de Vendas Mensais</Title>}
            bordered={false}
            style={{ borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}
          >
            {stats.monthlyRevenue && stats.monthlyRevenue.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="text-left py-3 px-4 text-gray-600 font-semibold">MÃªs</th>
                      <th className="text-right py-3 px-4 text-gray-600 font-semibold">Pedidos</th>
                      <th className="text-right py-3 px-4 text-gray-600 font-semibold">Faturamento</th>
                      <th className="text-right py-3 px-4 text-gray-600 font-semibold">MÃ©dia/Pedido</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.monthlyRevenue.map((month, index) => {
                      const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
                      const monthLabel = `${monthNames[month._id.month - 1]} ${month._id.year}`;
                      const avgPerOrder = month.orders > 0 ? (month.revenue / month.orders).toFixed(2) : 0;

                      return (
                        <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-4 font-medium text-gray-900">{monthLabel}</td>
                          <td className="text-right py-3 px-4 text-gray-700">{month.orders}</td>
                          <td className="text-right py-3 px-4 font-bold text-blue-600">{Math.round(month.revenue).toLocaleString('de-DE')} FCFA</td>
                          <td className="text-right py-3 px-4 text-gray-600">{Math.round(month.revenue / month.orders).toLocaleString('de-DE')} FCFA</td>
                        </tr>
                      );
                    })}
                    <tr className="bg-blue-50 font-bold">
                      <td className="py-4 px-4 text-gray-900">TOTAL GERAL</td>
                      <td className="text-right py-4 px-4 text-gray-900">
                        {stats.monthlyRevenue.reduce((sum, m) => sum + m.orders, 0)}
                      </td>
                      <td className="text-right py-4 px-4 text-blue-700 text-lg">
                        {Math.round(stats.totalRevenue).toLocaleString('de-DE')} FCFA
                      </td>
                      <td className="text-right py-4 px-4 text-gray-700">
                        {Math.round(stats.totalRevenue / stats.monthlyRevenue.reduce((sum, m) => sum + m.orders, 0)).toLocaleString('de-DE')} FCFA
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <p>Nenhum dado de vendas disponÃ­vel ainda.</p>
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminDashboard;
