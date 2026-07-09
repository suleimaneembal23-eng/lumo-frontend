�import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Row, Col, Card, Spin } from "antd";
// Assuming API_URL is defined in a config file

const PromotionProducts = () => {
  const { id } = useParams();
  const [products, setProducts] = useState(null);

  useEffect(() => {
    fetch(`/api/marketing/promotions/${id}/products`)
      .then(res => res.json())
      .then(data => setProducts(data));
  }, [id]);

  if (!products) return <Spin size="large" />;

  return (
    <div style={{ padding: 26 }}>
      <h2>Produtos desta Promoção</h2>

      <Row gutter={[20, 20]}>
        {products.map(p => (
          <Col xs={24} sm={12} md={8} lg={6} key={p._id}>
            <Card
              hoverable
              cover={<img src={p.image} alt={p.name} style={{ height: 250, objectFit: "cover" }} />}
            >
              <h3>{p.name}</h3>

              <p style={{ textDecoration: "line-through", color: "gray" }}>
                ��{p.price}
              </p>

              <p style={{ fontWeight: "bold", color: "red", fontSize: "1.2rem" }}>
                ��{p.finalPrice}
              </p>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default PromotionProducts;
