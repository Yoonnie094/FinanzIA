import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { ArrowDownLeft, ArrowLeft, ArrowRight, ArrowUpRight, BarChart3, Bell, Check, ChevronDown, ChevronLeft, CircleHelp, ClipboardList, CreditCard, Eye, FileDown, HeartHandshake, Leaf, LockKeyhole, Menu, Moon, Plus, ShieldCheck, Sparkles, Store, Sun, Wallet, X } from 'lucide-react'
import { incomeCategories, expenseCategories, initialMovements, type Movement, type MovementType } from './types'
import { loadMovements, saveMovement } from './lib/movements'
import { supabase, supabaseConfigured } from './lib/supabase'
import { hasCompletedOnboarding, saveOnboarding, type OnboardingData } from './lib/onboarding'

type WorkspaceView = 'dashboard' | 'movements' | 'payments'
type View = 'landing' | 'onboarding' | WorkspaceView
type Modal = 'movement' | 'signin' | null
type AccessMode = 'register' | 'login'

const AUTH_CALLBACK_PATH = '/auth/callback'

const clp = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 })
const shortDate = (date: string) => new Intl.DateTimeFormat('es-CL', { day: 'numeric', month: 'short' }).format(new Date(`${date}T12:00:00`))
const todayISO = () => new Date().toLocaleDateString('sv-SE')

function Brand({ inverse = false }: { inverse?: boolean }) {
  return <span className={`brand ${inverse ? 'brand-inverse' : ''}`}><span className="brand-mark"><span /><span /><span /></span><span>FinanzIA</span></span>
}

function App() {
  const [view, setView] = useState<View>('landing')
  const [modal, setModal] = useState<Modal>(null)
  const [accessMode, setAccessMode] = useState<AccessMode>('register')
  const [movements, setMovements] = useState<Movement[]>(initialMovements)
  const [dark, setDark] = useState(localStorage.getItem('finanzia.theme') === 'dark')
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [authUserId, setAuthUserId] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')
  const [mobileMenu, setMobileMenu] = useState(false)

  useEffect(() => { document.documentElement.dataset.theme = dark ? 'dark' : 'light'; localStorage.setItem('finanzia.theme', dark ? 'dark' : 'light') }, [dark])
  useEffect(() => {
    const url = new URL(window.location.href)
    const hashParams = new URLSearchParams(url.hash.replace(/^#/, ''))
    const authError = url.searchParams.get('error_description') ?? hashParams.get('error_description')
    const authErrorCode = url.searchParams.get('error_code') ?? hashParams.get('error_code')
    if (authError || authErrorCode) {
      window.history.replaceState({}, '', '/')
      setView('landing')
      setAccessMode('login')
      setModal('signin')
      setNotice(authErrorCode === 'otp_expired'
        ? 'Este enlace venció o ya fue usado. Inicia sesión para pedir uno nuevo.'
        : 'No pudimos validar el enlace. Inicia sesión para recibir uno nuevo.')
    }
  }, [])
  useEffect(() => {
    if (!supabase) return
    supabase.auth.getSession().then(({ data }) => {
      if (window.location.pathname === AUTH_CALLBACK_PATH) window.history.replaceState({}, '', '/')
      setUserEmail(data.session?.user.email ?? null)
      setAuthUserId(data.session?.user.id ?? null)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user.email ?? null)
      setAuthUserId(session?.user.id ?? null)
    })
    return () => listener.subscription.unsubscribe()
  }, [])
  useEffect(() => {
    if (!authUserId) return
    let active = true
    hasCompletedOnboarding(authUserId).then((complete) => {
      if (!active) return
      setView((current) => current === 'landing' || current === 'onboarding' ? complete ? 'dashboard' : 'onboarding' : current)
    }).catch((error: Error) => { if (active) setNotice(error.message || 'No pudimos revisar tu perfil.') })
    return () => { active = false }
  }, [authUserId])
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
    const email = String(new FormData(event.currentTarget).get('email'))
    setBusy(true)
    const callbackUrl = new URL(AUTH_CALLBACK_PATH, window.location.origin).toString()
    const { error } = await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: accessMode === 'register', emailRedirectTo: callbackUrl } })
    setBusy(false)
    if (error) setNotice(error.message)
    else { setModal(null); setNotice(accessMode === 'register' ? 'Te enviamos el enlace para crear tu cuenta.' : 'Te enviamos el enlace para entrar a tu cuenta.') }
  }

  async function finishOnboarding(answers: OnboardingData) {
    if (!supabase || !authUserId || !userEmail) throw new Error('Vuelve a iniciar sesión para guardar tu perfil.')
    setBusy(true)
    try {
      await saveOnboarding(authUserId, userEmail, answers)
      setView('dashboard')
      setNotice('Tu espacio quedó listo. ¡Bienvenido/a a FinanzIA!')
    } finally { setBusy(false) }
  }

  async function signOut() {
    if (!supabase) return
    const { error } = await supabase.auth.signOut()
    if (error) setNotice(error.message)
    else { setNotice('Sesión cerrada'); setMovements(initialMovements); setView('landing') }
  }

  function openAccess(mode: AccessMode) { setAccessMode(mode); setModal('signin') }

  function navigate(next: View) { setView(next); setMobileMenu(false); window.scrollTo({ top: 0, behavior: 'smooth' }) }

  return <>
    {view === 'landing' ? <Landing dark={dark} toggleTheme={() => setDark(!dark)} openDemo={() => navigate('dashboard')} openSignIn={() => openAccess('login')} openRegister={() => openAccess('register')} /> :
      view === 'onboarding' ? <Onboarding userEmail={userEmail || ''} onComplete={finishOnboarding} busy={busy} onSignOut={signOut} /> :
      <Workspace view={view} navigate={navigate} movements={movements} openMovement={() => setModal('movement')} dark={dark} toggleTheme={() => setDark(!dark)} userEmail={userEmail} openSignIn={() => openAccess('register')} signOut={signOut} mobileMenu={mobileMenu} setMobileMenu={setMobileMenu} />}
    {modal === 'movement' && <MovementModal onClose={() => setModal(null)} onSubmit={addMovement} busy={busy} />}
    {modal === 'signin' && <SignInModal mode={accessMode} setMode={setAccessMode} onClose={() => setModal(null)} onSubmit={signIn} busy={busy} configured={supabaseConfigured} />}
    {notice && <div className="toast"><Check size={16} />{notice}<button onClick={() => setNotice('')} aria-label="Cerrar aviso"><X size={14} /></button></div>}
  </>
}

function Landing({ dark, toggleTheme, openDemo, openSignIn, openRegister }: { dark: boolean; toggleTheme: () => void; openDemo: () => void; openSignIn: () => void; openRegister: () => void }) {
  return <div className="landing">
    <header className="site-header wrap">
      <Brand />
      <nav className="landing-nav"><a href="#como-funciona">Cómo funciona</a><a href="#para-ti">Hecho para tu negocio</a></nav>
      <div className="header-actions"><button className="icon-btn theme-toggle" onClick={toggleTheme} aria-label="Cambiar tema">{dark ? <Sun size={18} /> : <Moon size={18} />}</button><button className="text-button login-link" onClick={openSignIn}>Iniciar sesión</button><button className="button button-primary header-cta" onClick={openRegister}>Crear cuenta gratis <ArrowRight size={16} /></button><button className="menu-btn" aria-label="Abrir menú"><Menu size={20} /></button></div>
    </header>
    <main>
      <section className="hero wrap">
        <div className="hero-copy">
          <div className="eyebrow"><Sparkles size={14} /> FINANZAS MÁS CLARAS, NEGOCIOS CON MÁS CALMA</div>
          <h1>Tus números,<br /><span>en buen camino.</span></h1>
          <p>Ordena los ingresos, gastos y pagos de tu negocio en un solo lugar. FinanzIA te ayuda a entender cómo va tu caja, sin hablar en difícil.</p>
          <div className="hero-actions"><button className="button button-primary button-large" onClick={openDemo}>Conoce el demo <ArrowRight size={17} /></button><a className="quiet-link" href="#como-funciona">Descubre cómo funciona <ArrowDownLeft size={15} /></a></div>
          <div className="hero-proof"><div className="avatar-stack"><span>p</span><span>m</span><span>c</span></div><span>Para quienes hacen crecer<br />su negocio día a día</span><span className="proof-divider" /><span className="secure-proof"><ShieldCheck size={16} /> Tus datos, bajo tu control</span></div>
        </div>
        <div className="hero-art" aria-label="Vista previa del panel financiero de FinanzIA">
          <div className="art-orbit orbit-one" /><div className="art-orbit orbit-two" />
          <div className="float-note float-note-top"><span className="note-icon note-lilac"><Wallet size={17} /></span><span><b>Tu caja, más clara</b><small>Ingresos y gastos al día</small></span><span className="tiny-check"><Check size={12} /></span></div>
          <div className="preview-window">
            <div className="preview-top"><span className="preview-brand"><span className="mini-mark"><i /><i /><i /></span> FinanzIA</span><span className="preview-dots"><i /><i /><i /></span></div>
            <div className="preview-content"><div className="preview-greeting"><div><small>MIÉRCOLES, 11 DE NOVIEMBRE</small><b>¡Hola! Así va tu negocio <span>✦</span></b></div><span className="preview-avatar">F</span></div>
              <div className="preview-balance"><div><span>Ingresos menos gastos registrados</span><b>$1.284.500</b><small><span>✦</span> Resultado de ejemplo</small></div><div className="preview-bars"><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /></div></div>
              <div className="preview-metrics"><div><span><i className="metric-dot dot-income" /> Ingresos</span><b>$2.450.000</b><small>Este mes</small></div><div><span><i className="metric-dot dot-expense" /> Gastos</span><b>$1.165.500</b><small>Este mes</small></div></div>
              <div className="preview-lower"><div className="preview-activity"><div className="preview-heading">Últimos movimientos <span>Ver todos</span></div><div className="preview-row"><span className="preview-row-icon green-icon"><ArrowDownLeft size={13} /></span><span><b>Venta pedido #104</b><small>Hoy · Ventas</small></span><strong>+$185.000</strong></div><div className="preview-row"><span className="preview-row-icon purple-icon"><ArrowUpRight size={13} /></span><span><b>Insumos producción</b><small>Ayer · Materiales</small></span><strong className="negative">−$42.600</strong></div></div>
              <div className="preview-reminder"><span className="reminder-icon"><Bell size={13} /></span><small>PRÓXIMO PAGO</small><b>Arriendo del local</b><span>En 4 días <strong>$280.000</strong></span></div></div>
            </div>
          </div>
          <div className="float-note float-note-bottom"><span className="note-icon note-green"><Check size={17} /></span><span><b>Un paso a la vez</b><small>Empieza con lo que tienes</small></span></div>
          <span className="hero-spark spark-one">✳</span><span className="hero-spark spark-two">✦</span>
        </div>
      </section>
      <section className="trust-strip"><div className="wrap trust-inner"><span>Un espacio simple para llevar</span><b><BarChart3 size={16} /> tus cuentas claras</b><i /><b><HeartHandshake size={16} /> tu negocio en marcha</b><i /><b><Leaf size={16} /> tu próximo paso</b></div></section>
      <section className="section how-section" id="como-funciona"><div className="wrap"><div className="section-heading"><div className="eyebrow">SIMPLE, COMO DEBERÍA SER</div><h2>De los movimientos del día<br />a una visión más clara.</h2><p>Sin planillas interminables. Sin palabras complicadas. Solo lo que necesitas para llevar las cuentas de tu negocio.</p></div>
        <div className="steps-grid"><article className="step-card"><span className="step-number">01</span><div className="step-icon lavender-icon"><ClipboardList size={22} /></div><h3>Anota lo que pasa</h3><p>Registra tus ingresos y gastos desde el teléfono o computador. Tú eliges cómo ordenar cada movimiento.</p><div className="step-visual step-form"><span>¿Qué registramos?</span><div><span className="form-dot" /> Compra de materiales <b>−$18.500</b></div><small><Check size={12} /> Guardado en Materiales</small></div></article>
          <article className="step-card"><span className="step-number">02</span><div className="step-icon peach-icon"><Eye size={22} /></div><h3>Mira el panorama completo</h3><p>Revisa cuánto entró y salió, qué pagos vienen y qué resultado dejan tus movimientos.</p><div className="step-visual step-summary"><span>Este mes</span><b>$1.284.500</b><small>Ingresos menos gastos registrados</small><div><i /><i /><i /><i /><i /><i /><i /><i /><i /></div></div></article>
          <article className="step-card"><span className="step-number">03</span><div className="step-icon mint-icon"><Sparkles size={22} /></div><h3>Decide con más tranquilidad</h3><p>Entiende tus números con explicaciones sencillas y toma el siguiente paso con más confianza.</p><div className="step-visual step-insight"><span className="insight-star"><Sparkles size={13} /></span><span><b>Una idea para ti</b><small>Recuerda considerar los materiales al calcular tu ganancia.</small></span><ArrowRight size={15} /></div></article></div>
      </div></section>
      <section className="section audience-section" id="para-ti"><div className="wrap audience-wrap"><div className="audience-copy"><div className="eyebrow">A TU RITMO, A TU MANERA</div><h2>Tu negocio es único.<br /><span>Tu forma de ordenarlo, también.</span></h2><p>Si vendes productos, ofreces servicios o estás empezando una idea, FinanzIA te acompaña desde donde estás. Sin exigir que tengas todo resuelto.</p><ul><li><span><Check size={14} /></span> Empieza con registros sencillos</li><li><span><Check size={14} /></span> Separa lo personal de tu negocio</li><li><span><Check size={14} /></span> Ten tus próximos pagos a la vista</li></ul><button className="button button-primary" onClick={openDemo}>Explorar el demo <ArrowRight size={16} /></button></div><div className="audience-card"><div className="audience-card-top"><span className="category-chip">TU SEMANA</span><span className="more-dots">•••</span></div><h3>Pequeños pasos,<br />grandes avances.</h3><div className="week-progress"><div className="progress-track"><span /></div><span>3 de 4 días con tus movimientos al día</span></div><div className="week-days"><span><i className="day-done"><Check size={12} /></i><small>LUN</small></span><span><i className="day-done"><Check size={12} /></i><small>MAR</small></span><span><i className="day-done"><Check size={12} /></i><small>MIÉ</small></span><span><i className="day-empty" /><small>JUE</small></span></div><div className="encouragement"><span>✦</span><p>Vas bien. Cada registro te ayuda a ver un poco más claro.</p></div><div className="card-blob" /></div></div></section>
      <section className="closing-cta"><div className="wrap cta-inner"><div className="cta-flower">✳</div><div><div className="eyebrow">EL PRÓXIMO PASO EMPIEZA AQUÍ</div><h2>Ordena tus cuentas.<br /><span>Crece con más calma.</span></h2><p>Conoce FinanzIA y descubre otra forma de llevar las finanzas de tu negocio.</p></div><button className="button button-light button-large" onClick={openDemo}>Entrar al demo <ArrowRight size={17} /></button><span className="cta-star">✦</span></div></section>
    </main>
    <footer className="site-footer"><div className="wrap footer-inner"><Brand /><span>Hecho con cariño para los negocios que mueven Chile.</span><span>© 2026 FinanzIA</span></div></footer>
  </div>
}

function Workspace({ view, navigate, movements, openMovement, dark, toggleTheme, userEmail, openSignIn, signOut, mobileMenu, setMobileMenu }: { view: WorkspaceView; navigate: (view: View) => void; movements: Movement[]; openMovement: () => void; dark: boolean; toggleTheme: () => void; userEmail: string | null; openSignIn: () => void; signOut: () => void; mobileMenu: boolean; setMobileMenu: (open: boolean) => void }) {
  const income = movements.filter((item) => item.type === 'income').reduce((sum, item) => sum + item.amount, 0)
  const expense = movements.filter((item) => item.type === 'expense').reduce((sum, item) => sum + item.amount, 0)
  const balance = income - expense
  const nav = [{ id: 'dashboard' as const, label: 'Resumen', icon: BarChart3 }, { id: 'movements' as const, label: 'Movimientos', icon: ArrowUpRight }, { id: 'payments' as const, label: 'Pagos próximos', icon: CreditCard }]
  const label = view === 'dashboard' ? 'Resumen' : view === 'movements' ? 'Movimientos' : 'Pagos próximos'
  return <div className="workspace">
    <aside className={`sidebar ${mobileMenu ? 'sidebar-open' : ''}`}><div className="side-top"><button className="brand-button" onClick={() => navigate('landing')}><Brand /></button><button className="mobile-close" aria-label="Cerrar menú" onClick={() => setMobileMenu(false)}><X size={18} /></button></div><div className="business-switch"><span className="business-avatar">M</span><span><b>Mi negocio</b><small>Plan de prueba</small></span><ChevronDown size={15} /></div><div className="nav-caption">MENÚ</div><nav className="side-nav">{nav.map((item) => <button key={item.id} className={`side-link ${view === item.id ? 'active' : ''}`} onClick={() => navigate(item.id)}><item.icon size={17} /><span>{item.label}</span>{item.id === 'payments' && <i className="nav-badge">2</i>}</button>)}</nav><div className="sidebar-bottom"><div className="help-card"><div><CircleHelp size={17} /><b>¿Necesitas ayuda?</b></div><p>Estamos aquí para acompañarte.</p><button onClick={() => navigate('landing')}>Conoce FinanzIA <ArrowRight size={13} /></button></div><button className="profile-button" onClick={userEmail ? signOut : openSignIn}><span className="profile-avatar">{userEmail ? userEmail[0].toUpperCase() : 'F'}</span><span><b>{userEmail || 'Tu espacio de prueba'}</b><small>{userEmail ? 'Cerrar sesión' : 'Datos en este dispositivo'}</small></span><ChevronDown size={14} /></button></div></aside>
    {mobileMenu && <button className="sidebar-scrim" aria-label="Cerrar menú" onClick={() => setMobileMenu(false)} />}
    <main className="workspace-main"><header className="workspace-header"><button className="menu-btn workspace-menu" onClick={() => setMobileMenu(true)} aria-label="Abrir menú"><Menu size={20} /></button><div><div className="breadcrumb">FinanzIA <span>/</span> <b>{label}</b></div><h1>{view === 'dashboard' ? 'Tu negocio, en perspectiva' : view === 'movements' ? 'Tus movimientos' : 'Pagos en el horizonte'}</h1></div><div className="workspace-actions"><button className="icon-btn theme-toggle" onClick={toggleTheme} aria-label="Cambiar tema">{dark ? <Sun size={18} /> : <Moon size={18} />}</button><button className="icon-btn notification-btn" aria-label="Notificaciones"><Bell size={18} /><i /></button><button className="button button-primary header-add" onClick={openMovement}><Plus size={16} /> Nuevo movimiento</button></div></header>
      <div className="workspace-content">
        {view === 'dashboard' && <><div className="welcome-banner"><div><span className="welcome-kicker">MIÉRCOLES, 11 DE NOVIEMBRE <span>✦</span></span><h2>Hola, qué bueno verte por aquí.</h2><p>Un paso pequeño hoy puede darte más claridad mañana.</p></div><span className="welcome-doodle">✳</span></div>
          <div className="metric-grid"><MetricCard title="Diferencia registrada" value={clp.format(balance)} caption="Ingresos menos gastos registrados" icon={Wallet} variant="purple" trend="Datos de ejemplo" /><MetricCard title="Ingresos" value={clp.format(income)} caption="En los movimientos visibles" icon={ArrowDownLeft} variant="green" trend="Entradas registradas" /><MetricCard title="Gastos" value={clp.format(expense)} caption="En los movimientos visibles" icon={ArrowUpRight} variant="peach" trend="Salidas registradas" /></div>
          <div className="dashboard-grid"><section className="panel flow-panel"><div className="panel-heading"><div><h3>Así se mueve tu negocio</h3><p>Un vistazo a tus ingresos y gastos</p></div><select aria-label="Período del resumen" defaultValue="este-mes"><option value="este-mes">Este mes <ChevronDown size={12} /></option><option value="todo">Todo el período</option></select></div><div className="chart-legend"><span><i className="legend-income" /> Ingresos</span><span><i className="legend-expense" /> Gastos</span></div><div className="chart-area"><div className="chart-y"><span>$200 mil</span><span>$150 mil</span><span>$100 mil</span><span>$50 mil</span><span>$0</span></div><div className="chart-plot"><div className="chart-gridlines"><i /><i /><i /><i /><i /></div><svg viewBox="0 0 620 190" preserveAspectRatio="none" role="img" aria-label="Tendencia de ingresos y gastos"><defs><linearGradient id="areaPurple" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#8f6bd1" stopOpacity=".2" /><stop offset="1" stopColor="#8f6bd1" stopOpacity="0" /></linearGradient></defs><path d="M0 130 C35 120 48 128 77 103 S130 116 155 95 S210 112 232 75 S280 90 310 67 S360 91 390 53 S440 70 465 45 S520 72 545 36 S590 50 620 24 L620 190 L0 190Z" fill="url(#areaPurple)"/><path d="M0 130 C35 120 48 128 77 103 S130 116 155 95 S210 112 232 75 S280 90 310 67 S360 91 390 53 S440 70 465 45 S520 72 545 36 S590 50 620 24" fill="none" stroke="#8b66cc" strokeWidth="3" strokeLinecap="round"/><path d="M0 157 C35 151 49 158 77 141 S130 150 155 134 S210 145 232 119 S280 133 310 115 S360 131 390 103 S440 122 465 95 S520 115 545 89 S590 100 620 75" fill="none" stroke="#e7a987" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="5 5"/></svg><div className="chart-x"><span>1 nov</span><span>5 nov</span><span>10 nov</span><span>15 nov</span><span>20 nov</span><span>25 nov</span><span>30 nov</span></div></div></div><div className="chart-foot"><span><i /> Cada registro hace más claro este panorama.</span><button onClick={() => navigate('movements')}>Ver movimientos <ArrowRight size={14} /></button></div></section>
            <section className="panel payments-panel"><div className="panel-heading"><div><h3>Pagos próximos</h3><p>Para que nada te pille de sorpresa</p></div><button className="more-button" aria-label="Más opciones">•••</button></div><div className="payment-item"><span className="payment-date"><b>15</b><small>NOV</small></span><span className="payment-info"><b>Arriendo del local</b><small>Faltan 4 días</small></span><strong>$280.000</strong></div><div className="payment-item"><span className="payment-date payment-date-lilac"><b>20</b><small>NOV</small></span><span className="payment-info"><b>Cuota del crédito</b><small>Faltan 9 días</small></span><strong>$145.000</strong></div><button className="all-payments" onClick={() => navigate('payments')}>Ver todos los pagos <ArrowRight size={14} /></button><div className="reserve-tip"><span><Sparkles size={15} /></span><p><b>Una idea:</b> separar un poquito cada semana puede ayudarte a llegar con calma.</p></div></section></div>
          <div className="bottom-grid"><section className="panel movements-panel"><div className="panel-heading"><div><h3>Movimientos recientes</h3><p>Lo último que anotaste en tu negocio</p></div><button className="subtle-link" onClick={() => navigate('movements')}>Ver todos <ArrowRight size={14} /></button></div><MovementTable movements={movements.slice(0, 4)} /></section><section className="growth-card"><div className="growth-orb" /><span className="growth-icon"><Sparkles size={18} /></span><span className="growth-label">UN DATO PARA TI</span><h3>Los pequeños registros<br />forman una gran imagen.</h3><p>Cuando anotas cada movimiento, es más fácil entender qué está pasando con tu caja.</p><button onClick={() => navigate('movements')}>Seguir ordenando <ArrowRight size={14} /></button></section></div>
        </>}
        {view === 'movements' && <section className="panel full-panel"><div className="panel-heading"><div><h3>Todos tus movimientos</h3><p>Ingresos y gastos anotados en tu espacio</p></div><div className="movement-tools"><button className="outline-button" onClick={() => exportCSV(movements)}><FileDown size={15} /> Descargar</button><button className="button button-primary" onClick={openMovement}><Plus size={16} /> Nuevo movimiento</button></div></div><MovementTable movements={movements} /></section>}
        {view === 'payments' && <div className="payments-page-grid"><section className="panel full-panel"><div className="panel-heading"><div><h3>Lo que viene</h3><p>Recordatorios de ejemplo para tu negocio</p></div><button className="outline-button" onClick={() => navigate('dashboard')}><ArrowLeft size={15} /> Volver al resumen</button></div><div className="payment-detail"><span className="payment-date"><b>15</b><small>NOV</small></span><span><b>Arriendo del local</b><small>Pago mensual · faltan 4 días</small></span><strong>$280.000</strong><button className="outline-button">Marcar pagado</button></div><div className="payment-detail"><span className="payment-date payment-date-lilac"><b>20</b><small>NOV</small></span><span><b>Cuota del crédito</b><small>Cuota 6 de 12 · faltan 9 días</small></span><strong>$145.000</strong><button className="outline-button">Marcar pagado</button></div><div className="empty-hint"><Bell size={17} /><span>En tu cuenta podrás agregar compromisos y configurar recordatorios.</span></div></section><div className="debt-tip"><CreditCard size={19} /><h3>Planifica con tiempo</h3><p>Cuando anotas una fecha de pago y su monto, puedes considerar ese compromiso al revisar tu caja.</p><small>FinanzIA acompaña tu organización. Las proyecciones dependen de la información que registres.</small></div></div>}
      </div>
    </main>
  </div>
}

const regionsOfChile = ['Arica y Parinacota', 'Tarapacá', 'Antofagasta', 'Atacama', 'Coquimbo', 'Valparaíso', 'Metropolitana de Santiago', "Libertador General Bernardo O’Higgins", 'Maule', 'Ñuble', 'Biobío', 'La Araucanía', 'Los Ríos', 'Los Lagos', 'Aysén', 'Magallanes y la Antártica Chilena']

function Onboarding({ userEmail, onComplete, busy, onSignOut }: { userEmail: string; onComplete: (answers: OnboardingData) => Promise<void>; busy: boolean; onSignOut: () => void }) {
  const [step, setStep] = useState(1)
  const [answers, setAnswers] = useState<Partial<OnboardingData>>({})
  const [error, setError] = useState('')

  function readForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    return Object.fromEntries(new FormData(event.currentTarget).entries()) as Record<string, string>
  }

  function nextStep(event: FormEvent<HTMLFormElement>) {
    const values = readForm(event)
    setAnswers((current) => ({ ...current, ...values }))
    setError('')
    setStep((current) => current + 1)
  }

  async function finish(event: FormEvent<HTMLFormElement>) {
    const values = readForm(event)
    const completed = { ...answers, ...values } as OnboardingData
    setAnswers(completed)
    setError('')
    try { await onComplete(completed) }
    catch (submitError) { setError(submitError instanceof Error ? submitError.message : 'No pudimos guardar tu perfil. Inténtalo nuevamente.') }
  }

  return <main className="onboarding-page">
    <header className="onboarding-header"><Brand /><button className="text-button" onClick={onSignOut}>Salir de mi cuenta</button></header>
    <div className="onboarding-shell"><section className="onboarding-card" aria-labelledby="onboarding-title">
      <div className="onboarding-topline"><span className="onboarding-kicker"><Sparkles size={14} /> TU ESPACIO, A TU MEDIDA</span><span className="step-counter">0{step} <i>/ 03</i></span></div>
      <div className="step-progress" aria-label={`Paso ${step} de 3`}>{[1, 2, 3].map((number) => <i className={number <= step ? 'done' : ''} key={number} />)}</div>
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
      {step === 3 && <form className="onboarding-form" onSubmit={finish}>
        <div className="onboarding-title"><span className="onboarding-icon"><Sparkles size={20} /></span><h1 id="onboarding-title">¿En qué te gustaría avanzar?</h1><p>Estas respuestas darán contexto a futuras ayudas de IA. Puedes cambiar tus preferencias después.</p></div>
        <label>¿Qué te cuesta más hoy?<select name="mainChallenge" required defaultValue={answers.mainChallenge || ''}><option value="" disabled>Elige lo más importante</option><option value="know_profit">Saber cuánto estoy ganando realmente</option><option value="recording">Mantener ingresos y gastos al día</option><option value="separation">Separar la plata personal y la del negocio</option><option value="payments">Prepararme para pagos y deudas</option><option value="inventory">Controlar productos, materiales o compras</option><option value="starting">Planificar antes de empezar</option><option value="other">Otra cosa</option></select></label>
        <div className="onboarding-row"><label>¿Qué te sería más útil?<select name="mainGoal" required defaultValue={answers.mainGoal || ''}><option value="" disabled>Elige una prioridad</option><option value="organize">Tener todo ordenado en un lugar</option><option value="profit">Entender ingresos, gastos y ganancia</option><option value="cash">Saber cuánto puedo usar o reservar</option><option value="payments">No olvidar pagos próximos</option><option value="accountant">Compartir información con mi contador</option><option value="start_plan">Armar un plan paso a paso</option></select></label><label>¿Cómo preferirías anotar un movimiento?<select name="preferredEntry" required defaultValue={answers.preferredEntry || ''}><option value="" disabled>Elige cómo te acomoda</option><option value="form">Un formulario o tabla</option><option value="chat">Escribirlo en un chat</option><option value="voice">Dictarlo con mi voz</option><option value="automatic">Que se registre automáticamente</option><option value="unsure">Todavía no estoy seguro/a</option></select></label></div>
        <label className="ai-consent"><input name="aiConsent" type="checkbox" required /><span><b>Autorizo que este contexto se use para personalizar futuras respuestas de IA.</b><small>Por ahora FinanzIA no enviará estas respuestas a un modelo de IA. No pedimos RUT, claves ni datos bancarios.</small></span></label>
        {error && <p className="onboarding-error" role="alert">{error}</p>}
        <div className="onboarding-footer"><button className="back-step" type="button" onClick={() => setStep(2)}><ChevronLeft size={16} /> Atrás</button><span>3 de 3</span><button className="button button-primary" type="submit" disabled={busy}>{busy ? 'Guardando tu espacio…' : 'Crear mi espacio'} <ArrowRight size={16} /></button></div>
      </form>}
      <div className="onboarding-secure"><LockKeyhole size={14} /><span>Tu perfil es privado y solo tú puedes acceder a él.</span></div>
    </section><p className="onboarding-email">Vas a crear tu espacio con <b>{userEmail}</b></p></div>
  </main>
}

function MetricCard({ title, value, caption, icon: Icon, variant, trend }: { title: string; value: string; caption: string; icon: typeof Wallet; variant: string; trend: string }) {
  return <article className="metric-card"><div className={`metric-icon ${variant}`}><Icon size={19} /></div><span className="metric-title">{title}</span><b className="metric-value">{value}</b><span className="metric-caption">{caption}</span><span className="metric-trend"><i />{trend}</span></article>
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

function SignInModal({ mode, setMode, onClose, onSubmit, busy, configured }: { mode: AccessMode; setMode: (mode: AccessMode) => void; onClose: () => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void; busy: boolean; configured: boolean }) {
  const register = mode === 'register'
  return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}><section className="modal-card signin-card" role="dialog" aria-modal="true" aria-labelledby="signin-title"><div className="modal-head"><div><span className="modal-kicker">{register ? 'TU NEGOCIO, TU ESPACIO' : 'QUÉ BUENO TENERTE DE VUELTA'}</span><h2 id="signin-title">{register ? 'Crea tu cuenta' : 'Entra a tu espacio'}</h2></div><button className="icon-btn" onClick={onClose} aria-label="Cerrar"><X size={18} /></button></div><div className="access-tabs"><button className={register ? 'active' : ''} onClick={() => setMode('register')}>Crear cuenta</button><button className={!register ? 'active' : ''} onClick={() => setMode('login')}>Iniciar sesión</button></div>{configured ? <form onSubmit={onSubmit}><p className="signin-copy">{register ? 'Comienza gratis. Te enviaremos un enlace seguro para confirmar tu correo y crear tu espacio.' : 'Te enviaremos un enlace seguro para entrar, sin necesidad de recordar una contraseña.'}</p><label>Correo electrónico<input name="email" type="email" placeholder="tu@negocio.cl" required /></label><button className="button button-primary signin-submit" disabled={busy}>{busy ? 'Enviando…' : register ? 'Continuar con mi correo' : 'Enviarme un enlace'} <ArrowRight size={15} /></button><div className="modal-note"><ShieldCheck size={16} /><span>Sin contraseña. Tus datos quedan protegidos en tu cuenta.</span></div></form> : <div className="setup-state"><span className="setup-icon"><ShieldCheck size={21} /></span><h3>Tu espacio se está preparando</h3><p>Cuando conectes tu proyecto de Supabase, podrás crear una cuenta y guardar tus movimientos de forma segura. Mientras tanto, puedes explorar el demo.</p><button className="button button-primary" onClick={onClose}>Entendido</button></div>}</section></div>
}

function exportCSV(movements: Movement[]) {
  const header = ['Tipo', 'Descripción', 'Categoría', 'Monto CLP', 'Fecha']
  const lines = movements.map((item) => [item.type === 'income' ? 'Ingreso' : 'Gasto', item.description, item.category, String(item.amount), item.date].map((field) => `"${field.replaceAll('"', '""')}"`).join(','))
  const file = new Blob(['\ufeff' + [header.join(','), ...lines].join('\n')], { type: 'text/csv;charset=utf-8' })
  const link = document.createElement('a'); link.href = URL.createObjectURL(file); link.download = 'finanzia-movimientos.csv'; link.click(); URL.revokeObjectURL(link.href)
}

export default App
