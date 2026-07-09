import React, { useEffect, useState, useContext } from 'react';
import { Table, Card, Tag, Typography, Spin, Space, Tooltip, Empty, Select, message } from 'antd';
import { ShoppingCartOutlined, UnorderedListOutlined } from '@ant-design/icons';
import { AuthContext } from '../../context/Authcontext';

const { Title, Text } = Typography;

const VendorOrders = () => {
    const { user } = useContext(AuthContext);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const handleStatusUpdate = async (orderId, itemId, newStatus) => {
        try {
            const res = await fetch(`/api/orders/vendor/${orderId}/item/${itemId}/status`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}` 
                },
                body: JSON.stringify({ status: newStatus })
            });
            if (res.ok) {
                message.success('Status da encomenda atualizado!');
                const updatedOrders = orders.map(o => {
                    if (o._id === orderId) {
                        const updatedItems = o.items.map(it => it._id === itemId ? { ...it, status: newStatus } : it);
                        return { ...o, items: updatedItems };
                    }
                    return o;
                });
                setOrders(updatedOrders);
            } else {
                const err = await res.json();
                message.error(err.message || 'Erro ao atualizar status.');
            }
        } catch (error) {
            message.error('Falha na comunicação de rede.');
        }
    };

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await fetch("/api/orders/vendor", {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
                const data = await res.json();
                
                if (Array.isArray(data)) {
                    // Sort descending by date
                    const sortedData = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                    setOrders(sortedData);
                }
            } catch (error) {
                console.error("Erro ao carregar lista de encomendas:", error);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchOrders();
        }
    }, [user]);

    // Colunas da Tabela Principal
    const columns = [
        {
            title: 'ID do Pedido',
            dataIndex: '_id',
            key: '_id',
            render: (id) => <Text copyable className="font-mono bg-gray-50 px-2 py-1 rounded text-xs">{id.slice(-8).toUpperCase()}</Text>,
            width: 130
        },
        {
            title: 'Data da Compra',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date) => (
                <div className="flex flex-col">
                    <span className="font-medium">{new Date(date).toLocaleDateString()}</span>
                    <span className="text-xs text-gray-400">{new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
            )
        },
        {
            title: 'Cliente Subscritor',
            dataIndex: 'userId',
            key: 'userId',
            render: (userObj, record) => {
                const address = record.shippingAddress;
                return (
                    <div>
                        <div className="font-bold text-blue-700 text-base">{userObj?.name || address?.fullName || 'Desconhecido'}</div>
                        <div className="text-xs text-gray-500 flex flex-col mt-1">
                            {address && <span>{address.address}, {address.city}</span>}
                            {address && <span>{address.postalCode}, {address.country}</span>}
                            {userObj?.phone && <span className="text-blue-500 font-medium">�x~ {userObj.phone}</span>}
                        </div>
                    </div>
                );
            }
        },
        {
            title: 'Progresso da Minha Entrega',
            key: 'myProgress',
            render: (_, record) => {
                if (!record.items || record.items.length === 0) return <span className="text-gray-400">N/A</span>;
                
                const statuses = record.items.map(it => it.status || 'pending');
                const allDelivered = statuses.every(s => s === 'delivered');
                const allShippedOrDelivered = statuses.every(s => s === 'shipped' || s === 'delivered');
                const anyProcessing = statuses.some(s => s !== 'pending' && s !== 'cancelled');
                const allCancelled = statuses.every(s => s === 'cancelled');

                let myStatus = 'pending';
                if (allCancelled) myStatus = 'cancelled';
                else if (allDelivered) myStatus = 'delivered';
                else if (allShippedOrDelivered) myStatus = 'shipped';
                else if (anyProcessing) myStatus = 'processing';
                
                const colors = {
                    'pending': 'gold',
                    'processing': 'blue',
                    'shipped': 'cyan',
                    'delivered': 'green',
                    'cancelled': 'red'
                };
                const labels = {
                    'pending': 'Pendente',
                    'processing': 'Em Progresso',
                    'shipped': 'Enviado',
                    'delivered': 'Entregue',
                    'cancelled': 'Cancelado'
                };
                return (
                    <div className="flex flex-col gap-1 items-start">
                        <Tag color={colors[myStatus] || 'default'} className="uppercase font-bold tracking-wider px-2 py-1 rounded-md m-0">
                            {labels[myStatus] || myStatus}
                        </Tag>
                    </div>
                );
            }
        },
        {
            title: 'Meu Rendimento Líquido',
            key: 'earnings',
            render: (_, record) => {
                // Calcular total líquido apenas dos itens Deste vendor
                const totalNet = record.items?.reduce((acc, item) => acc + (item.vendorNet || 0), 0) || 0;
                
                return (
                    <div className="bg-green-50 text-green-700 font-bold px-3 py-1.5 rounded-lg border border-green-100 flex items-center justify-center text-base inline-block">
                        {Math.round(totalNet).toLocaleString('de-DE')} FCFA
                    </div>
                );
            }
        }
    ];

    // Detalhes Expansíveis
    const expandedRowRender = (record) => {
        const itemColumns = [
            {
                title: 'Imagem',
                dataIndex: 'image',
                key: 'image',
                render: (url) => <img src={url} alt="Produto" className="w-12 h-12 rounded object-cover border border-gray-200" />
            },
            {
                title: 'Produto',
                dataIndex: 'name',
                key: 'name',
                render: (name, item) => (
                    <div>
                        <div className="font-bold">{name}</div>
                        <div className="font-mono text-xs text-gray-400 mt-1">Ref ID: {(item.productId?._id || item.productId)?.toString()?.slice(-6) || 'N/A'}</div>
                    </div>
                )
            },
            {
                title: 'Trajeto Partilhado (Rastreio)',
                key: 'trackingId',
                render: (_, item) => (
                    <Text copyable className="font-mono bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs">
                        {item._id?.toString().slice(-8).toUpperCase() || 'N/A'}
                    </Text>
                )
            },
            {
                title: 'Variante',
                dataIndex: 'size',
                key: 'size',
                render: (size) => <Tag>{size}</Tag>
            },
            {
                title: 'Qtd.',
                dataIndex: 'quantity',
                key: 'quantity',
                render: (qty) => <span className="font-bold bg-blue-50 text-blue-600 px-2 py-1 rounded">{qty}x</span>
            },
            {
                title: 'Preço Venda (Ref)',
                dataIndex: 'price',
                key: 'price',
                render: (price) => `${Math.round(price).toLocaleString('de-DE')} FCFA`
            },
            {
                title: 'Status de Entrega',
                key: 'status',
                render: (_, item) => (
                    <Select 
                        value={item.status || 'pending'} 
                        onChange={(val) => handleStatusUpdate(record._id, item._id, val)}
                        style={{ width: 140 }}
                        size="small"
                        options={[
                            { value: 'pending', label: 'Pendente' },
                            { value: 'processing', label: 'Processando' },
                            { value: 'shipped', label: 'Enviado' },
                            { value: 'delivered', label: 'Entregue' },
                            { value: 'cancelled', label: 'Cancelado' }
                        ]}
                    />
                )
            },
            {
                title: 'Lucro Líquido (Und.)',
                dataIndex: 'vendorNet',
                key: 'vendorNet',
                render: (net) => <span className="text-green-600 font-bold">{net ? `${Math.round(net).toLocaleString('de-DE')} FCFA` : 'N/A'}</span>
            }
        ];

        return (
            <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 my-2">
                <div className="mb-4 text-gray-700 font-semibold flex items-center gap-2">
                    <UnorderedListOutlined className="text-blue-500" /> Itens deste Pedido (Que lhe pertencem)
                </div>
                <Table
                    columns={itemColumns}
                    dataSource={record.items}
                    pagination={false}
                    rowKey={(item, idx) => idx}
                    size="small"
                    className="shadow-sm bg-white rounded-lg overflow-hidden border border-gray-100"
                />
            </div>
        );
    };

    return (
        <div className="max-w-6xl mx-auto pb-12">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold m-0 flex items-center gap-3 text-gray-900">
                        <ShoppingCartOutlined className="text-blue-600" /> Gestão de Pedidos
                    </h1>
                    <p className="text-gray-500 m-0 mt-2 text-base">
                        Acompanhe todos os pedidos onde os seus produtos foram comprados
                    </p>
                </div>
            </div>

            <Card bordered={false} className="shadow-sm rounded-2xl overflow-hidden border border-gray-100">
                <Table
                    columns={columns}
                    expandable={{
                        expandedRowRender,
                        rowExpandable: (record) => record.items && record.items.length > 0,
                    }}
                    dataSource={orders}
                    rowKey="_id"
                    loading={loading}
                    pagination={{ pageSize: 12 }}
                    locale={{ emptyText: <Empty description="Nenhum pedido recebido ainda." /> }}
                />
            </Card>
        </div>
    );
};

export default VendorOrders;
