
import { useState, useEffect, useCallback, useMemo } from 'react';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';

dayjs.extend(duration);



export const usePromotions = () => {
    const [promotions, setPromotions] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchPromotions = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/marketing/promotions`);
            const data = await res.json();
            setPromotions(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchPromotions();
    }, [fetchPromotions]);

    const activePromotions = useMemo(() => {
        const now = dayjs();
        return promotions.filter((p) => {
            if (!p || !p.active) return false;
            if (!p.validUntil) return true;
            try {
                const d = dayjs(p.validUntil);
                return d.isValid() && d.isAfter(now);
            } catch { return false; }
        });
    }, [promotions]);

    const bestPromoForProduct = useCallback((prod) => {
        if (!prod) return null;

        const candidate = activePromotions
            .filter((promo) => {
                const productIdMatch = Array.isArray(promo.products) && promo.products.length &&
                    promo.products.map(x => (x && x._id ? String(x._id) : String(x))).filter(Boolean).includes(String(prod._id));

                // Note: O modelo Product no backend permite category como array ou string.
                const productCategories = Array.isArray(prod.category) ? prod.category : (prod.category ? [prod.category] : []);

                const categoryMatch = Array.isArray(promo.categories) &&
                    (promo.categories.includes("Todas as Categorias") ||
                        productCategories.some((c) => promo.categories.includes(c)));

                // ExcluÃ­mos a Oferta do Dia? NÃƒO. Agora permitimos que ela se aplique via Categoria tambÃ©m se for o melhor desconto.
                // Ref: Step 3070 "o usuario ja sabe a promo antes mesmo de entrar"
                // if (promo.isDailyDeal) { ... } -> REMOVED

                // ðŸš¨ EXCLUSÃƒO: Cupons de Novo UsuÃ¡rio (Welcome Coupons) NÃƒO devem ser aplicados automaticamente.
                // Eles exigem que o usuÃ¡rio digite o cÃ³digo manualmente.
                if (promo.isNewUserCoupon) return false;

                return productIdMatch || categoryMatch;
            })
            .sort((a, b) => (b.discount || 0) - (a.discount || 0));

        return candidate.length ? candidate[0] : null;
    }, [activePromotions]);

    // Helper para calcular preÃ§o com desconto
    const calculateDiscountedPrice = useCallback((product) => {
        if (!product || !product.price) return { ...product, finalPrice: 0, discountPercent: 0, onSale: false };

        const promo = bestPromoForProduct(product);

        // Se nÃ£o houver promoÃ§Ã£o 'Best', mas houver originalPrice > price, mantemos o desconto existente (manual).
        if (!promo || !promo.discount) {
            const hasExistingDiscount = product.originalPrice && product.originalPrice > product.price;
            if (hasExistingDiscount) {
                const discountPercent = ((product.originalPrice - product.price) / product.originalPrice) * 100;
                return {
                    ...product,
                    finalPrice: product.price,
                    originalPrice: product.originalPrice,
                    onSale: true,
                    discountPercent: discountPercent,
                    appliedPromoId: null
                };
            }
            return { ...product, finalPrice: product.price, onSale: false, originalPrice: null };
        }

        // Aplica o desconto da "Best Promo"
        const discountPercent = Number(promo.discount || 0);
        const clamped = Math.max(0, Math.min(100, discountPercent));
        const originalPrice = product.originalPrice > 0 ? product.originalPrice : product.price;
        const discountedPrice = parseFloat((originalPrice * (1 - clamped / 100)).toFixed(2));

        return {
            ...product,
            originalPrice: originalPrice,
            finalPrice: discountedPrice,
            onSale: true,
            discountPercent: clamped,
            appliedPromoId: promo._id,
            appliedPromo: promo,
        };
    }, [bestPromoForProduct]);

    return {
        promotions,
        activePromotions,
        loading,
        fetchPromotions,
        bestPromoForProduct,
        calculateDiscountedPrice
    };
};
