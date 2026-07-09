import React, { useEffect, useState, useContext } from 'react';
import { Card, Statistic, Row, Col, Typography, Spin, Table, Tag } from 'antd';
import {
    DollarOutlined,
    ShoppingOutlined,
    ShoppingCartOutlined,
    RiseOutlined
} from '@ant-design/icons';
import { AuthContext } from '../../context/Authcontext';

const { Title, Text } = Typography;

const VendorDashboard = () => {
    const { user } = useContext(AuthContext);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalSales: 0,
        totalOrders: 0,
        totalProducts: 0,
        recentOrders: []
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // 1. Meus Produtos (para contar total)
                const resProducts = await fetch("/api/products/vendor", {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
                const products = await resProducts.json();

                // 2. Minhas Vendas
                // NOTA: Idealmente teríamos rota /api/orders/vendor-earnings. 
                // Por enquando vou buscar e filtrar no front se a rota /vendor retornar tudo.
                // Vou assumir que o backend filtra ou vou filtrar aqui.
                const resOrders = await fetch("/api/orders/vendor", {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
                const orders = await resOrders.json();

                // 3. �x�� CALCULAR SALDO REAL (Iterar sobre itens)
                let totalEarnings = 0;
                let mySalesCount = 0;

                // Segurança: Caso o backend retorne erro ou não array
                if (Array.isArray(orders)) {
                    orders.forEach(order => {
                        if (order.items) {
                            order.items.forEach(item => {
                                // Verifica se o item tem vendorNet (nova estrutura)
                                // Se tiver, soma. Se não tiver (pedidos antigos), ignora ou usa lógica antiga.
                                if (item.vendorNet) {
                                    totalEarnings += item.vendorNet;
                                }
                            });
                        }
                    });
                    mySalesCount = orders.length; // Ou soma quantidade de itens
                }

                setStats({
                    totalSales: totalEarnings, // �x� Saldo Líquido Real!
                    totalOrders: mySalesCount,
                    totalProducts: products.length || 0,
                    recentOrders: Array.isArray(orders) ? orders.slice(0, 5) : []
                });

            } catch (error) {
                console.error("Error loading stats:", error);
            } finally {
                setLoading(false);
            }
        };

        if (user) fetchStats();
    }, [user]);

    if (loading) return <div className="flex h-64 items-center justify-center"><Spin size="large" /></div>;

    return (
        <div>
            <div className="mb-6">
                <Title level={2}>Olá, {user?.name.split(' ')[0]} �x9</Title>
                <Text type="secondary">Aqui está o resumo da sua loja <strong>{user?.vendorInfo?.storeName}</strong></Text>
            </div>

            <Row gutter={[16, 16]} className="mb-8">
                <Col xs={24} sm={8}>
                    <Card bordered={false} className="shadow-sm rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 text-white">
                        <Statistic
                            title={<span className="text-green-100 font-medium">Saldo Disponível (Líquido)</span>}
                            value={Math.round(stats.totalSales).toLocaleString('de-DE')}
                            suffix="FCFA"
                            valueStyle={{ color: 'white', fontWeight: 'bold', fontSize: '1.6rem' }}
                        />
                        <DollarOutlined className="absolute right-4 top-4 text-green-200 opacity-40 text-6xl" />
                        <div className="mt-2 text-xs text-green-100 bg-white/20 inline-block px-2 py-1 rounded">
                            {user?.vendorInfo?.subscription?.isActive ? "�x} Taxa Semestral (0%)" : "�x0 Taxas Aplicadas (10% + 500 FCFA)"}
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card bordered={false} className="shadow-sm rounded-2xl">
                        <Statistic
                            title="Pedidos Recebidos"
                            value={stats.totalOrders}
                            prefix={<ShoppingCartOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card bordered={false} className="shadow-sm rounded-2xl">
                        <Statistic
                            title="Produtos Ativos"
                            value={stats.totalProducts}
                            prefix={<ShoppingOutlined />}
                        />
                    </Card>
                </Col>
            </Row>

            <Title level={4} className="mb-4">Pedidos Recentes</Title>
            <Card bordered={false} className="shadow-sm rounded-xl overflow-hidden">
                <Table scroll={{ x: "max-content" }}
                    dataSource={stats.recentOrders}
                    rowKey="_id"
                    pagination={false}
                    expandable={{
                        expandedRowRender: (record) => (
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-bold mb-2">Itens do Pedido:</h4>
                                <ul className="list-disc pl-5 m-0 text-sm">
                                    {record.items?.map((item, idx) => (
                                        <li key={idx} className="mb-1">
                                            <strong>{item.quantity}x</strong> {item.name} 
                                            <span className="text-gray-500 ml-2">
                                                (Ref: ��{item.price?.toFixed(2)} / Ganho Líquido: <span className="text-green-600 font-bold">��{item.vendorNet?.toFixed(2) || "N/A"}</span>)
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ),
                        rowExpandable: (record) => record.items && record.items.length > 0,
                    }}
                    columns={[
                        { title: 'ID', dataIndex: '_id', render: id => <span className="font-mono text-xs">...{id.slice(-6)}</span> },
                        { title: 'Data', dataIndex: 'createdAt', render: d => new Date(d).toLocaleDateString() },
                        { title: 'Cliente', dataIndex: ['shippingAddress', 'fullName'] },
                        {
                            title: 'Status', dataIndex: 'status', render: s => (
                                <Tag color={s === 'delivered' ? 'green' : s === 'shipped' ? 'blue' : 'orange'}>
                                    {(s || 'pending').toUpperCase()}
                                </Tag>
                            )
                        },
                        { title: 'Valor', dataIndex: 'totalPrice', render: v => `${Math.round(v).toLocaleString('de-DE')} FCFA` },
                    ]}
                />
            </Card>
        </div>
    );
};

export default VendorDashboard;
