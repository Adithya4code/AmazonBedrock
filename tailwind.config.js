/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {
            padding: {
                '6': '1.5rem', // Explicitly define p-6 if needed
            },
        },
    },
    plugins: [],
};