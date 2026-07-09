�import { API_URL } from "../config";

export const api = {
    // �x�� Buscar dados da loja e produtos do vendedor (Público)
    fetchVendorStore: async (slug) => {
        try {
            const response = await fetch(`${API_URL}/products/store/${slug}`);
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || "Erro ao carregar loja.");
            }
            return await response.json();
        } catch (error) {
            console.error("fetchVendorStore error:", error);
            throw error;
        }
    },

    // Outras chamadas genéricas podem ser adicionadas aqui
};
