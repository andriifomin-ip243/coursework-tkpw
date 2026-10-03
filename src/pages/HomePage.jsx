import { Link } from 'react-router'
import PageHeading from '../components/ui/PageHeading.jsx'
import Section from '../components/ui/Section.jsx'

export default function HomePage() {
  return (
    <>
      <PageHeading title="MERA Apparel — Авторський одяг" />

      <Section id="about" title="Про концепцію бренду">
        <p>
          MERA — це лімітовані дропи авторських футболок та худі в естетиці класичної гравюри,
          міфології та темного стрітвеару. Кожна річ створюється обмеженим накладом.
        </p>
        <p>
          Перегляньте актуальний каталог дропів, виберіть потрібну річ та підготуйте чернетку передзамовлення.
        </p>
        <div className="home-links">
          <Link to="/catalog" className="app-button app-button-primary">
            Перейти до каталогу
          </Link>
          <Link to="/orders" className="app-button app-button-secondary">
            Переглянути передзамовлення
          </Link>
        </div>
      </Section>
    </>
  )
}