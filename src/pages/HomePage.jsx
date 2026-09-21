import { apparelItems } from '../data/items.js'
import Section from '../components/ui/Section.jsx'
import CatalogSummary from '../components/catalog/CatalogSummary.jsx'
import ProductList from '../components/catalog/ProductList.jsx'

export default function HomePage() {
  return (
    <>
      <Section id="about" title="Про бренд MERA">
        <p>
          MERA — це авторський streetwear-одяг обмеженого тиражу (дропи футболок та худі)
          з унікальною естетикою та якісним шовкотрафаретним друком.
        </p>
        <p>
          Ознайомтеся з актуальними моделями нижче та виберіть річ для оформлення заявки на передзамовлення.
        </p>
      </Section>

      <Section id="catalog" title="Каталог дропів">
        <CatalogSummary total={apparelItems.length} />
        <ProductList items={apparelItems} />
      </Section>
    </>
  )
}