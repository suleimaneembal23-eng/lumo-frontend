import React from 'react';
import { Card, Typography } from 'antd';

const { Title, Text } = Typography;

function ProductCard({ title, imageSrc, linkText, style = {} }) {
  const cardStyle = {
    height: '420px',
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 0 5px rgba(0, 0, 0, 0.1)',
    cursor: 'pointer',
    ...style
  };

  const imageStyle = {
    width: '100%',
    height: '300px', // Altura fixa para as imagens
    objectFit: 'cover',
    marginTop: '10px',
    borderRadius: '4px',
  };

  return (
    <div style={cardStyle}>
      <Title level={4} style={{ marginBottom: '15px', color: '#111' }}>
        {title}
      </Title>
      <img 
        src={imageSrc} 
        alt={title} 
        style={imageStyle} 
      />
      <Text 
        type="link" 
        style={{ display: 'block', marginTop: '15px', color: '#007185' }}
        onClick={() => alert(`Navegando para: ${title}`)}
      >
        {linkText}
      </Text>
    </div>
  );
}

export default ProductCard;