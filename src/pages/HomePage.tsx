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
        title="VNVNC | Официальный портал"
        description="Конюшенная 2В • Культовый клуб в центре Санкт-Петербурга • Здесь всегда атмосферно • Бронь столов и билеты онлайн."
        canonical="https://vnvnc.ru/"
        keywords={[
          'vnvnc',
          'ночной клуб санкт-петербург',
          'вечеринки спб',
          'конюшенная площадь 2в',
        ]}
        jsonLd={[
          buildLocalBusinessJsonLd(),
          buildBreadcrumbJsonLd(createBreadcrumbTrail([])),
          buildVideoObjectJsonLd({
            name: 'VNVNC Concert Hall',
            description: 'VNVNC — ночной клуб в центре Санкт-Петербурга. Погрузитесь в атмосферу вечеринки и бронируйте столы онлайн.',
            thumbnailUrl: 'https://vnvnc.ru/og-image.jpg',
            contentUrl: 'https://vnvnc.ru/herovideo-optimized.mp4',
            uploadDate: '2024-12-01T00:00:00+03:00',
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
