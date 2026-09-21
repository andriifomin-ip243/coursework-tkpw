import SiteHeader from './SiteHeader.jsx'

export default function AppLayout({ title, links, children }) {
  return (
    <div className="app-wrapper">
      <a className="skip-link" href="#main-content">
        Перейти до вмісту
      </a>
      <SiteHeader title={title} links={links} />
      <main id="main-content" tabIndex={-1} className="main-content">
        {children}
      </main>
      <footer className="site-footer">
        <p>© 2026 MERA Apparel. Навчальний курсовий проєкт магазину авторського одягу.</p>
      </footer>
    </div>
  )
}