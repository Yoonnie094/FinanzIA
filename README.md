# FinanzIA MVP

FinanzIA presenta cómo ayuda a ordenar ingresos, gastos y próximos pagos de una PYME. La página explica el recorrido con ilustraciones conceptuales y dirige al registro; no incluye acceso a un panel de muestra ni movimientos ficticios.

## Ejecutar en desarrollo

```bash
npm install
npm run dev
```

La landing se puede revisar sin credenciales. Para crear una cuenta, iniciar sesión y guardar datos se necesita configurar Supabase.

## Conexión Supabase

La app ya está configurada localmente con el proyecto Supabase existente de FinanzIA. `.env.local` contiene la URL y la clave pública del proyecto y está excluido de Git. Nunca pongas la `service_role` ni una clave secreta en variables `VITE_`.

El proyecto ya tiene tablas `profiles`, `businesses` y `transactions`, protegidas con RLS. El MVP usa `transactions` con las columnas existentes `user_id`, `type`, `concept`, `category`, `amount` y `date`. La migración `add_ai_onboarding_context` agregó `businesses.ai_context` y el permiso RLS para que cada usuario cree su propio perfil.

El registro pregunta primero por la persona, su negocio, cómo lleva sus cuentas, inventario, dificultades y objetivos. En el último paso solicita correo, contraseña y repetición; solo entonces Supabase crea la cuenta y envía la verificación. El contexto viaja como metadatos de la cuenta pendiente y, cuando se verifica el correo, se guarda en `profiles` y `businesses.ai_context`. Si la verificación está desactivada en Supabase, la app guarda el contexto al crear la sesión. El consentimiento de personalización IA queda asociado al contexto `es-CL` y `CLP`; todavía no se envía a ningún modelo. No se solicitan RUT, claves, datos bancarios ni montos financieros.

El inicio de sesión usa correo y contraseña. Si la persona confirma el correo desde otro dispositivo, el contexto se recupera desde los metadatos de la cuenta verificada y se guarda en su negocio antes de entrar al panel.

El enlace de acceso confirma la sesión en `/auth/callback`; desde ahí, la app dirige al onboarding cuando es el primer ingreso o al panel si el perfil ya está completo. Los errores por enlaces vencidos vuelven al acceso con un aviso y la opción de pedir un enlace nuevo. La plantilla visual y los pasos de configuración de Auth están en `supabase/templates/` y `supabase/auth_email_setup.md`.

En Supabase Auth configura como **Site URL** `https://finanzia-orcin.vercel.app` y agrega a **Redirect URLs** `https://finanzia-orcin.vercel.app/auth/callback` y `http://localhost:5173/auth/callback`. Pega las plantillas para **Magic Link** y **Confirm signup** desde los archivos HTML indicados. Esta configuración debe quedar aplicada en el dashboard para que el proveedor mande los correos con la nueva identidad y no redirija al dominio anterior.

Con sesión autenticada, los movimientos se leen y escriben en Supabase según el RLS del usuario. El espacio parte vacío y muestra estados de inicio hasta que se registren datos propios.

## Alcance de esta versión

- Landing page de FinanzIA.
- Resumen de ingresos, gastos y pagos a partir de registros propios.
- Alta de movimientos con categorías iniciales editables en el código.
- Vista de movimientos y exportación CSV.
- Modo claro y oscuro.
- Tema que puede seguir la preferencia de luz del dispositivo.
- Controles A− y A+ para ajustar el tamaño de lectura y un botón circular mitad negro/mitad blanco para activar la escala de grises.
- Navegación adaptable para teléfonos, tabletas y escritorio, con menú móvil y controles táctiles ampliados.
- Cliente Supabase y acceso por enlace de correo.
- Registro guiado con contexto de negocio preparado para futuras funciones de IA.

La IA, mensajería, inventario, gestión real de créditos, notificaciones de pagos y sincronización entre dispositivos aún no están conectados.
