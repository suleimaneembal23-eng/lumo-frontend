import { useState, useEffect } from "react";


export const useSettings = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/settings`);
      if (!res.ok) throw new Error("Erro ao carregar definiÃ§Ãµes.");
      const data = await res.json();
      setSettings(data);
    } catch (err) {
      console.error("Erro no hook useSettings:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const refreshSettings = () => {
    fetchSettings();
  };

  return { settings, loading, refreshSettings };
};

export default useSettings;
