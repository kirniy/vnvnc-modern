import { motion } from 'framer-motion'

const ReservationsPage = () => {
  const tableTypes = [
    {
      name: 'Стол на 3 человека',
      price: 10500,
      description: 'Идеально для небольшой компании',
      capacity: 3,
    },
    {
      name: 'Стол на 4 человека',
      price: 14000,
      description: 'Стандартный стол для друзей',
      capacity: 4,
    },
    {
      name: 'VIP ложа на 10-14 человек',
      price: 35000,
      description: 'Эксклюзивная зона с лучшим видом',
      capacity: 14,
    },
  ]

  return (
    <div className="min-h-screen pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-black mb-4">
            Бронирование <span className="text-primary-600">столов</span>
          </h1>
          <p className="text-xl text-gray-600">
            Забронируйте стол в лучшем клубе Санкт-Петербурга
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Reservation Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-gray-50 rounded-xl p-8"
          >
            <h2 className="text-2xl font-bold text-black mb-6">Забронировать стол</h2>
            
            <form className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Имя
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                  placeholder="Ваше имя"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Телефон
                </label>
                <input
                  type="tel"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                  placeholder="+7 (999) 123-45-67"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Дата
                </label>
                <input
                  type="date"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Количество гостей
                </label>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent">
                  {[2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18].map(num => (
                    <option key={num} value={num}>{num} человек</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Тип стола
                </label>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent">
                  {tableTypes.map(table => (
                    <option key={table.name} value={table.name}>
                      {table.name} - {table.price}₽
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Комментарии
                </label>
                <textarea
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                  placeholder="Особые пожелания..."
                />
              </div>

              <button type="submit" className="w-full btn-primary">
                Забронировать стол
              </button>
            </form>
          </motion.div>

          {/* Pricing Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold text-black mb-6">Цены на столы</h2>
            
            <div className="space-y-4">
              {tableTypes.map((table, index) => (
                <motion.div
                  key={table.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="card p-6"
                >
                  <h3 className="text-lg font-semibold text-black mb-2">{table.name}</h3>
                  <p className="text-gray-600 mb-2">{table.description}</p>
                  <p className="text-2xl font-bold text-primary-600">{table.price}₽</p>
                  <p className="text-sm text-gray-500">Депозит: 1000₽</p>
                </motion.div>
              ))}
            </div>

            <div className="bg-primary-50 rounded-lg p-6">
              <h3 className="font-semibold text-black mb-2">Важно знать</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Бронь сохраняется до 00:00</li>
                <li>• В депозит включен сервисный сбор 10%</li>
                <li>• Депозит можно потратить на бар и кухню</li>
                <li>• VIP-вход без очереди</li>
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default ReservationsPage
