�import React, { useState, useEffect } from 'react';
import { Typography, Tag } from 'antd';
import dayjs from 'dayjs';

const { Text } = Typography;

/**
 * Componente de contador regressivo.
 * @param {string} targetDate - Data e hora de término da promoção (ISO string).
 * @param {string} textColor - Cor do texto (NÒO SERÁ USADA, mas mantida nas props).
 */
const CountdownTimer = ({ targetDate, textColor }) => { // A prop textColor é ignorada para o texto.
    
    // ... (função calculateTimeLeft e useEffect mantêm-se iguais) ...

    const calculateTimeLeft = () => {
        if (!targetDate) return null;
        
        const difference = dayjs(targetDate).diff(dayjs());
        
        if (difference <= 0) {
            return null;
        }

        let timeLeft = {};

        const totalSeconds = Math.floor(difference / 1000);
        
        timeLeft.days = Math.floor(totalSeconds / (60 * 60 * 24));
        timeLeft.hours = Math.floor((totalSeconds % (60 * 60 * 24)) / (60 * 60));
        timeLeft.minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
        timeLeft.seconds = Math.floor(totalSeconds % 60);

        return timeLeft;
    };

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        if (!targetDate) return;

        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, [targetDate]);

    // 4. Formatar a exibição
    const timerComponents = [];

    if (timeLeft) {
        Object.keys(timeLeft).forEach(interval => {
            const value = timeLeft[interval];
            const label = interval.charAt(0).toUpperCase() + interval.slice(1);
            
            timerComponents.push(
                <Tag 
                    key={interval} 
                    // Mantém a cor de fundo da Tag vermelha para destaque
                    color="red" 
                    style={{ 
                        fontSize: 20, 
                        padding: '8px 12px', 
                        fontWeight: 700,
                        margin: '0 5px',
                        minWidth: 80,
                        textAlign: 'center'
                    }}
                >
                    {/* �xa� CORRE�!ÒO: COR FOR�!ADA PARA PRETO (#000) */}
                    <Text style={{ 
                        color: '#000', // <-- SEMPRE PRETO
                        display: 'block' 
                    }}>
                        {String(value).padStart(2, '0')}
                    </Text>
                    {/* �xa� CORRE�!ÒO: COR FOR�!ADA PARA PRETO (#000) */}
                    <Text style={{ 
                        color: '#000', // <-- SEMPRE PRETO
                        fontSize: 12, 
                        fontWeight: 500, 
                        display: 'block' 
                    }}>
                        {value === 1 ? label.slice(0, -1) : label}
                    </Text>
                </Tag>
            );
        });
    }

    if (!targetDate) {
        // �xa� CORRE�!ÒO: COR FOR�!ADA PARA PRETO (#000)
        return <Text style={{ color: '#000' }}>Promoção sem data de término definida.</Text>;
    }

    if (!timeLeft) {
        // �xa� CORRE�!ÒO: COR FOR�!ADA PARA PRETO (#000)
        return <Text style={{ color: '#000', fontSize: 24, fontWeight: 600 }}>PROMO�!ÒO TERMINADA!</Text>;
    }

    return (
        <div style={{ margin: '20px 0', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            {/* �xa� CORRE�!ÒO: COR FOR�!ADA PARA PRETO (#000) */}
            <Text style={{ color: '#000', fontSize: 20, fontWeight: 600, marginRight: 15 }}>
                Termina em:
            </Text>
            {timerComponents}
        </div>
    );
};

export default CountdownTimer;
