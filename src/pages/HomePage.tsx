import {
  buildLocalBusinessJsonLd,
  buildBreadcrumbJsonLd,
  createBreadcrumbTrail,
  buildVideoObjectJsonLd,
} from '../utils/seo/siteSchema'
import Seo from '../components/Seo'
import WinterSagaLayout from '../components/saga/WinterSagaLayout'
import SagaGrid from '../components/saga/SagaGrid'

const HomePage = () => {
  return (
    <div className="min-h-screen">
      <Seo
        title="VNVNC | WINTER SAGA | 26.12 — 11.01"
        description="ЗИМНЯЯ САГА в VNVNC. Серия вечеринок с 26 декабря по 11 января. Полярный экспресс, Вороний бал, Sleepover и многое другое."
        canonical="https://vnvnc.ru/"
        keywords={[
          'vnvnc',
          'зимняя сага',
          'новый год спб 2026',
          'ночной клуб санкт-петербург',
          'вечеринки спб',
          'конюшенная площадь 2в',
        ]}
        jsonLd={[
          buildLocalBusinessJsonLd(),
          buildBreadcrumbJsonLd(createBreadcrumbTrail([])),
          buildVideoObjectJsonLd({
            name: 'VNVNC WINTER SAGA',
            description: 'VNVNC — ночной клуб в центре Санкт-Петербурга. Зимняя Сага: серия вечеринок.',
            thumbnailUrl: 'https://vnvnc.ru/og-image.jpg',
            contentUrl: 'https://vnvnc.ru/herovideo-optimized.mp4',
            uploadDate: '2025-12-11T00:00:00+03:00',
            duration: 'PT1M',
          }),
        ]}
      />

      <WinterSagaLayout>
        <SagaGrid />
      </WinterSagaLayout>
    </div>
  )
}

export default HomePage
