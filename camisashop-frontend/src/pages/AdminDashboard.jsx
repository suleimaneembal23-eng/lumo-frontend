import React, { useEffect, useState } from "react";
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
      const res = await fetch("http://localhost:5000/api/auth/dashboard", {
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
      message.error("Falha de conexão com o servidor");
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
      message.warning("Sessão expirada. Faça login novamente.");
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
        <Title level={4} type="danger">Não foi possível carregar o dashboard</Title>
        <Button type="primary" onClick={fetchStats}>Tentar Novamente</Button>
      </div>
    )
  }

  // Cards de Estatísticas com Gradiente
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
        <Text type="secondary">Visão geral do desempenho da loja</Text>
      </div>

      <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Receita Total"
            value={stats.totalRevenue}
            prefix="€"
            icon={<EuroOutlined />}
            color1="#3b82f6"
            color2="#2563eb"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Pedidos"
            value={stats.totalOrders}
            icon={<ShoppingOutlined />}
            color1="#10b981"
            color2="#059669"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Produtos"
            value={stats.totalProducts}
            icon={<SkinOutlined />}
            color1="#f59e0b"
            color2="#d97706"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Clientes"
            value={stats.totalUsers}
            icon={<UsergroupAddOutlined />}
            color1="#8b5cf6"
            color2="#7c3aed"
          />
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <Card
            title={<Title level={4} style={{ margin: 0 }}>Desempenho de Vendas (30 Dias)</Title>}
            bordered={false}
            style={{ borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}
          >
            <div style={{ height: 350, marginTop: 20 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.revenueLast30Days}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={(value) => `€${value}`} />
                  <Tooltip
                    contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    formatter={(value) => [`€${value}`, 'Receita']}
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
                <LineChart data={stats.ordersLast30Days}>
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
    </div>
  );
};

export default AdminDashboard;
