import { motion } from 'framer-motion'
import { Shield, AlertTriangle, Heart, Sparkles } from 'lucide-react'
import { colors } from '../utils/colors'
import NeonText from '../components/ui/NeonText'
import Accordion from '../components/ui/Accordion'
import BackButton from '../components/BackButton'
import { PageBackground } from '../components/PageBackground'
import VideoPlayer from '../components/ui/VideoPlayer'
// Убрали DitherBackground
import Seo from '../components/Seo'
import { buildLocalBusinessJsonLd, buildBreadcrumbJsonLd, createBreadcrumbTrail, buildFaqJsonLd } from '../utils/seo/siteSchema'

const RulesPage = () => {
  const rulesItems = [
    {
      id: '1',
      question: 'Возраст и документы',
      answer: (
        <>
          <p className="mb-3">Вход строго с 18 лет.</p>
          <p className="mb-2">Принимаем только оригиналы:</p>
          <ul className="list-disc list-inside space-y-1 text-white/80">
            <li>Паспорт РФ</li>
            <li>Загранпаспорт</li>
            <li>Водительские права</li>
            <li>Военный билет</li>
          </ul>
        </>
      )
    },
    {
      id: '2',
      question: 'Дресс-код',
      answer: (
        <>
          <div className="mb-3">
            <p className="font-semibold mb-2">Приветствуем:</p>
            <ul className="list-disc list-inside space-y-1 text-white/80">
              <li>Клубный стиль</li>
              <li>Качественный стритвир</li>
              <li>Творческий образ</li>
            </ul>
          </div>
          <div>
            <p className="font-semibold mb-2">Не подходит:</p>
            <ul className="list-disc list-inside space-y-1 text-white/80">
              <li>Спортивная одежда</li>
              <li>Пляжная обувь</li>
              <li>Неопрятный вид</li>
            </ul>
          </div>
        </>
      )
    },
    {
      id: '3',
      question: 'Фейсконтроль',
      answer: (
        <>
          <p className="mb-3">
            Мы создаем пространство для единомышленников. Селекция помогает поддерживать особую атмосферу клуба.
          </p>
          <p className="text-white/80">
            Решение принимается на основе общего впечатления. Если сегодня не ваш вечер — не принимайте на личный счет.
          </p>
        </>
      )
    },
    {
      id: '4',
      question: 'Безопасность',
      answer: (
        <>
          <p className="mb-3 font-semibold">Запрещено:</p>
          <ul className="list-disc list-inside space-y-1 text-white/80">
            <li>Любое оружие</li>
            <li>Наркотические вещества</li>
            <li>Колющие и режущие предметы</li>
            <li>Пиротехника</li>
            <li>Баллончики и спреи</li>
            <li>Профессиональная съемка без разрешения</li>
          </ul>
        </>
      )
    },
    {
      id: '5',
      question: 'Поведение',
      answer: (
        <>
          <p className="mb-3">Мы за веселье, но против эксцессов.</p>
          <p className="font-semibold mb-2">Отказываем при:</p>
          <ul className="list-disc list-inside space-y-1 text-white/80 mb-3">
            <li>Сильном опьянении</li>
            <li>Агрессивном поведении</li>
            <li>Неуважении к гостям и персоналу</li>
          </ul>
          <p className="font-semibold mb-2">Запрещено:</p>
          <ul className="list-disc list-inside space-y-1 text-white/80">
            <li>Приносить свой алкоголь и еду</li>
            <li>Распивать у входа</li>
            <li>Курить вне зон для курения</li>
          </ul>
        </>
      )
    },
    {
      id: '6',
      question: 'Этикет',
      answer: (
        <>
          <p className="mb-3 font-semibold">Основные правила:</p>
          <ul className="list-disc list-inside space-y-1 text-white/80 mb-3">
            <li>Уважайте личное пространство</li>
            <li>Не снимайте людей без разрешения</li>
            <li>Будьте вежливы с персоналом</li>
            <li>Берегите интерьер клуба</li>
          </ul>
          <p className="text-white/80 text-sm">
            Агрессия и домогательства = удаление без возврата билета.
          </p>
        </>
      )
    },
    {
      id: '7',
      question: 'Билеты',
      answer: (
        <>
          <ul className="list-disc list-inside space-y-1 text-white/80 mb-3">
            <li>Билет = один вход</li>
            <li>Вышел = покупай новый</li>
            <li>Возврата после входа нет</li>
            <li>При переполнении вход ограничен</li>
          </ul>
          <p className="text-white/80 text-sm">
            Браслеты и отметки сохраняйте до конца вечера.
          </p>
        </>
      )
    },
    {
      id: '8',
      question: 'Дополнительно',
      answer: (
        <>
          <ul className="list-disc list-inside space-y-1 text-white/80">
            <li>Клуб может вести съемку для промо</li>
            <li>Гардероб обязателен зимой</li>
            <li>За забытые вещи не отвечаем</li>
            <li>Найденное храним 14 дней</li>
            <li>VIP-зоны могут иметь свои правила</li>
          </ul>
        </>
      )
    }
  ]

  const faqSchemaEntries = [
    {
      question: 'Возраст и документы',
      answer: 'Вход строго с 18 лет. Принимаем только оригиналы документов: паспорт РФ, загранпаспорт, водительские права или военный билет.',
    },
    {
      question: 'Дресс-код клуба VNVNC',
      answer: 'Приветствуются клубный стиль, качественный стритвир и творческие образы. Не допускаются спортивная одежда, пляжная обувь и неопрятный вид.',
    },
    {
      question: 'Фейсконтроль и селекция',
      answer: 'В клубе действует селекция для поддержания атмосферы. Решение о входе принимается на основе общего впечатления и не носит личный характер.',
    },
    {
      question: 'Требования к безопасности',
      answer: 'Запрещены оружие, наркотические вещества, колюще-режущие предметы, пиротехника, аэрозольные баллончики и профессиональная съемка без разрешения.',
    },
    {
      question: 'Поведение в клубе',
      answer: 'Мы за уважение, позитив и безопасность. Отказываем во входе при сильном опьянении и агрессии. Нельзя приносить свой алкоголь и курить вне специально выделенных зон.',
    },
    {
      question: 'Этикет и правила внутри клуба',
      answer: 'Соблюдайте личное пространство гостей, не снимайте людей без согласия, уважайте персонал и интерьер. Агрессия и домогательства ведут к удалению без возврата билета.',
    },
  ]

  return (
    <div className="min-h-screen pt-20 relative">
      <PageBackground />
      <Seo
        title="Правила клуба VNVNC"
        description="Ознакомьтесь с правилами клуба VNVNC: дресс-код, фейсконтроль, безопасность и этикет. Вход строго 18+."
        canonical="https://vnvnc.ru/rules"
        keywords={[
          'правила vnvnc',
          'дресс-код vnvnc',
          'фейсконтроль vnvnc',
          'правила ночного клуба',
        ]}
        jsonLd={[
          buildLocalBusinessJsonLd(),
          buildBreadcrumbJsonLd(
            createBreadcrumbTrail([
              { name: 'Правила', url: 'https://vnvnc.ru/rules' },
            ]),
          ),
          buildFaqJsonLd(faqSchemaEntries),
        ]}
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <BackButton to="/" text="на главную" />
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-block px-8 py-2 mb-4">
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-display font-extrabold text-white lowercase text-stretch-heading break-words">
              правила <NeonText variant="red" size="5xl" glow>vnvnc</NeonText>
            </h1>
          </div>
        </motion.div>

        {/* Video Player */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-12 max-w-4xl mx-auto"
        >
          <VideoPlayer src="/rules-video.mp4" />
        </motion.div>

        {/* Intro Text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mb-12 max-w-3xl mx-auto"
        >
          <div className="radius-xl p-8 backdrop-blur-md border border-white/10"
               style={{ backgroundColor: colors.glass.darker }}>
            <p className="text-lg text-white/90 leading-relaxed">
              Правила клуба VNVNC обязательны для всех гостей. Соблюдение этих правил обеспечивает безопасность и комфорт на территории клуба. Вход разрешён только совершеннолетним.
            </p>
          </div>
        </motion.div>

        {/* Icons Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex justify-center gap-8 mb-12"
        >
          <div className="flex flex-col items-center gap-2">
            <div className="p-3 radius-lg" style={{ backgroundColor: colors.glass.dark }}>
              <Shield size={24} style={{ color: colors.neon.red }} />
            </div>
            <span className="text-sm text-white/60">Безопасность</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="p-3 radius-lg" style={{ backgroundColor: colors.glass.dark }}>
              <Heart size={24} style={{ color: colors.neon.red }} />
            </div>
            <span className="text-sm text-white/60">Уважение</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="p-3 radius-lg" style={{ backgroundColor: colors.glass.dark }}>
              <Sparkles size={24} style={{ color: colors.neon.red }} />
            </div>
            <span className="text-sm text-white/60">Атмосфера</span>
          </div>
        </motion.div>

        {/* Rules Accordion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Accordion items={rulesItems} />
        </motion.div>

        {/* Bottom Warning */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-12"
        >
          <div className="radius-lg p-6 border flex items-start gap-4"
               style={{ 
                 backgroundColor: colors.glass.darker,
                 borderColor: colors.neon.red + '33'
               }}>
            <AlertTriangle size={24} style={{ color: colors.neon.red }} className="flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-white mb-2">Важно</h3>
              <p className="text-white/80 leading-relaxed">
                Администрация клуба принимает окончательные решения по всем вопросам допуска и пребывания гостей.
                Правила могут изменяться без предварительного уведомления. Нарушение правил влечёт отказ в обслуживании
                без возврата стоимости билета. За утерянные вещи клуб ответственности не несёт.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default RulesPage
