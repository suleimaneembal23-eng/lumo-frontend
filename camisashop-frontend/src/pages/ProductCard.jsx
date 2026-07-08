import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Button, message } from "antd";
import { AuthContext } from "../context/Authcontext";

const ProductCard = ({ product }) => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleAddToCart = () => {
    if (!user) {
      message.info("Você precisa estar logado para adicionar produtos ao carrinho.");
      navigate("/loginclient");
      return; // bloqueia o fluxo de adicionar
    }

    // lógica de adicionar ao carrinho se estiver logado
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    cart.push(product);
    localStorage.setItem("cart", JSON.stringify(cart));
    message.success("Produto adicionado ao carrinho!");
  };

  const handleBuyNow = () => {
    if (!user) {
      message.info("Você precisa estar logado para comprar.");
      navigate("/loginclient");
      return; // bloqueia compra
    }

    // lógica de compra, por exemplo, redirecionar para checkout
    navigate("/checkout");
  };

  return (
    <div className="product-card">
      <h3>{product.name}</h3>
      <p>{product.price} €</p>
      <Button type="primary" onClick={handleAddToCart}>
        Adicionar ao carrinho
      </Button>
      <Button type="default" onClick={handleBuyNow} style={{ marginLeft: "8px" }}>
        Comprar agora
      </Button>
    </div>
  );
};

export default ProductCard;
