# Configuración de correos y redirecciones de Auth

## URL de la app

En el dashboard de Supabase, entra a **Authentication → URL Configuration** y configura:

- **Site URL:** `https://finanzia-orcin.vercel.app`
- **Redirect URLs:** `https://finanzia-orcin.vercel.app/auth/callback` y `http://localhost:5173/auth/callback`

El sitio debe estar en la lista permitida para que Supabase no redirija al dominio anterior. Mantén las URLs de producción exactas; agrega otros dominios solo si FinanzIA los usará.

## Plantillas

En **Authentication → Emails → Email Templates**, pega el HTML correspondiente desde y ajusta el asunto:

- **Confirm signup:** asunto `Confirma tu correo para entrar a FinanzIA`; HTML `supabase/templates/confirm_signup.html`.
- **Magic Link:** asunto `Tu enlace seguro para entrar a FinanzIA`; HTML `supabase/templates/magic_link.html` (queda listo por si se habilita acceso por enlace más adelante; el registro actual usa contraseña).

El registro envía **Confirm signup** únicamente al final del onboarding, cuando ya se ingresaron y validaron correo y contraseñas. Ambas plantillas usan `{{ .ConfirmationURL }}`. Ese enlace conserva la URL de retorno que solicita la app y lleva a `/auth/callback`. Después de validar el enlace, la app guarda el contexto del negocio y dirige al panel. Si el enlace vence, vuelve al inicio de sesión con un mensaje para corregir el problema.

El correo transaccional predeterminado de Supabase puede tener límites de envío y remitente genérico. Para producción, configura SMTP propio en **Authentication → SMTP Settings** y usa un remitente del dominio de FinanzIA.
