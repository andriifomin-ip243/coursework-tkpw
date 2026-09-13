import ProductCard from '../components/ProductCard.jsx';
import { apparelItems } from '../data/items.js';

export default function HomePage() {
  return (
    <main>
      <section id="about">
        <h2>Концепція бренду</h2>
        <p>
          MERA — локальний бренд авторського одягу з лімітованими дропами та акцентом на естетику гравюр і міфології.
        </p>
      </section>

      <section id="catalog">
        <h2>Каталог дропів</h2>
        <p>Всього позицій у релізі: {apparelItems.length}</p>

        {apparelItems.length === 0 ? (
          <p className="empty-message">Наразі немає активних товарів у каталозі.</p>
        ) : (
          <ul className="product-grid">
            {apparelItems.map((item) => (
              <ProductCard key={item.id} item={item} />
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}