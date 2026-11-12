import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { ArrowDownLeft, ArrowLeft, ArrowRight, ArrowUpRight, BarChart3, Bell, Check, ChevronDown, ChevronLeft, CircleHelp, ClipboardList, CreditCard, Eye, FileDown, LockKeyhole, Menu, Moon, Plus, ShieldCheck, Sparkles, Store, Sun, Wallet, X } from 'lucide-react'
import { incomeCategories, expenseCategories, initialMovements, type Movement, type MovementType } from './types'
import { loadMovements, saveMovement } from './lib/movements'
import { supabase, supabaseConfigured } from './lib/supabase'
import { FINANZIA_TERMS_VERSION, hasCompletedOnboarding, saveOnboarding, type OnboardingData } from './lib/onboarding'

type WorkspaceView = 'dashboard' | 'movements' | 'payments'
type View = 'landing' | 'signin' | 'registration' | 'verification-pending' | 'onboarding' | 'terms' | WorkspaceView
type Modal = 'movement' | null
type RegistrationData = OnboardingData & { email: string; password: string }
type ThemeChoice = 'system' | 'light' | 'dark'
type Appearance = { theme: ThemeChoice; textScale: number; grayscale: boolean }

const AUTH_CALLBACK_PATH = '/auth/callback'
const requiredOnboardingFields: (keyof OnboardingData)[] = ['firstName', 'businessName', 'category', 'stage', 'teamSize', 'trackingMethod', 'hasInventory', 'mainChallenge', 'mainGoal', 'preferredEntry']

const routes: Record<string, { view: View; modal?: Modal }> = {
  '/': { view: 'landing' },
  '/iniciar-sesion': { view: 'signin' },
  '/registro': { view: 'registration' },
  '/verificar-correo': { view: 'verification-pending' },
  '/configurar-negocio': { view: 'onboarding' },
  '/terminos-y-condiciones': { view: 'terms' },
  '/app': { view: 'dashboard' },
  '/movimientos': { view: 'movements' },
  '/pagos': { view: 'payments' },
}

function resolveRoute(pathname: string) {
  return routes[pathname] || routes['/']
}

function pathForView(view: View) {
  if (view === 'landing') return '/'
  if (view === 'signin') return '/iniciar-sesion'
  if (view === 'registration') return '/registro'
  if (view === 'verification-pending') return '/verificar-correo'
  if (view === 'onboarding') return '/configurar-negocio'
  if (view === 'terms') return '/terminos-y-condiciones'
  if (view === 'dashboard') return '/app'
  if (view === 'movements') return '/movimientos'
  return '/pagos'
}

function isOnboardingData(value: unknown): value is OnboardingData {
  if (!value || typeof value !== 'object') return false
  const data = value as Record<string, unknown>
  return requiredOnboardingFields.every((key) => typeof data[key] === 'string' && data[key] !== '')
}

function getSavedAppearance(): Appearance {
  try {
    const saved = localStorage.getItem('finanzia.appearance')
    if (saved) return { theme: 'system', textScale: 1, grayscale: false, ...JSON.parse(saved) }
    return { theme: localStorage.getItem('finanzia.theme') === 'dark' ? 'dark' : 'system', textScale: 1, grayscale: false }
  } catch { return { theme: 'system', textScale: 1, grayscale: false } }
}

const clp = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 })
const shortDate = (date: string) => new Intl.DateTimeFormat('es-CL', { day: 'numeric', month: 'short' }).format(new Date(`${date}T12:00:00`))
const todayISO = () => new Date().toLocaleDateString('sv-SE')
const todayLong = () => new Intl.DateTimeFormat('es-CL', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date()).toLocaleUpperCase('es-CL')

function Brand({ inverse = false }: { inverse?: boolean }) {
  return <span className={`brand ${inverse ? 'brand-inverse' : ''}`}><span className="brand-mark"><span /><span /><span /></span><span>FinanzIA</span></span>
}

function TermsPage() {
  useEffect(() => {
    const previousTitle = document.title
    document.title = 'Términos de uso y privacidad — FinanzIA'
    return () => { document.title = previousTitle }
  }, [])

  return <main className="legal-page">
    <header className="legal-header"><a href="/" aria-label="FinanzIA, volver al inicio"><Brand /></a><a className="legal-home" href="/">Volver a FinanzIA <ArrowRight size={15} /></a></header>
    <article className="legal-document">
      <div className="eyebrow"><ShieldCheck size={14} /> INFORMACIÓN LEGAL DE FINANZIA</div>
      <p className="legal-version">Versión 1.2 · Actualizada el 11 de noviembre de 2026</p>
      <h1>Términos de uso<br /><span>y política de privacidad</span></h1>
      <p className="legal-intro">Estas condiciones explican cómo usar FinanzIA y cómo se tratan los datos personales que entregas al crear tu cuenta y usar el servicio. Léelas antes de registrarte.</p>

      <aside className="legal-notice"><b>Estado actual de FinanzIA</b><p>Este MVP usa Supabase para autenticación y base de datos. La conexión a un proveedor de inteligencia artificial todavía no está activa: actualmente no enviamos tu perfil ni tus movimientos a un modelo de IA. Si esta función se habilita, informaremos antes qué proveedor, datos y finalidades se usarán y pediremos la autorización que corresponda.</p></aside>

      <section><h2>1. Quién presta el servicio y responde por los datos</h2><p>FinanzIA es un servicio en desarrollo para ayudar a pequeñas y medianas empresas a registrar y comprender información de su negocio.</p><dl className="legal-facts"><div><dt>Responsable del tratamiento</dt><dd>Javiera Angulo Barraza, creadora de FinanzIA.</dd></div><div><dt>Contacto para privacidad, consultas y solicitudes</dt><dd><a href="mailto:javiera.angulo2005@gmail.com">javiera.angulo2005@gmail.com</a></dd></div></dl><p>El correo anterior es el canal habilitado para solicitudes sobre datos personales. No se publica domicilio postal.</p></section>

      <section><h2>2. Qué datos tratamos</h2><p>Según las funciones que uses, FinanzIA puede tratar:</p><ul><li><b>Cuenta:</b> correo electrónico, contraseña gestionada por Supabase Auth y datos necesarios para verificar el correo e iniciar sesión.</li><li><b>Perfil y contexto de la PYME:</b> nombre de la persona, nombre y rubro del negocio, etapa, tamaño del equipo, método de registro, si controla inventario, objetivos y desafíos indicados.</li><li><b>Ubicación y descripción:</b> región, comuna y descripción del negocio, que son opcionales cuando el formulario así lo indica.</li><li><b>Movimientos financieros ingresados:</b> tipo, descripción, categoría, monto en pesos chilenos y fecha.</li><li><b>Datos técnicos básicos:</b> sesión de cuenta y preferencias de visualización guardadas en el navegador. El alojamiento puede generar registros técnicos de conexión para operar y proteger el sitio.</li></ul><p>No solicites ni ingreses claves bancarias, números de tarjetas, RUT de terceros ni información sensible que no sea necesaria para llevar las cuentas de tu negocio.</p></section>

      <section><h2>3. Para qué usamos la información</h2><p>Tratamos los datos para crear y proteger tu cuenta, verificar tu correo, guardar el perfil y los movimientos que ingresas, mostrar resúmenes del negocio, adaptar la experiencia a las respuestas del onboarding, mantener y proteger el servicio, y responder solicitudes de soporte o privacidad. No vendemos tus datos ni los usamos para publicidad personalizada.</p><p>Los campos marcados como opcionales pueden dejarse vacíos. Si no entregas datos necesarios para una función, esa función podría no estar disponible o no funcionar correctamente.</p></section>

      <section><h2>4. Base y constancia del tratamiento</h2><p>En el registro se te solicita una autorización expresa para tratar los datos que entregas con el fin de crear y administrar tu cuenta, guardar el contexto de tu PYME y prestar las funciones que solicitas, junto con la aceptación de estos términos. La casilla no autoriza usos ajenos a esas finalidades. Conservamos la versión aceptada y la fecha y hora de aceptación como constancia electrónica. Puedes retirar tu autorización escribiendo al contacto indicado; esto no afecta la licitud del tratamiento previo y puede impedir funciones que dependan de esos datos.</p><p>Hasta el 30 de noviembre de 2026 rige el texto vigente de la Ley N.º 19.628. La Ley N.º 21.719, que modifica ese régimen, tiene entrada en vigor el 1 de diciembre de 2026. Esta política se redactó considerando ambas fechas y se actualizará si cambian las funciones, proveedores o finalidades.</p></section>

      <section><h2>5. Proveedores y transferencias internacionales</h2><p><b>Supabase</b> presta la autenticación y base de datos conectadas al MVP; el proyecto está configurado en la región <b>us-west-2 (Estados Unidos)</b>. Esto implica que los datos alojados allí se procesan fuera de Chile. <b>Vercel</b> aloja la aplicación web y puede procesar datos técnicos de conexión; la región efectiva, los registros y sus plazos de retención deben confirmarse en la configuración de producción. Cada proveedor puede utilizar subencargados para operar su servicio, conforme a sus condiciones y políticas.</p><p>Antes de producción, la responsable debe revisar las condiciones vigentes de los proveedores, sus subencargados, mecanismos y garantías para transferencias internacionales, y completar la información de alojamiento y retención de Vercel. Esta política se actualizará con esos datos confirmados.</p></section>

      <section><h2>6. Plazo de conservación</h2><p>Los datos se conservan mientras la cuenta esté activa y sean necesarios para prestar las funciones solicitadas. Puedes pedir el cierre de la cuenta y la eliminación de tus datos escribiendo al correo de privacidad. Se podrán conservar los antecedentes que deban mantenerse por obligación legal, para resolver controversias o proteger la seguridad del servicio. Las copias de respaldo se eliminarán o sobrescribirán conforme a sus ciclos técnicos de retención.</p><p>El MVP aún no tiene una opción automática de eliminación de cuenta; las solicitudes se gestionan por el canal de contacto indicado.</p></section>

      <section><h2>7. Tus derechos y cómo ejercerlos</h2><p>Puedes escribir a <a href="mailto:javiera.angulo2005@gmail.com">javiera.angulo2005@gmail.com</a> para consultar si tratamos tus datos, conocer su origen y destinatarios, pedir actualización o corrección, solicitar eliminación cuando corresponda, retirar una autorización, o pedir bloqueo temporal conforme a la ley vigente.</p><p>Desde el 1 de diciembre de 2026, la Ley N.º 21.719 reconoce, entre otros, derechos de acceso, rectificación, supresión, oposición, portabilidad y bloqueo. Atenderemos las solicitudes según los requisitos y plazos legales aplicables. Si una solicitud es rechazada o no se responde oportunamente, podrás acudir a la autoridad competente de acuerdo con el procedimiento que establezca la ley.</p></section>

      <section><h2>8. Seguridad y decisiones asistidas por IA</h2><p>FinanzIA usa autenticación de Supabase y controles de acceso de la aplicación. Antes de producción se deben corregir y verificar las alertas de seguridad detectadas en la configuración de base de datos, además de comprobar las políticas de acceso por usuario. Mantén tu contraseña protegida y cierra sesión en dispositivos compartidos.</p><p>Cuando la ayuda de IA esté disponible, sus clasificaciones y explicaciones serán orientativas y pueden equivocarse. Revisa los datos y conserva la decisión final. FinanzIA no reemplaza asesoría contable, tributaria, financiera ni legal.</p></section>

      <section><h2>9. Uso del servicio</h2><p>Usa FinanzIA para gestionar la información de negocios que estás autorizado a administrar. No cargues datos de otras personas sin contar con la autorización o fundamento que corresponda. No intentes acceder a cuentas ajenas, interferir con el servicio ni usar la plataforma para actividades ilícitas.</p></section>

      <section><h2>10. Cambios a estos términos</h2><p>Si cambia la ley, la forma de tratar datos o las funciones de FinanzIA, actualizaremos esta página e incrementaremos su versión. Cuando un cambio requiera una nueva autorización, te la pediremos antes de aplicar el nuevo tratamiento. Puedes volver a esta página desde el enlace mostrado durante el registro.</p></section>

      <section className="legal-references"><h2>Normativa de referencia</h2><ul><li><a href="https://www.bcn.cl/leychile/navegar?idNorma=141599&idVersion=2023-05-09" target="_blank" rel="noopener noreferrer">Ley N.º 19.628, texto vigente hasta el 30 de noviembre de 2026</a></li><li><a href="https://www.bcn.cl/leychile/navegar?i=1209272" target="_blank" rel="noopener noreferrer">Ley N.º 21.719, con vigencia desde el 1 de diciembre de 2026</a></li></ul></section>
      <footer className="legal-footer"><Brand /><a href="mailto:javiera.angulo2005@gmail.com">Contacto de privacidad</a><span>Versión 1.2 · 11/11/2026</span></footer>
    </article>
  </main>
}

function App() {
  const [view, setView] = useState<View>(() => resolveRoute(window.location.pathname).view)
  const [modal, setModal] = useState<Modal>(() => resolveRoute(window.location.pathname).modal || null)
  const [movements, setMovements] = useState<Movement[]>(initialMovements)
  const [appearance, setAppearance] = useState<Appearance>(getSavedAppearance)
  const [systemDark, setSystemDark] = useState(() => window.matchMedia('(prefers-color-scheme: dark)').matches)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [pendingEmail, setPendingEmail] = useState('')
  const [authUserId, setAuthUserId] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')
  const [mobileMenu, setMobileMenu] = useState(false)

  const dark = appearance.theme === 'system' ? systemDark : appearance.theme === 'dark'
const toggleTheme = () => setAppearance((current) => ({ ...current, theme: current.theme === 'system' ? 'dark' : current.theme === 'dark' ? 'light' : 'system' }))
  const adjustTextScale = (difference: number) => setAppearance((current) => ({ ...current, textScale: Math.min(1.35, Math.max(0.85, Math.round((current.textScale + difference) * 100) / 100)) }))
  const toggleGrayscale = () => setAppearance((current) => ({ ...current, grayscale: !current.grayscale }))
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const update = (event: MediaQueryListEvent) => setSystemDark(event.matches)
    setSystemDark(media.matches)
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])
  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light'
    document.documentElement.dataset.grayscale = String(appearance.grayscale)
    document.documentElement.style.zoom = String(appearance.textScale)
    localStorage.setItem('finanzia.appearance', JSON.stringify(appearance))
    localStorage.setItem('finanzia.theme', dark ? 'dark' : 'light')
  }, [appearance, dark])
  useEffect(() => {
    const url = new URL(window.location.href)
    const hashParams = new URLSearchParams(url.hash.replace(/^#/, ''))
    const authError = url.searchParams.get('error_description') ?? hashParams.get('error_description')
    const authErrorCode = url.searchParams.get('error_code') ?? hashParams.get('error_code')
    if (authError || authErrorCode) {
      window.history.replaceState({}, '', '/iniciar-sesion')
      setView('signin')
      setModal(null)
      setNotice(authErrorCode === 'otp_expired'
        ? 'Este enlace venció o ya fue usado. Inicia sesión para pedir uno nuevo.'
        : 'No pudimos validar el enlace. Inicia sesión para recibir uno nuevo.')
    }
  }, [])
  useEffect(() => {
    if (!routes[window.location.pathname] && window.location.pathname !== AUTH_CALLBACK_PATH) window.history.replaceState({}, '', '/')
    const onPopState = () => {
      const route = resolveRoute(window.location.pathname)
      setView(route.view)
      setModal(route.modal || null)
      setMobileMenu(false)
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])
  useEffect(() => {
    if (!supabase) return
    supabase.auth.getSession().then(({ data }) => {
      if (window.location.pathname === AUTH_CALLBACK_PATH) window.history.replaceState({}, '', '/')
      setUserEmail(data.session?.user.email ?? null)
      setAuthUserId(data.session?.user.id ?? null)
      if (!data.session && ['/app', '/movimientos', '/pagos', '/configurar-negocio'].includes(window.location.pathname)) {
        window.history.replaceState({}, '', '/iniciar-sesion')
        setView('signin')
        setModal(null)
      }
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user.email ?? null)
      setAuthUserId(session?.user.id ?? null)
    })
    return () => listener.subscription.unsubscribe()
  }, [])
  useEffect(() => {
    if (!authUserId || !supabase) return
    let active = true
    const userId = authUserId
    async function routeAuthenticatedUser() {
      let complete = await hasCompletedOnboarding(userId)
      if (!complete) {
        const { data: { user } } = await supabase!.auth.getUser()
        const pendingAnswers = user?.user_metadata?.finanzia_onboarding
        if (user?.email && isOnboardingData(pendingAnswers)) {
          await saveOnboarding(user.id, user.email, pendingAnswers)
          complete = true
        }
      }
      if (!active) return
      const currentPath = window.location.pathname
      if (['/', '/iniciar-sesion', '/registro', '/verificar-correo', '/configurar-negocio'].includes(currentPath)) {
        const next: View = complete ? 'dashboard' : 'onboarding'
        window.history.replaceState({}, '', pathForView(next))
        setModal(null)
        setView(next)
      }
    }
    routeAuthenticatedUser().catch((error: Error) => { if (active) setNotice(error.message || 'No pudimos revisar tu perfil.') })
    return () => { active = false }
  }, [authUserId, userEmail])
  useEffect(() => {
    if (view !== 'dashboard' && view !== 'movements' && view !== 'payments') return
    let active = true
    loadMovements().then((items) => { if (active) setMovements(items) }).catch((error: Error) => { if (active) setNotice(error.message || 'No fue posible conectar con Supabase.') })
    return () => { active = false }
  }, [view, userEmail])

  async function addMovement(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const movement: Movement = {
      id: crypto.randomUUID(), type: form.get('type') as MovementType,
      description: String(form.get('description')), category: String(form.get('category')),
      amount: Number(form.get('amount')), date: String(form.get('date')),
    }
    setBusy(true)
    try {
      await saveMovement(movement)
      setMovements((items) => [movement, ...items])
      setModal(null)
      setNotice('Movimiento guardado')
      window.setTimeout(() => setNotice(''), 2600)
    } catch (error) { setNotice(error instanceof Error ? error.message : 'No se pudo guardar el movimiento.') }
    finally { setBusy(false) }
  }

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!supabase) return
    const form = new FormData(event.currentTarget)
    const email = String(form.get('email'))
    const password = String(form.get('password'))
    setBusy(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setBusy(false)
    if (error) setNotice('No pudimos iniciar sesión. Revisa tu correo y contraseña.')
    else { setModal(null); setNotice('¡Qué bueno tenerte de vuelta!') }
  }

  async function registerUser(data: RegistrationData) {
    if (!supabase) throw new Error('Conecta Supabase para crear una cuenta.')
    const { email, password } = data
    const answers: OnboardingData = {
      firstName: data.firstName, lastName: data.lastName || '', businessName: data.businessName,
      category: data.category, stage: data.stage, region: data.region || '', comuna: data.comuna || '',
      description: data.description || '', teamSize: data.teamSize, trackingMethod: data.trackingMethod,
      hasInventory: data.hasInventory, mainChallenge: data.mainChallenge, mainGoal: data.mainGoal,
      mainChallengeDetail: data.mainChallengeDetail || '',
      preferredEntry: data.preferredEntry, termsAcceptedAt: data.termsAcceptedAt,
    }
    const callbackUrl = new URL(AUTH_CALLBACK_PATH, window.location.origin).toString()
    setBusy(true)
    try {
      const { data: result, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: callbackUrl, data: { finanzia_onboarding: answers, finanzia_terms_version: FINANZIA_TERMS_VERSION, finanzia_terms_accepted_at: data.termsAcceptedAt || new Date().toISOString() } },
      })
      if (error) throw error
      if (result.user?.identities?.length === 0) throw new Error('Ya existe una cuenta con ese correo. Inicia sesión para continuar.')
      if (result.session && result.user) {
        setUserEmail(email)
        setAuthUserId(result.user.id)
        navigate('onboarding')
      } else {
        setPendingEmail(email)
        navigate('verification-pending')
      }
    } finally { setBusy(false) }
  }

  async function finishOnboarding(answers: OnboardingData) {
    if (!supabase || !authUserId || !userEmail) throw new Error('Vuelve a iniciar sesión para guardar tu perfil.')
    setBusy(true)
    try {
      await saveOnboarding(authUserId, userEmail, answers)
      navigate('dashboard')
      setNotice('Tu espacio quedó listo. ¡Bienvenido/a a FinanzIA!')
    } finally { setBusy(false) }
  }

  async function signOut() {
    if (!supabase) return
    const { error } = await supabase.auth.signOut()
    if (error) setNotice(error.message)
    else { setNotice('Sesión cerrada'); setMovements(initialMovements); navigate('landing') }
  }

  function openAccess() { navigate('signin') }

  function navigate(next: View) {
    window.history.pushState({}, '', pathForView(next))
    setView(next)
    setModal(null)
    setMobileMenu(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return <>
    {view === 'terms' ? <TermsPage /> : view === 'signin' ? <main className="auth-page"><a className="auth-brand" href="/"><Brand /></a><SignInModal onClose={() => navigate('landing')} onSubmit={signIn} onRegister={() => navigate('registration')} busy={busy} configured={supabaseConfigured} /></main> : view === 'landing' ? <Landing dark={dark} toggleTheme={toggleTheme} appearance={appearance} adjustTextScale={adjustTextScale} toggleGrayscale={toggleGrayscale} openSignIn={openAccess} openRegister={() => navigate('registration')} /> :
      view === 'registration' ? <Onboarding registration configured={supabaseConfigured} onRegister={registerUser} busy={busy} onSignOut={() => navigate('landing')} appearance={appearance} adjustTextScale={adjustTextScale} toggleGrayscale={toggleGrayscale} /> :
      view === 'verification-pending' ? <VerificationPending email={pendingEmail} onBack={() => navigate('landing')} onSignIn={openAccess} appearance={appearance} adjustTextScale={adjustTextScale} toggleGrayscale={toggleGrayscale} /> :
      view === 'onboarding' ? <Onboarding userEmail={userEmail || ''} onComplete={finishOnboarding} busy={busy} onSignOut={signOut} configured={supabaseConfigured} appearance={appearance} adjustTextScale={adjustTextScale} toggleGrayscale={toggleGrayscale} /> :
      <Workspace view={view} navigate={navigate} movements={movements} openMovement={() => setModal('movement')} dark={dark} toggleTheme={toggleTheme} appearance={appearance} adjustTextScale={adjustTextScale} toggleGrayscale={toggleGrayscale} userEmail={userEmail} openSignIn={openAccess} signOut={signOut} mobileMenu={mobileMenu} setMobileMenu={setMobileMenu} />}
    {modal === 'movement' && <MovementModal onClose={() => setModal(null)} onSubmit={addMovement} busy={busy} />}
    {notice && <div className="toast"><Check size={16} />{notice}<button onClick={() => setNotice('')} aria-label="Cerrar aviso"><X size={14} /></button></div>}
  </>
}

function DisplayControls({ appearance, adjustTextScale, toggleGrayscale }: { appearance: Appearance; adjustTextScale: (difference: number) => void; toggleGrayscale: () => void }) {
  return <div className="display-controls" aria-label="Controles de visualización">
    <button type="button" onClick={() => adjustTextScale(-0.1)} disabled={appearance.textScale <= 0.85} aria-label="Disminuir tamaño de letra" title="Disminuir tamaño de letra">A−</button>
    <button type="button" onClick={() => adjustTextScale(0.1)} disabled={appearance.textScale >= 1.35} aria-label={`Aumentar tamaño de letra, actual ${Math.round(appearance.textScale * 100)} por ciento`} title="Aumentar tamaño de letra">A+</button>
    <button type="button" className={`grayscale-toggle ${appearance.grayscale ? 'active' : ''}`} onClick={toggleGrayscale} aria-label={appearance.grayscale ? 'Desactivar escala de grises' : 'Activar escala de grises'} aria-pressed={appearance.grayscale} title={appearance.grayscale ? 'Desactivar escala de grises' : 'Activar escala de grises'}><span aria-hidden="true" /></button>
    <span className="visually-hidden" aria-live="polite">Tamaño de letra: {Math.round(appearance.textScale * 100)} por ciento. Escala de grises {appearance.grayscale ? 'activada' : 'desactivada'}.</span>
  </div>
}

function Landing({ dark, toggleTheme, appearance, adjustTextScale, toggleGrayscale, openSignIn, openRegister }: { dark: boolean; toggleTheme: () => void; appearance: Appearance; adjustTextScale: (difference: number) => void; toggleGrayscale: () => void; openSignIn: () => void; openRegister: () => void }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  return <div className="landing">
    <header className="site-header wrap">
      <Brand />
      <nav className="landing-nav"><a href="#como-funciona">Cómo funciona</a><a href="#para-ti">Hecho para tu negocio</a></nav>
      <div className="header-actions"><DisplayControls appearance={appearance} adjustTextScale={adjustTextScale} toggleGrayscale={toggleGrayscale} /><button className="icon-btn theme-toggle" onClick={toggleTheme} aria-label="Cambiar tema entre automático, claro y oscuro" title="Tema automático, claro u oscuro">{dark ? <Sun size={18} /> : <Moon size={18} />}</button><button className="text-button login-link" onClick={openSignIn}>Iniciar sesión</button><button className="button button-primary header-cta" onClick={openRegister}>Crear cuenta gratis <ArrowRight size={16} /></button><button className="menu-btn" aria-label={mobileNavOpen ? 'Cerrar menú' : 'Abrir menú'} aria-expanded={mobileNavOpen} onClick={() => setMobileNavOpen((open) => !open)}>{mobileNavOpen ? <X size={20} /> : <Menu size={20} />}</button></div>
    </header>
    {mobileNavOpen && <nav className="mobile-nav wrap" aria-label="Menú principal"><a href="#como-funciona" onClick={() => setMobileNavOpen(false)}>Cómo funciona</a><a href="#para-ti" onClick={() => setMobileNavOpen(false)}>Hecho para tu negocio</a><button onClick={() => { setMobileNavOpen(false); openSignIn() }}>Iniciar sesión</button><button className="button button-primary" onClick={() => { setMobileNavOpen(false); openRegister() }}>Crear cuenta gratis <ArrowRight size={15} /></button></nav>}
    <main>
      <section className="hero wrap">
        <div className="hero-copy">
          <div className="eyebrow"><Sparkles size={14} /> TE PRESENTO FINANZIA · FINANZAS PARA PYMES</div>
          <h1>Tus cuentas,<br /><span>en claro.</span></h1>
          <p>Clientes, compras, pagos: el día se llena y las cuentas quedan para después. FinanzIA reúne tus movimientos y prepara ayuda con IA para que puedas entender tu caja y revisar lo que viene.</p>
          <div className="hero-actions"><button className="button button-primary button-large" onClick={openRegister}>Ordenar mi pyme <ArrowRight size={17} /></button><a className="quiet-link" href="#como-funciona">Conoce el recorrido <ArrowDownLeft size={15} /></a></div>
          <div className="hero-proof"><span>Para quienes llevan un negocio<br />a pulso, todos los días</span><span className="proof-divider" /><span className="secure-proof"><ShieldCheck size={16} /> Tu negocio, a tu ritmo</span></div>
        </div>
        <div className="hero-concept" role="img" aria-label="Ilustración conceptual: FinanzIA ordena movimientos, aclara la situación del negocio y sugiere próximos pasos">
          <div className="concept-orbit concept-orbit-one" /><div className="concept-orbit concept-orbit-two" />
          <article className="concept-node concept-node-input"><span className="concept-node-icon lavender-icon"><ClipboardList size={23} /></span><b>Lo que pasa</b><small>Ventas · compras · pagos</small><div className="concept-lines"><i /><i /><i /></div></article>
          <article className="concept-node concept-node-clarity"><span className="concept-node-icon peach-icon"><BarChart3 size={23} /></span><b>Más orden</b><small>Tu negocio, más claro</small><div className="concept-bars"><i /><i /><i /><i /><i /><i /></div></article>
          <article className="concept-node concept-node-next"><span className="concept-node-icon mint-icon"><Sparkles size={22} /></span><b>Un próximo paso</b><small>Ideas simples para avanzar</small></article>
          <span className="hero-spark spark-one">✳</span><span className="hero-spark spark-two">✦</span>
        </div>
      </section>
      <section className="section how-section" id="como-funciona"><div className="wrap"><div className="section-heading"><div className="eyebrow">ASÍ TE ACOMPAÑO</div><h2>De lo que pasa en tu negocio<br />a lo que puedes hacer después.</h2><p>Un recorrido sencillo para que los números dejen de ser un montón de datos y empiecen a servirte en el día a día.</p></div>
        <div className="steps-grid"><article className="step-card"><span className="step-number">01</span><div className="step-icon lavender-icon"><ClipboardList size={22} /></div><h3>Registra tus movimientos</h3><p>Anota ventas, compras y pagos desde el teléfono o computador, y mantén la información de tu negocio en un solo lugar.</p><div className="step-visual concept-mini mini-register" role="img" aria-label="Ilustración de registro de una venta, una compra y un pago"><span className="mini-flow-item"><ArrowDownLeft size={15} /> Venta</span><span className="mini-flow-item"><ArrowUpRight size={15} /> Compra</span><span className="mini-flow-item"><CreditCard size={15} /> Pago</span></div></article>
          <article className="step-card"><span className="step-number">02</span><div className="step-icon peach-icon"><Eye size={22} /></div><h3>Entiende cómo va tu caja</h3><p>Revisa lo que ha entrado y salido, qué pagos se acercan y cómo se relacionan tus movimientos.</p><div className="step-visual concept-mini mini-summary" role="img" aria-label="Ilustración de ingresos y gastos que forman una vista general"><span>Ingresos</span><i /><span>Gastos</span><i /><b><Eye size={16} /> Vista clara del negocio</b></div></article>
          <article className="step-card"><span className="step-number">03</span><div className="step-icon mint-icon"><Sparkles size={22} /></div><h3>Apóyate en la IA</h3><p>Con tus movimientos como contexto, la IA podrá sugerir categorías, explicar cómo va tu caja y ayudarte a tener pagos próximos a la vista. Tú revisas y decides.</p><div className="step-visual ai-preview"><span className="ai-preview-label"><Sparkles size={13} /> PRUEBA PREGUNTAR</span><b>¿Qué pagos se acercan?</b><small>FinanzIA te responde usando la información de tu negocio.</small></div></article></div>
      </div></section>
      <section className="section audience-section" id="para-ti"><div className="wrap audience-wrap"><div className="audience-copy"><div className="eyebrow">HECHA PARA TU DÍA A DÍA</div><h2>No tienes que ser experto.<br /><span>Solo conocer tu negocio.</span></h2><p>Vendas productos, ofrezcas servicios o estés recién empezando, puedes partir con lo que ya sabes. FinanzIA te acompaña a ordenar tus cuentas paso a paso.</p><ul><li><span><Check size={14} /></span> Registra ventas, compras y pagos en un solo lugar</li><li><span><Check size={14} /></span> Distingue lo personal de lo que es de tu pyme</li><li><span><Check size={14} /></span> Revisa qué pagos se acercan y planifica</li></ul><button className="button button-primary" onClick={openRegister}>Empezar con mi pyme <ArrowRight size={16} /></button></div><div className="audience-card concept-route" role="img" aria-label="Ilustración conceptual de FinanzIA: registrar, entender y planificar"><span className="category-chip">TU NEGOCIO, PASO A PASO</span><div className="route-step"><span className="route-icon lavender-icon"><ClipboardList size={18} /></span><span><b>Registrar</b><small>Anotar lo que pasa</small></span><span className="route-number">01</span></div><div className="route-link" /><div className="route-step"><span className="route-icon peach-icon"><Eye size={18} /></span><span><b>Entender</b><small>Ver el panorama</small></span><span className="route-number">02</span></div><div className="route-link" /><div className="route-step"><span className="route-icon mint-icon"><Sparkles size={18} /></span><span><b>Planificar</b><small>Elegir el próximo paso</small></span><span className="route-number">03</span></div><div className="card-blob" /></div></div></section>
      <section className="closing-cta"><div className="wrap cta-inner"><div className="cta-flower">✳</div><div><div className="eyebrow">PARTAMOS POR TU NEGOCIO</div><h2>Tus cuentas más claras.<br /><span>Tú, con más espacio para crecer.</span></h2><p>Cuéntame de tu pyme. Armemos un espacio que te ayude a llevar sus finanzas a tu manera.</p></div><button className="button button-light button-large" onClick={openRegister}>Crear mi espacio <ArrowRight size={17} /></button><span className="cta-star">✦</span></div></section>
    </main>
    <footer className="site-footer"><div className="wrap footer-inner"><Brand /><span>Hecho con cariño para los negocios que mueven Chile.</span><span>© 2026 FinanzIA</span></div></footer>
  </div>
}

function Workspace({ view, navigate, movements, openMovement, dark, toggleTheme, appearance, adjustTextScale, toggleGrayscale, userEmail, openSignIn, signOut, mobileMenu, setMobileMenu }: { view: WorkspaceView; navigate: (view: View) => void; movements: Movement[]; openMovement: () => void; dark: boolean; toggleTheme: () => void; appearance: Appearance; adjustTextScale: (difference: number) => void; toggleGrayscale: () => void; userEmail: string | null; openSignIn: () => void; signOut: () => void; mobileMenu: boolean; setMobileMenu: (open: boolean) => void }) {
  const income = movements.filter((item) => item.type === 'income').reduce((sum, item) => sum + item.amount, 0)
  const expense = movements.filter((item) => item.type === 'expense').reduce((sum, item) => sum + item.amount, 0)
  const balance = income - expense
  const nav = [{ id: 'dashboard' as const, label: 'Resumen', icon: BarChart3 }, { id: 'movements' as const, label: 'Movimientos', icon: ArrowUpRight }, { id: 'payments' as const, label: 'Pagos próximos', icon: CreditCard }]
  const label = view === 'dashboard' ? 'Resumen' : view === 'movements' ? 'Movimientos' : 'Pagos próximos'
  return <div className="workspace">
    <aside className={`sidebar ${mobileMenu ? 'sidebar-open' : ''}`}><div className="side-top"><button className="brand-button" onClick={() => navigate('landing')}><Brand /></button><button className="mobile-close" aria-label="Cerrar menú" onClick={() => setMobileMenu(false)}><X size={18} /></button></div><div className="business-switch"><span className="business-avatar">M</span><span><b>Mi negocio</b><small>Finanzas de tu PYME</small></span><ChevronDown size={15} /></div><div className="nav-caption">MENÚ</div><nav className="side-nav">{nav.map((item) => <button key={item.id} className={`side-link ${view === item.id ? 'active' : ''}`} onClick={() => navigate(item.id)}><item.icon size={17} /><span>{item.label}</span></button>)}</nav><div className="sidebar-bottom"><div className="help-card"><div><CircleHelp size={17} /><b>¿Necesitas ayuda?</b></div><p>Estamos aquí para acompañarte.</p><button onClick={() => navigate('landing')}>Conoce FinanzIA <ArrowRight size={13} /></button></div><button className="profile-button" onClick={userEmail ? signOut : openSignIn}><span className="profile-avatar">{userEmail ? userEmail[0].toUpperCase() : 'F'}</span><span><b>{userEmail || 'Tu espacio'}</b><small>{userEmail ? 'Cerrar sesión' : 'Datos en este dispositivo'}</small></span><ChevronDown size={14} /></button></div></aside>
    {mobileMenu && <button className="sidebar-scrim" aria-label="Cerrar menú" onClick={() => setMobileMenu(false)} />}
    <main className="workspace-main"><header className="workspace-header"><button className="menu-btn workspace-menu" onClick={() => setMobileMenu(true)} aria-label="Abrir menú" aria-expanded={mobileMenu}><Menu size={20} /></button><div><div className="breadcrumb">FinanzIA <span>/</span> <b>{label}</b></div><h1>{view === 'dashboard' ? 'Tu negocio, en perspectiva' : view === 'movements' ? 'Tus movimientos' : 'Pagos en el horizonte'}</h1></div><div className="workspace-actions"><DisplayControls appearance={appearance} adjustTextScale={adjustTextScale} toggleGrayscale={toggleGrayscale} /><button className="icon-btn theme-toggle" onClick={toggleTheme} aria-label="Cambiar tema entre automático, claro y oscuro" title="Tema automático, claro u oscuro">{dark ? <Sun size={18} /> : <Moon size={18} />}</button><button className="icon-btn notification-btn" aria-label="Notificaciones"><Bell size={18} /><i /></button><button className="button button-primary header-add" onClick={openMovement}><Plus size={16} /> Nuevo movimiento</button></div></header>
      <div className="workspace-content">
        {view === 'dashboard' && <><div className="welcome-banner"><div><span className="welcome-kicker">{todayLong()} <span>✦</span></span><h2>Hola, qué bueno verte por aquí.</h2><p>Un paso pequeño hoy puede darte más claridad mañana.</p></div><span className="welcome-doodle">✳</span></div>
          <div className="metric-grid"><MetricCard title="Diferencia registrada" value={clp.format(balance)} caption="Ingresos menos gastos registrados" icon={Wallet} variant="purple" trend={movements.length ? 'Actividad registrada' : 'Aún sin registros'} /><MetricCard title="Ingresos" value={clp.format(income)} caption="En los movimientos visibles" icon={ArrowDownLeft} variant="green" trend="Entradas registradas" /><MetricCard title="Gastos" value={clp.format(expense)} caption="En los movimientos visibles" icon={ArrowUpRight} variant="peach" trend="Salidas registradas" /></div>
          <div className="dashboard-grid"><section className="panel flow-panel"><div className="panel-heading"><div><h3>Así se mueve tu negocio</h3><p>Un vistazo a tus ingresos y gastos</p></div><select aria-label="Período del resumen" defaultValue="este-mes"><option value="este-mes">Este mes <ChevronDown size={12} /></option><option value="todo">Todo el período</option></select></div>{movements.length > 0 && <div className="chart-legend"><span><i className="legend-income" /> Ingresos</span><span><i className="legend-expense" /> Gastos</span></div>}<div className="chart-area"><div className="chart-empty"><BarChart3 size={25} /><b>{movements.length ? "Tus movimientos están listos para analizar" : "Empieza con tu primer movimiento"}</b><p>{movements.length ? "El resumen financiero se irá completando con tus registros." : "Al registrar ingresos y gastos, tendrás una vista clara de tu negocio."}</p></div></div><div className="chart-foot"><span><i /> Cada registro hace más claro este panorama.</span><button onClick={() => navigate('movements')}>Ver movimientos <ArrowRight size={14} /></button></div></section>
            <section className="panel payments-panel"><div className="panel-heading"><div><h3>Pagos próximos</h3><p>Para que nada te pille de sorpresa</p></div><button className="more-button" aria-label="Más opciones">•••</button></div><div className="payments-empty"><CreditCard size={22} /><b>Aún no hay pagos programados</b><small>Los compromisos de tu negocio aparecerán aquí.</small></div><button className="all-payments" onClick={() => navigate('payments')}>Ver todos los pagos <ArrowRight size={14} /></button><div className="reserve-tip"><span><Sparkles size={15} /></span><p><b>Una idea:</b> separar un poquito cada semana puede ayudarte a llegar con calma.</p></div></section></div>
          <div className="bottom-grid"><section className="panel movements-panel"><div className="panel-heading"><div><h3>Movimientos recientes</h3><p>Lo último que anotaste en tu negocio</p></div><button className="subtle-link" onClick={() => navigate('movements')}>Ver todos <ArrowRight size={14} /></button></div><MovementTable movements={movements.slice(0, 4)} /></section><section className="growth-card"><div className="growth-orb" /><span className="growth-icon"><Sparkles size={18} /></span><span className="growth-label">UN DATO PARA TI</span><h3>Los pequeños registros<br />forman una gran imagen.</h3><p>Cuando anotas cada movimiento, es más fácil entender qué está pasando con tu caja.</p><button onClick={() => navigate('movements')}>Seguir ordenando <ArrowRight size={14} /></button></section></div>
        </>}
        {view === 'movements' && <section className="panel full-panel"><div className="panel-heading"><div><h3>Todos tus movimientos</h3><p>Ingresos y gastos anotados en tu espacio</p></div><div className="movement-tools"><button className="outline-button" onClick={() => exportCSV(movements)}><FileDown size={15} /> Descargar</button><button className="button button-primary" onClick={openMovement}><Plus size={16} /> Nuevo movimiento</button></div></div><MovementTable movements={movements} /></section>}
        {view === 'payments' && <div className="payments-page-grid"><section className="panel full-panel"><div className="panel-heading"><div><h3>Lo que viene</h3><p>Tus compromisos de pago en un solo lugar</p></div><button className="outline-button" onClick={() => navigate('dashboard')}><ArrowLeft size={15} /> Volver al resumen</button></div><div className="payments-empty"><CreditCard size={24} /><b>Aún no hay pagos programados</b><small>Cuando registres un compromiso, podrás consultarlo aquí.</small></div><div className="empty-hint"><Bell size={17} /><span>Los pagos que registres aparecerán en esta lista.</span></div></section><div className="debt-tip"><CreditCard size={19} /><h3>Planifica con tiempo</h3><p>Cuando anotas una fecha de pago y su monto, puedes considerar ese compromiso al revisar tu caja.</p><small>FinanzIA acompaña tu organización. Las proyecciones dependen de la información que registres.</small></div></div>}
      </div>
    </main>
  </div>
}

const regionsOfChile = ['Arica y Parinacota', 'Tarapacá', 'Antofagasta', 'Atacama', 'Coquimbo', 'Valparaíso', 'Metropolitana de Santiago', "Libertador General Bernardo O’Higgins", 'Maule', 'Ñuble', 'Biobío', 'La Araucanía', 'Los Ríos', 'Los Lagos', 'Aysén', 'Magallanes y la Antártica Chilena']

function Onboarding({ userEmail = '', onComplete, onRegister, busy, onSignOut, appearance, adjustTextScale, toggleGrayscale, registration = false, configured = true }: { userEmail?: string; onComplete?: (answers: OnboardingData) => Promise<void>; onRegister?: (data: RegistrationData) => Promise<void>; busy: boolean; onSignOut: () => void; appearance: Appearance; adjustTextScale: (difference: number) => void; toggleGrayscale: () => void; registration?: boolean; configured?: boolean }) {
  const [step, setStep] = useState(1)
  const [answers, setAnswers] = useState<Partial<OnboardingData>>({})
  const [mainChallenge, setMainChallenge] = useState('')
  const [mainChallengeDetail, setMainChallengeDetail] = useState('')
  const [error, setError] = useState('')
  const totalSteps = registration ? 4 : 3

  function readForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    return Object.fromEntries(new FormData(event.currentTarget).entries()) as Record<string, string>
  }

  function nextStep(event: FormEvent<HTMLFormElement>) {
    const values = readForm(event)
    setAnswers((current) => ({ ...current, ...values, ...(values.termsAccepted === 'on' ? { termsAcceptedAt: new Date().toISOString() } : {}) }))
    setError('')
    setStep((current) => current + 1)
  }

  async function finish(event: FormEvent<HTMLFormElement>) {
    const values = readForm(event)
    const completed = { ...answers, ...values, termsAcceptedAt: answers.termsAcceptedAt || new Date().toISOString() } as OnboardingData
    setAnswers(completed)
    setError('')
    try { await onComplete?.(completed) }
    catch (submitError) { setError(submitError instanceof Error ? submitError.message : 'No pudimos guardar tu perfil. Inténtalo nuevamente.') }
  }

  async function finishRegistration(event: FormEvent<HTMLFormElement>) {
    const values = readForm(event)
    if (values.password !== values.confirmPassword) { setError('Las contraseñas no coinciden. Revísalas para continuar.'); return }
    const { confirmPassword: _confirmPassword, ...credentials } = values
    const completed = { ...answers, ...credentials, termsAcceptedAt: answers.termsAcceptedAt || new Date().toISOString() } as RegistrationData
    setAnswers(completed)
    setError('')
    try { await onRegister?.(completed) }
    catch (submitError) { setError(submitError instanceof Error ? submitError.message : 'No pudimos crear tu cuenta. Inténtalo nuevamente.') }
  }

  return <main className="onboarding-page">
    <header className="onboarding-header"><Brand /><div className="onboarding-header-actions"><DisplayControls appearance={appearance} adjustTextScale={adjustTextScale} toggleGrayscale={toggleGrayscale} /><button className="text-button" onClick={onSignOut}>{registration ? 'Volver' : 'Salir de mi cuenta'}</button></div></header>
    <div className="onboarding-shell"><section className="onboarding-card" aria-labelledby="onboarding-title">
      <div className="onboarding-topline"><span className="onboarding-kicker"><Sparkles size={14} /> TU ESPACIO, A TU MEDIDA</span><span className="step-counter">0{step} <i>/ 0{totalSteps}</i></span></div>
      <div className="step-progress" aria-label={`Paso ${step} de ${totalSteps}`}>{Array.from({ length: totalSteps }, (_, index) => index + 1).map((number) => <i className={number <= step ? 'done' : ''} key={number} />)}</div>
      {step === 1 && <form className="onboarding-form" onSubmit={nextStep}>
        <div className="onboarding-title"><span className="onboarding-icon"><Store size={20} /></span><h1 id="onboarding-title">Partamos por conocerte</h1><p>Con unos datos básicos adaptaremos FinanzIA a tu negocio.</p></div>
        <label>¿Cómo te llamas?<input name="firstName" required maxLength={60} defaultValue={answers.firstName} placeholder="Tu nombre" autoComplete="given-name" /></label>
        <label>¿Cómo se llama tu negocio?<input name="businessName" required maxLength={100} defaultValue={answers.businessName} placeholder="Nombre del negocio o proyecto" autoComplete="organization" /></label>
        <div className="onboarding-row"><label>¿A qué se dedica?<select name="category" required defaultValue={answers.category || ''}><option value="" disabled>Elige un rubro</option>{['Comercio y venta de productos', 'Servicios profesionales', 'Alimentos y gastronomía', 'Artesanía y producción', 'Belleza y cuidado personal', 'Transporte y delivery', 'Servicios técnicos y reparación', 'Otro'].map((item) => <option key={item}>{item}</option>)}</select></label><label>¿En qué etapa está?<select name="stage" required defaultValue={answers.stage || ''}><option value="" disabled>Elige una etapa</option><option value="idea">Estoy preparando una idea</option><option value="occasional">Vendo u ofrezco servicios ocasionalmente</option><option value="operating">El negocio ya está funcionando</option></select></label></div>
        <div className="onboarding-row"><label>Región <span>(opcional)</span><select name="region" defaultValue={answers.region || ''}><option value="">Prefiero no indicarla</option>{regionsOfChile.map((region) => <option key={region}>{region}</option>)}</select></label><label>Comuna <span>(opcional)</span><input name="comuna" maxLength={80} defaultValue={answers.comuna} placeholder="Ej. Maipú" autoComplete="address-level2" /></label></div>
        <div className="onboarding-footer"><span>1 de 3 · toma cerca de 2 minutos</span><button className="button button-primary" type="submit">Continuar <ArrowRight size={16} /></button></div>
      </form>}
      {step === 2 && <form className="onboarding-form" onSubmit={nextStep}>
        <div className="onboarding-title"><span className="onboarding-icon"><Wallet size={20} /></span><h1 id="onboarding-title">Cuéntanos cómo funciona</h1><p>Así podremos dar ejemplos y sugerencias más cercanos a tu día a día.</p></div>
        <label>¿Qué vendes o qué servicio ofreces? <span>(opcional)</span><textarea name="description" maxLength={220} defaultValue={answers.description} placeholder="Por ejemplo: preparo tortas por encargo o hago reparaciones de bicicletas." rows={3} /></label>
        <div className="onboarding-row"><label>¿Cuántas personas trabajan en el negocio?<select name="teamSize" required defaultValue={answers.teamSize || ''}><option value="" disabled>Elige una opción</option><option value="solo">Solo yo</option><option value="2-5">2 a 5 personas</option><option value="6-10">6 a 10 personas</option><option value="11+">Más de 10 personas</option></select></label><label>¿Cómo llevas tus cuentas hoy?<select name="trackingMethod" required defaultValue={answers.trackingMethod || ''}><option value="" disabled>Elige una opción</option><option value="notebook">Cuaderno o papel</option><option value="spreadsheet">Excel o una planilla</option><option value="bank">Reviso mi cuenta o medio de pago</option><option value="memory">Lo recuerdo de memoria</option><option value="none">Todavía no llevo registro</option><option value="other">Otra aplicación o método</option></select></label></div>
        <fieldset className="choice-fieldset"><legend>¿Necesitas controlar productos o insumos?</legend><div className="choice-cards"><label className={answers.hasInventory === 'yes' ? 'choice-card selected' : 'choice-card'}><input type="radio" name="hasInventory" value="yes" required defaultChecked={answers.hasInventory === 'yes'} /><span><b>Sí</b><small>Productos o materiales</small></span></label><label className={answers.hasInventory === 'no' ? 'choice-card selected' : 'choice-card'}><input type="radio" name="hasInventory" value="no" required defaultChecked={answers.hasInventory === 'no'} /><span><b>No</b><small>Solo servicios u otro</small></span></label></div></fieldset>
        <div className="onboarding-footer"><button className="back-step" type="button" onClick={() => setStep(1)}><ChevronLeft size={16} /> Atrás</button><span>2 de 3</span><button className="button button-primary" type="submit">Continuar <ArrowRight size={16} /></button></div>
      </form>}
      {step === 3 && <form className="onboarding-form" onSubmit={registration ? nextStep : finish}>
        <div className="onboarding-title"><span className="onboarding-icon"><Sparkles size={20} /></span><h1 id="onboarding-title">¿En qué te gustaría avanzar?</h1><p>Estas respuestas darán contexto a futuras ayudas de IA. Puedes cambiar tus preferencias después.</p></div>
        <label>¿Qué te cuesta más hoy?<select name="mainChallenge" required value={mainChallenge || answers.mainChallenge || ''} onChange={(event) => { setMainChallenge(event.target.value); if (event.target.value !== 'other') setMainChallengeDetail('') }}><option value="" disabled>Elige lo más importante</option><option value="know_profit">Saber cuánto estoy ganando realmente</option><option value="recording">Mantener ingresos y gastos al día</option><option value="separation">Separar la plata personal y la del negocio</option><option value="payments">Prepararme para pagos y deudas</option><option value="inventory">Controlar productos, materiales o compras</option><option value="starting">Planificar antes de empezar</option><option value="other">Otra cosa</option></select></label>
        {(mainChallenge || answers.mainChallenge) === 'other' && <label className="onboarding-other-challenge">¿Qué otra cosa te cuesta más en tu negocio?<input name="mainChallengeDetail" value={mainChallengeDetail || answers.mainChallengeDetail || ''} onChange={(event) => setMainChallengeDetail(event.target.value)} placeholder="Cuéntanos brevemente" maxLength={180} required /></label>}
        <div className="onboarding-row"><label>¿Qué te sería más útil?<select name="mainGoal" required defaultValue={answers.mainGoal || ''}><option value="" disabled>Elige una prioridad</option><option value="organize">Tener todo ordenado en un lugar</option><option value="profit">Entender ingresos, gastos y ganancia</option><option value="cash">Saber cuánto puedo usar o reservar</option><option value="payments">No olvidar pagos próximos</option><option value="accountant">Compartir información con mi contador</option><option value="start_plan">Armar un plan paso a paso</option></select></label><label>¿Cómo preferirías anotar un movimiento?<select name="preferredEntry" required defaultValue={answers.preferredEntry || ''}><option value="" disabled>Elige cómo te acomoda</option><option value="form">Un formulario o tabla</option><option value="chat">Escribirlo en un chat</option><option value="voice">Dictarlo con mi voz</option><option value="automatic">Que se registre automáticamente</option><option value="unsure">Todavía no estoy seguro/a</option></select></label></div>
        <div className="terms-acceptance"><label className="terms-check"><input name="termsAccepted" type="checkbox" required defaultChecked={Boolean(answers.termsAcceptedAt)} /><span>Autorizo el tratamiento de mis datos para gestionar mi cuenta y usar FinanzIA, según la política de privacidad, y acepto los términos de uso.</span></label><a href="/terminos-y-condiciones" target="_blank" rel="noopener noreferrer">Leer términos y política de privacidad en otra pestaña <ArrowRight size={14} /></a></div>
        {error && <p className="onboarding-error" role="alert">{error}</p>}
        <div className="onboarding-footer"><button className="back-step" type="button" onClick={() => setStep(2)}><ChevronLeft size={16} /> Atrás</button><span>3 de 0{totalSteps}</span><button className="button button-primary" type="submit" disabled={busy}>{registration ? 'Continuar' : busy ? 'Guardando tu espacio…' : 'Guardar mi perfil'} <ArrowRight size={16} /></button></div>
      </form>}
      {registration && step === 4 && <form className="onboarding-form" onSubmit={finishRegistration}>
        <div className="onboarding-title"><span className="onboarding-icon"><LockKeyhole size={20} /></span><h1 id="onboarding-title">Ya sabemos más de tu negocio</h1><p>Ahora crea tu acceso. Al terminar, enviaremos un enlace para verificar tu correo.</p></div>
        <label>Correo electrónico<input name="email" type="email" required autoComplete="email" placeholder="tu@negocio.cl" /></label>
        <div className="onboarding-row"><label>Contraseña<input name="password" type="password" required minLength={8} autoComplete="new-password" placeholder="Al menos 8 caracteres" /></label><label>Repite tu contraseña<input name="confirmPassword" type="password" required minLength={8} autoComplete="new-password" placeholder="Escríbela nuevamente" /></label></div>
        {!configured && <p className="onboarding-error" role="alert">El acceso aún no está conectado. Tus respuestas no se enviarán hasta completar esta configuración.</p>}
        {error && <p className="onboarding-error" role="alert">{error}</p>}
        <div className="onboarding-footer"><button className="back-step" type="button" onClick={() => { setError(''); setStep(3) }}><ChevronLeft size={16} /> Atrás</button><span>4 de 04</span><button className="button button-primary" type="submit" disabled={busy || !configured}>{busy ? 'Creando tu cuenta…' : 'Crear cuenta y verificar correo'} <ArrowRight size={16} /></button></div>
      </form>}
      <div className="onboarding-secure"><LockKeyhole size={14} /><span>Tu perfil es privado y solo tú puedes acceder a él.</span></div>
    </section>{!registration && <p className="onboarding-email">Vas a crear tu espacio con <b>{userEmail}</b></p>}</div>
  </main>
}

function MetricCard({ title, value, caption, icon: Icon, variant, trend }: { title: string; value: string; caption: string; icon: typeof Wallet; variant: string; trend: string }) {
  return <article className="metric-card"><div className={`metric-icon ${variant}`}><Icon size={19} /></div><span className="metric-title">{title}</span><b className="metric-value">{value}</b><span className="metric-caption">{caption}</span><span className="metric-trend"><i />{trend}</span></article>
}

function VerificationPending({ email, onBack, onSignIn, appearance, adjustTextScale, toggleGrayscale }: { email: string; onBack: () => void; onSignIn: () => void; appearance: Appearance; adjustTextScale: (difference: number) => void; toggleGrayscale: () => void }) {
  return <main className="onboarding-page"><header className="onboarding-header"><Brand /><div className="onboarding-header-actions"><DisplayControls appearance={appearance} adjustTextScale={adjustTextScale} toggleGrayscale={toggleGrayscale} /><button className="text-button" onClick={onBack}>Volver al inicio</button></div></header><div className="onboarding-shell"><section className="onboarding-card verification-card"><div className="onboarding-title"><span className="onboarding-icon"><Check size={20} /></span><h1>Tu negocio ya tiene contexto</h1><p>Te enviamos un enlace de verificación a <b>{email}</b>. Ábrelo para activar tu cuenta y entrar a FinanzIA.</p></div><div className="verification-note"><LockKeyhole size={16} /><span>La verificación es el último paso. Tus respuestas se guardaron de forma segura y estarán listas cuando vuelvas.</span></div><button className="button button-primary signin-submit" onClick={onSignIn}>Ya verifiqué mi correo <ArrowRight size={16} /></button><button className="text-button verification-back" onClick={onBack}>Revisar el correo o empezar de nuevo</button></section></div></main>
}

function MovementTable({ movements }: { movements: Movement[] }) {
  if (!movements.length) return <div className="table-empty"><span>✦</span><b>Tus movimientos aparecerán aquí</b><p>Anota tu primer ingreso o gasto para empezar a ver tu negocio con más claridad.</p></div>
  return <div className="table-scroll"><table className="movement-table"><thead><tr><th>Movimiento</th><th>Categoría</th><th>Fecha</th><th className="amount-cell">Monto</th></tr></thead><tbody>{movements.map((item) => <tr key={item.id}><td><span className={`movement-type-icon ${item.type}`} >{item.type === 'income' ? <ArrowDownLeft size={15} /> : <ArrowUpRight size={15} />}</span><b>{item.description}</b></td><td><span className="table-category">{item.category}</span></td><td className="date-cell">{shortDate(item.date)}</td><td className={`amount-cell ${item.type}`}>{item.type === 'income' ? '+' : '−'}{clp.format(item.amount)}</td></tr>)}</tbody></table></div>
}

function MovementModal({ onClose, onSubmit, busy }: { onClose: () => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void; busy: boolean }) {
  const [type, setType] = useState<MovementType>('income')
  const categories = type === 'income' ? incomeCategories : expenseCategories
  return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}><section className="modal-card" role="dialog" aria-modal="true" aria-labelledby="movement-title"><div className="modal-head"><div><span className="modal-kicker">TU NEGOCIO, TUS CUENTAS</span><h2 id="movement-title">Anota un movimiento</h2></div><button className="icon-btn" onClick={onClose} aria-label="Cerrar"><X size={18} /></button></div><form onSubmit={onSubmit}><div className="type-toggle"><button type="button" className={type === 'income' ? 'selected income-selected' : ''} onClick={() => setType('income')}><ArrowDownLeft size={15} /> Ingreso</button><button type="button" className={type === 'expense' ? 'selected expense-selected' : ''} onClick={() => setType('expense')}><ArrowUpRight size={15} /> Gasto</button></div><input type="hidden" name="type" value={type} /><label>¿Qué fue?<input name="description" placeholder={type === 'income' ? 'Ej. Venta de productos' : 'Ej. Compra de materiales'} required maxLength={120} /></label><div className="form-row"><label>Monto en pesos<input name="amount" type="number" min="1" step="1" placeholder="0" required /></label><label>Fecha<input name="date" type="date" defaultValue={todayISO()} required /></label></div><label>Categoría<select key={type} name="category" defaultValue={categories[0]}>{categories.map((category) => <option key={category}>{category}</option>)}</select></label><div className="modal-note"><ShieldCheck size={16} /><span>Los montos se guardan en pesos chilenos. Revisa que los datos estén correctos antes de guardar.</span></div><div className="modal-actions"><button className="outline-button" type="button" onClick={onClose}>Cancelar</button><button className="button button-primary" type="submit" disabled={busy}>{busy ? 'Guardando…' : 'Guardar movimiento'} <ArrowRight size={15} /></button></div></form></section></div>
}

function SignInModal({ onClose, onSubmit, onRegister, busy, configured }: { onClose: () => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void; onRegister: () => void; busy: boolean; configured: boolean }) {
  return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}><section className="modal-card signin-card" role="dialog" aria-modal="true" aria-labelledby="signin-title"><div className="modal-head"><div><span className="modal-kicker">QUÉ BUENO TENERTE DE VUELTA</span><h2 id="signin-title">Entra a tu espacio</h2></div><button className="icon-btn" onClick={onClose} aria-label="Cerrar"><X size={18} /></button></div>{configured ? <form onSubmit={onSubmit}><p className="signin-copy">Ingresa con el correo y la contraseña que elegiste al crear tu cuenta.</p><label>Correo electrónico<input name="email" type="email" placeholder="tu@negocio.cl" autoComplete="email" required /></label><label>Contraseña<input name="password" type="password" autoComplete="current-password" required /></label><button className="button button-primary signin-submit" disabled={busy}>{busy ? 'Ingresando…' : 'Iniciar sesión'} <ArrowRight size={15} /></button><div className="modal-note"><ShieldCheck size={16} /><span>Tu negocio y su contexto quedan guardados en tu cuenta.</span></div><p className="signin-copy signin-register">¿Primera vez? <button type="button" className="text-button" onClick={() => { onClose(); onRegister() }}>Cuéntanos de tu negocio y crea tu cuenta</button></p></form> : <div className="setup-state"><span className="setup-icon"><ShieldCheck size={21} /></span><h3>Tu espacio se está preparando</h3><p>Cuando conectes tu proyecto de Supabase, podrás iniciar sesión y guardar tus movimientos de forma segura.</p><button className="button button-primary" onClick={onClose}>Entendido</button></div>}</section></div>
}

function exportCSV(movements: Movement[]) {
  const header = ['Tipo', 'Descripción', 'Categoría', 'Monto CLP', 'Fecha']
  const lines = movements.map((item) => [item.type === 'income' ? 'Ingreso' : 'Gasto', item.description, item.category, String(item.amount), item.date].map((field) => `"${field.replaceAll('"', '""')}"`).join(','))
  const file = new Blob(['\ufeff' + [header.join(','), ...lines].join('\n')], { type: 'text/csv;charset=utf-8' })
  const link = document.createElement('a'); link.href = URL.createObjectURL(file); link.download = 'finanzia-movimientos.csv'; link.click(); URL.revokeObjectURL(link.href)
}

export default App
