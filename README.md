# FinanzIA 🚀
### Inteligencia Artificial para el Control Financiero de tu Negocio

FinanzIA es una plataforma integral diseñada para emprendedores que buscan simplificar su gestión financiera mediante el uso de inteligencia artificial. Permite registrar transacciones, gestionar inventarios y recibir asesoría contable automatizada, todo en un lenguaje natural y sencillo.

## ✨ Características Principales

- **Asistente Inteligente**: Chatbot especializado en finanzas que procesa registros y responde dudas contables.
- **Gestión de Inventario**: Control de stock con alertas de nivel crítico.
- **Panel de Control**: Visualización clara de ingresos, gastos y salud financiera del negocio.
- **Metas Financieras**: Seguimiento de objetivos de ahorro e inversión.
- **Exportación de Datos**: Descarga de movimientos en formato CSV para contabilidad.

## 🛠️ Stack Tecnológico

- **Frontend**: [Next.js 15](https://nextjs.org/) (App Router)
- **Base de Datos y Auth**: [Supabase](https://supabase.com/)
- **IA**: [Vercel AI SDK](https://sdk.vercel.ai/) con modelos de Google (Gemini) y Groq.
- **Estilos**: [Tailwind CSS](https://tailwindcss.com/) + [Shadcn UI](https://ui.shadcn.com/)
- **Gráficos**: [Recharts](https://recharts.org/)

## 🚀 Configuración para Desarrollo

1. **Clonar el repositorio**:
   ```bash
   git clone <url-del-repo>
   cd FinanzIA
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Variables de Entorno**:
   Crea un archivo `.env.local` basado en `.env.example`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_key_anonima
   SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
   GOOGLE_GENERATIVE_AI_API_KEY=tu_api_key_de_google
   GROQ_API_KEY=tu_api_key_de_groq
   ```

4. **Ejecutar en local**:
   ```bash
   npm run dev
   ```

## 🌐 Despliegue en Vercel

1. Sube tu código a un repositorio de GitHub.
2. Conecta el repositorio en el dashboard de [Vercel](https://vercel.com/).
3. Configura las **Environment Variables** en Vercel con los mismos valores de tu `.env.local`.
4. El despliegue será automático.

## 📄 Licencia

Este proyecto es privado para uso comercial de su propietario.
