# Configuración de correos y redirecciones de Auth

## URL de la app

En el dashboard de Supabase, entra a **Authentication → URL Configuration** y configura:

- **Site URL:** `https://finanzia-orcin.vercel.app`
- **Redirect URLs:** `https://finanzia-orcin.vercel.app/auth/callback` y `http://localhost:5173/auth/callback`

El sitio debe estar en la lista permitida para que Supabase no redirija al dominio anterior. Mantén las URLs de producción exactas; agrega otros dominios solo si FinanzIA los usará.

## Plantillas

En **Authentication → Emails → Email Templates**, pega el HTML correspondiente desde:

- **Magic Link:** `supabase/templates/magic_link.html`
- **Confirm signup:** `supabase/templates/confirm_signup.html`

Ambas plantillas usan `{{ .ConfirmationURL }}`. Ese enlace conserva la URL de retorno que solicita la app y lleva a `/auth/callback`. Después de validar el enlace, la app limpia los parámetros de Auth y dirige a la persona al onboarding si es su primera vez, o al panel si ya completó su perfil.

El correo transaccional predeterminado de Supabase puede tener límites de envío y remitente genérico. Para producción, configura SMTP propio en **Authentication → SMTP Settings** y usa un remitente del dominio de FinanzIA.
