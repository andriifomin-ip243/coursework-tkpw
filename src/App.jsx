import HomePage from './pages/HomePage.jsx';

export default function App() {
  return (
    <div className="app-container">
      <header className="site-header">
        <div className="logo">MERA APPAREL</div>
        <nav>
          <a href="#about">Про бренд</a>
          <a href="#catalog">Каталог</a>
        </nav>
      </header>

      <HomePage />

      <footer className="site-footer">
        <p>© 2026 MERA. Навчальний проєкт з ТКПЗ.</p>
      </footer>
    </div>
  );
}