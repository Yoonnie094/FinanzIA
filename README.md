# FinanzIA MVP

Primera experiencia de FinanzIA: una landing pública y un panel de demostración para ordenar ingresos, gastos y próximos pagos con una identidad morada cercana.

## Ejecutar en desarrollo

```bash
npm install
npm run dev
```

El demo funciona sin credenciales. Los movimientos se guardan localmente en el navegador y se pueden exportar a CSV.

## Conexión Supabase

La app ya está configurada localmente con el proyecto Supabase existente de FinanzIA. `.env.local` contiene la URL y la clave pública del proyecto y está excluido de Git. Nunca pongas la `service_role` ni una clave secreta en variables `VITE_`.

El proyecto ya tiene tablas `profiles`, `businesses` y `transactions`, protegidas con RLS. El MVP usa `transactions` con las columnas existentes `user_id`, `type`, `concept`, `category`, `amount` y `date`. La migración `add_ai_onboarding_context` agregó `businesses.ai_context` y el permiso RLS para que cada usuario cree su propio perfil.

El registro usa enlace seguro por correo; Supabase crea la cuenta al confirmar el enlace. Después, un onboarding de tres pasos guarda el nombre del usuario, nombre/rubro/etapa del negocio, tamaño del equipo, método de registro actual, uso de inventario, principal dificultad, objetivo y forma preferida de registrar movimientos. Región y comuna son opcionales. El consentimiento de personalización IA se guarda junto con contexto `es-CL` y `CLP`; todavía no se envía este contexto a ningún modelo. No se solicitan RUT, claves, datos bancarios ni montos financieros.

Para completar el acceso en producción, agrega el dominio publicado a las URLs permitidas de redirección de Supabase Auth (y `http://localhost:5173` para pruebas locales).

Sin iniciar sesión, el demo guarda movimientos localmente. Con sesión autenticada, los movimientos se leen y escriben en Supabase según el RLS del usuario.

## Alcance de esta versión

- Landing page de FinanzIA.
- Resumen demostrativo con ingresos, gastos, caja estimada y pagos próximos de ejemplo.
- Alta de movimientos con categorías iniciales editables en el código.
- Vista de movimientos y exportación CSV.
- Modo claro y oscuro.
- Cliente Supabase y acceso por enlace de correo.
- Registro guiado con contexto de negocio preparado para futuras funciones de IA.

La IA, mensajería, inventario, gestión real de créditos, notificaciones de pagos y sincronización entre dispositivos aún no están conectados.
