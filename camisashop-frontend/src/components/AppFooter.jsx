import React, { useContext } from "react";
import { SettingsContext } from "../context/SettingsContext";
import { Layout, Typography } from "antd";

const { Footer } = Layout;
const { Text } = Typography;

const AppFooter = () => {
  const { settings } = useContext(SettingsContext);

  return (
    <Footer
      style={{
        textAlign: "center",
        background: settings?.secondaryColor || "#f0f0f0",
        padding: "20px 0",
      }}
    >
      <Text>
        {settings?.footerNote || "© 2025 CamisaShop - Todos os direitos reservados"}
      </Text>
    </Footer>
  );
};

export default AppFooter;
