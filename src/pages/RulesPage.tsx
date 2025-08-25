import { motion } from 'framer-motion'
import { Shield, AlertTriangle, Heart, Sparkles } from 'lucide-react'
import { colors } from '../utils/colors'
import NeonText from '../components/ui/NeonText'
import Accordion from '../components/ui/Accordion'
// Убрали DitherBackground

const RulesPage = () => {
  const rulesItems = [
    {
      id: '1',
      question: 'Вход и дресс-код',
      answer: `Только 18+ и только с оригиналом документа. Никаких фоток на телефоне или ксерокопий и фото госуслуг. Это не обсуждается. 

И про фейсконтроль, ты сам знаешь. Мы видим своих, кто в теме. Если не твой день, то не твой день. Такое бывает. 

И да, спортивные штаны, шлепки, что-то грязное или рваное — это не сюда. У нас тут другой уровень.`
    },
    {
      id: '2',
      question: 'Безопасность и комфорт',
      answer: `Забудь про всякий хлам, что тащит проблемы: оружие, наркотики, всякие баллончики, спреи, лаки, ножницы, ножи или что там еще. Если мы такое находим, то ты точно не попадешь. И да, с такими вещами мы не шутим, все серьезно. 

Перебрал с алкоголем или чем-то еще? Ну, если совсем не вывозишь, мы попросим тебя прогуляться. Не надо тут валяться или спать. 

И со своим бухлом или едой — нет. Запрещено внесение в клуб шоколада, бутербродов, начатых соков. Для этого есть наш бар.`
    },
    {
      id: '3',
      question: 'Уважение',
      answer: `К нашим стенам, к нашим людям. Никакого быдла, драк, криков и агрессии. Это не ринг, это клуб. 

Фоткать чужих без спроса не надо, уважаем личное пространство. 

А, и еще: если ломаешь что-то из нашего, будь готов заплатить. Это наши любимые стены, и мы о них заботимся.`
    },
    {
      id: '4',
      question: 'Правила входа и выхода',
      answer: `Билет дает право на один вход. Если вышел, то чтобы вернуться, придется снова платить. Так что, когда ты внутри, ты внутри. Сосредоточься на моменте. 

Если ты нарушаешь правила, если портишь атмосферу, мы попросим тебя на выход. Без обид и без возврата денег за билет. Мы тут для своих, а не для проблемных.`
    }
  ]

  return (
    <div className="min-h-screen pt-20 relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-block px-8 py-2 mb-4">
            <h1 className="text-4xl md:text-6xl font-display font-extrabold text-white lowercase text-stretch-heading">
              правила <NeonText variant="red" size="5xl" glow>vnvnc</NeonText>
            </h1>
          </div>
        </motion.div>

        {/* Intro Text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center mb-12 max-w-3xl mx-auto"
        >
          <div className="radius-xl p-8 backdrop-blur-md border border-white/10"
               style={{ backgroundColor: colors.glass.darker }}>
            <p className="text-lg text-white/90 leading-relaxed">
              Мы не про скучные юридические тексты, но чтобы все наши вечера были в кайф, есть пара моментов, которые стоит помнить. VNVNC — это не просто адрес, это наша атмосфера. И мы хотим, чтобы она оставалась такой, какой ты ее любишь.
            </p>
          </div>
        </motion.div>

        {/* Icons Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex justify-center gap-8 mb-12"
        >
          <div className="flex flex-col items-center gap-2">
            <div className="p-3 radius-lg" style={{ backgroundColor: colors.glass.dark }}>
              <Shield size={24} style={{ color: colors.neon.red }} />
            </div>
            <span className="text-sm text-white/60">🛡️ Безопасность</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="p-3 radius-lg" style={{ backgroundColor: colors.glass.dark }}>
              <Heart size={24} style={{ color: colors.neon.red }} />
            </div>
            <span className="text-sm text-white/60">❤️ Уважение</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="p-3 radius-lg" style={{ backgroundColor: colors.glass.dark }}>
              <Sparkles size={24} style={{ color: colors.neon.red }} />
            </div>
            <span className="text-sm text-white/60">✨ Атмосфера</span>
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
              <h3 className="font-bold text-white mb-2">⚡ Важно помнить</h3>
              <p className="text-white/80 leading-relaxed">
                VNVNC — это про взаимное уважение и крутую атмосферу. Мы строим это место вместе с тобой, 
                и каждый вечер здесь — это история, которую мы создаём. Администрация заботится о безопасности 
                и комфорте всех гостей, поэтому оставляет за собой право принимать решения о допуске в клуб. 
                Если что-то пошло не так — не переживай, бывает. Главное — мы все здесь для того, чтобы 
                классно провести время, танцевать под отличную музыку и чувствовать себя свободно. 
                Соблюдение правил — это твой вклад в атмосферу VNVNC. Спасибо, что ты с нами! 🖤
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default RulesPage