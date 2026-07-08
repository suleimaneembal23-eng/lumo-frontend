/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#1890ff',
                secondary: '#000000',
            },
            keyframes: {
                slideDown: {
                    '0%': { opacity: 0, transform: 'translateY(-10px)' },
                    '100%': { opacity: 1, transform: 'translateY(0)' },
                }
            },
            animation: {
                slideDown: 'slideDown 0.3s ease-out',
            }
        },
    },
    plugins: [],
}
