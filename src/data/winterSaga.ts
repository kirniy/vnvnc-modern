import { colors } from '../utils/colors'

export interface SagaEventConfig {
    id?: string
    title: string
    date: string
    subtitle: string
    image?: string
    description: string
    gridSpan: '1x1' | '2x1' | '2x2'
    accentColor: string
    hooks?: {
        main: string
        story: string
        alternate?: string
    }
    audience?: {
        age: string
        perfectFor: string[] // Changed to array for cycling text
        notFor?: string
    }
    energyLevel?: number // 1-5, mapping to stars or intensity
    vibeLabel?: string // NEW: Unique visual label for the event vibe (e.g. "PURE CHAOS")
    vibeIcons?: string[] // NEW: Array of 5 icon names for the modal energy field
    visualTheme?: string
    dressCode?: string
    tags: string[]
    twinEventDates?: {
        date: string
        titleSuffix?: string // e.g. "Day 1"
    }[]
}

export const WINTER_SAGA_DATA: SagaEventConfig[] = [
    {
        date: '26-27.12',
        title: 'ПОЛЯРНЫЙ ЭКСПРЕСС',
        subtitle: 'СТАРТ САГИ',
        description: 'Поезд отправляется. Следующая остановка — где-то между льдом и северным сиянием. Старт Саги.',
        visualTheme: 'Лёд, северное сияние, полярная ночь',
        dressCode: 'FREE вход в полном костюме Санты',
        tags: ['#зима', '#фэнтези', '#фото', '#визуал', '#старт_саги', '#два_дня'],
        accentColor: colors.neon.blue,
        gridSpan: '1x1',
        vibeLabel: 'MAGICAL JOURNEY',
        vibeIcons: ['Snowflake', 'Wind', 'Map', 'Compass', 'Mountain'],
        hooks: {
            main: 'поезд отправляется. следующая остановка — где-то между льдом и северным сиянием',
            alternate: 'декабрь заканчивается быстрее чем сезон любимого сериала. успеваем запрыгнуть в последний вагон',
            story: 'лёд, снег и генератор искусственного снега на входе. фото будут как из другого мира'
        },
        audience: {
            perfectFor: [
                'для тех, кто ценит визуал больше чем жесткий слэм',
                'для искателей идеальных кадров в полярной ночи',
                'для любителей зимней сказки и северного сияния'
            ],
            notFor: 'тех, кто хочет жёсткий танцпол с первой минуты и не понимает зачем нужны фотозоны',
            age: '18-35'
        },
        energyLevel: 3,
        twinEventDates: [
            { date: '26.12', titleSuffix: 'Day 1' },
            { date: '27.12', titleSuffix: 'Day 2' }
        ]
    },
    {
        date: '31.12',
        title: 'ВОРОНИЙ БАЛ',
        subtitle: 'КУЛЬМИНАЦИЯ',
        description: 'Тайное общество приглашает избранных. Маски обязательны, пафос — нет. Главная ночь года.',
        visualTheme: 'Бордовый, чёрный, золото, перья',
        dressCode: 'Black Tie, Маски, Готика',
        tags: ['#новый_год', '#маскарад', '#мистика', '#элегантность', '#главное_событие'],
        accentColor: '#FFD700', // Gold/Burgundy Theme
        gridSpan: '2x2',
        vibeLabel: 'SECRET SOCIETY',
        vibeIcons: ['Crown', 'Key', 'Feather', 'Eye', 'Wine'],
        hooks: {
            main: 'тайное общество приглашает избранных. маски обязательны, пафос — нет',
            alternate: 'новый год без оливье под телевизор. бордовый бархат, золотые свечи, чёрные перья',
            story: 'иммерсивный новогодний бал. бордовый бархат, золотые свечи, чёрные перья'
        },
        audience: {
            perfectFor: [
                'для тех, кто устал от скучных корпоративов',
                'для желающих встретить новый год как в кино',
                'для избранных, кто ценит тайны и маски'
            ],
            notFor: 'любителей классического нового года под телевизор с семьёй и шампанским в полночь',
            age: '23-40'
        },
        energyLevel: 4
    },
    {
        date: '01-02.01',
        title: 'SLEEPOVER',
        subtitle: 'ПИЖАМНАЯ ВЕЧЕРИНКА',
        description: '1 января. Голова гудит. Тело просит покоя. Приходи в пижаме, серьёзно.',
        visualTheme: 'Уют, домашняя атмосфера',
        dressCode: 'Пижамы, халаты, тапочки',
        tags: ['#уют', '#пижамы', '#расслабон', '#кино', '#1_января', '#два_дня'],
        accentColor: colors.neon.blue,
        gridSpan: '1x1',
        vibeLabel: 'COZY HANGOVER',
        vibeIcons: ['Moon', 'Coffee', 'BedDouble', 'Home', 'Sunrise'],
        hooks: {
            main: '1 января. голова гудит. тело просит покоя. приходи в пижаме, серьёзно',
            alternate: 'похмелье — тоже праздник, если правильно отмечать. пледы, какао, кино фоном',
            story: 'вайб: проснулся 1 января у друзей и решил остаться до вечера'
        },
        audience: {
            perfectFor: [
                'для уставших после главной ночи года',
                'для тех, кто хочет продолжить праздник, но лёжа',
                'для любителей домашнего уюта в клубном формате'
            ],
            notFor: 'тех, кто ждёт «продолжения банкета» на полную мощность с танцами до утра',
            age: '18-30'
        },
        energyLevel: 2,
        twinEventDates: [
            { date: '01.01', titleSuffix: 'Day 1' },
            { date: '02.01', titleSuffix: 'Day 2' }
        ]
    },
    {
        date: '03.01',
        title: '2K17',
        subtitle: 'НАЗАД В 2017',
        description: 'Возвращение в легендарный 2017-й. Розовое вино, хайпбист-культура и главные бэнгеры эпохи.',
        visualTheme: 'Инстаграм 2016-2017, Глитч',
        dressCode: 'Хайпбист, Стритвир, Оверсайз',
        tags: ['#ностальгия', '#хипхоп', '#рэп', '#2010е', '#face', '#элджей'],
        accentColor: colors.neon.pink,
        gridSpan: '1x1',
        vibeLabel: 'SOUNDS LIKE',
        vibeIcons: ['Smartphone', 'Camera', 'Headphones', 'Flame', 'Heart'],
        hooks: {
            main: '2017 год — это когда face ещё читал про бургер, а элджей был на пике. вспоминаем',
            alternate: 'вернись в год, когда все носили поясные сумки и слушали lil pump без иронии',
            story: 'хайп-культура твоей юности. худи оверсайз приветствуется'
        },
        audience: {
            perfectFor: [
                'для ностальгирующих по 2017-му году',
                'для тех, кто помнит "розовое вино" наизусть',
                'для поколения хайпбистов и новой школы'
            ],
            notFor: 'олдскульщиков, рок-фанатов и тех, кто не слушает русский рэп',
            age: '20-27'
        },
        energyLevel: 4
    },
    {
        date: '04.01',
        title: 'GRINCHMAS',
        subtitle: 'РОЖДЕСТВО С ХАРАКТЕРОМ',
        description: 'Зелёный похититель Рождества в здании! Эльфы, леденцы и красно-зелёный хаос.',
        visualTheme: 'Зелёный и Красный, Мультяшный',
        dressCode: 'Уродливые Свитера, Эльфийские Уши',
        tags: ['#рождество', '#юмор', '#гринч', '#конкурс_свитеров', '#западное_рождество'],
        accentColor: colors.neon.blue,
        gridSpan: '1x1',
        vibeLabel: 'COZY HANGOVER',
        vibeIcons: ['Moon', 'Coffee', 'BedDouble', 'Home', 'Sunrise'],
        hooks: {
            main: 'рождество украдено. веселье — нет. зелёный, вредный и абсолютно твой',
            alternate: 'классическое американское рождество с хулиганским оттенком. конкурс уродливых свитеров включён',
            story: 'праздник для тех, кто устал от праздников, но ещё не готов остановиться'
        },
        audience: {
            perfectFor: [
                'для фанатов эстетики западного рождества',
                'для любителей черного юмора и гринча',
                'для обладателей самых нелепых свитеров'
            ],
            notFor: 'тех, кто ждёт традиционное русское рождество с ёлкой и мандаринами',
            age: '20-35'
        },
        energyLevel: 3
    },
    {
        date: '05.01',
        title: 'ROCK',
        subtitle: 'РОК ВЕЧЕРИНКА',
        description: 'Гитары громче. Танцы жёстче. Рок-н-ролл никогда не умирал, просто ждал своего часа.',
        visualTheme: 'Гранж, Огонь, Тьма',
        dressCode: 'Рок, Кожа, Цепи, Черное',
        tags: ['#рок', '#гитары', '#драйв', '#nirvana', '#linkin_park', '#ac_dc'],
        accentColor: colors.neon.red,
        gridSpan: '1x1',
        vibeLabel: 'SOUNDS LIKE',
        vibeIcons: ['Zap', 'Music', 'Mic', 'Speaker', 'Radio'],
        hooks: {
            main: 'гитары громче. танцы жёстче. nirvana, ac/dc, linkin park — в клубном формате',
            alternate: 'рок-н-ролл никогда не умирал, просто ждал воскресенье в vnvnc',
            story: 'бас качает как сабвуфер в девятке. косухи приветствуются'
        },
        audience: {
            perfectFor: [
                'для истинных фанатов рока и драйва',
                'для тех, кто устал от рэпа и попсы',
                'для любителей слэма и живой энергетики'
            ],
            notFor: 'любителей edm, хип-хопа и тех, кто не переносит гитары и длинные волосы',
            age: '22-40'
        },
        energyLevel: 5
    },
    {
        date: '06-07.01',
        title: 'ПЛАТФОРМА 9¾',
        subtitle: 'МИР МАГИИ',
        description: 'Портал открыт. Сливочное пиво на баре, распределение по факультетам на входе.',
        visualTheme: 'Магия, Хогвартс, Свечи',
        dressCode: 'Мантии, Шарфы факультетов',
        tags: ['#гарри_поттер', '#магия', '#факультеты', '#иммерсив', '#два_дня', '#сливочное_пиво'],
        accentColor: '#ffd700',
        gridSpan: '2x1',
        vibeLabel: 'TECHNO MAGIC',
        vibeIcons: ['Sparkles', 'Scroll', 'FlaskConical', 'GraduationCap', 'Key'],
        hooks: {
            main: 'портал открыт. сливочное пиво на баре, распределение по факультетам на входе',
            alternate: 'хогвартс для взрослых. два дня: светлый (уют первых фильмов) и тёмный (пожиратели смерти)',
            story: 'парящие свечи под потолком, шарфы факультетов и квиддич-понг вместо бир-понга'
        },
        audience: {
            perfectFor: [
                'для поттероманов, до сих пор ждущих сову',
                'для мечтающих окунуться в мир магии',
                'для желающих выпить сливочного пива'
            ],
            notFor: 'тех, кто не смотрел ни одного фильма про гарри поттера',
            age: '18-32'
        },
        energyLevel: 3,
        twinEventDates: [
            { date: '06.01', titleSuffix: 'Светлый День' },
            { date: '07.01', titleSuffix: 'Тёмная Ночь' }
        ]
    },
    {
        date: '08.01',
        title: 'CLUB HITS',
        subtitle: 'ЗОЛОТЫЕ НУЛЕВЫЕ',
        description: 'Золотая эра клубной музыки нулевых. David Guetta, Benny Benassi и гламур.',
        visualTheme: 'Дискошары, Лазеры, 00-е',
        dressCode: 'Клубные Детки 00-х',
        tags: ['#нулевые', '#дискотека', '#поп', '#lady_gaga', '#lmfao'],
        accentColor: colors.neon.blue,
        gridSpan: '1x1',
        vibeLabel: 'SOUNDS LIKE',
        vibeIcons: ['Disc3', 'Music', 'Martini', 'Play', 'Glasses'],
        hooks: {
            main: 'lady gaga, black eyed peas, lmfao — когда в клубах играла музыка, а не контент',
            alternate: 'золотая эра нулевых. дискошар включён, чувство ностальгии — бесплатно',
            story: '2000-е вернулись. если помнишь crazy frog — тебе сюда'
        },
        audience: {
            perfectFor: [
                'для детей нулевых, скучающих по MTV',
                'для тех, кто хочет танцевать под хиты детства',
                'для ценителей гламура и страз начала века'
            ],
            notFor: 'молодёжь 18-22, которая не застала эру mtv',
            age: '25-38'
        },
        energyLevel: 5
    },
    {
        date: '09-10.01',
        title: 'HO HO HO',
        subtitle: 'ФИНАЛ САГИ',
        description: 'Санты устали. Праздник закончен. Финал Саги. Плохой Санта одобряет.',
        visualTheme: 'Треш Кристмас, Конфетти',
        dressCode: 'Костюмы Санты',
        tags: ['#финал_саги', '#антирождество', '#санта', '#юмор', '#bad_santa', '#два_дня'],
        accentColor: colors.neon.red,
        gridSpan: '1x1',
        vibeLabel: 'BAD SANTA',
        vibeIcons: ['Gift', 'Trash2', 'Beer', 'Frown', 'AlertTriangle'],
        hooks: {
            main: 'санты устали. праздник закончен. вечеринка — нет. финал саги в два дня',
            alternate: 'плохой санта одобряет. пьяные санты, упавшие ёлки, конкурс худшего костюма',
            story: 'прощаемся с праздниками так, как и начинали — громко и без сожалений'
        },
        audience: {
            perfectFor: [
                'для тех, кто готов закрыть сезон с размахом',
                'для любителей черного юмора и треша',
                'для желающих оторваться напоследок'
            ],
            notFor: 'семейных людей с детьми, тех кто верит в деда мороза',
            age: '21-35'
        },
        energyLevel: 4,
        twinEventDates: [
            { date: '09.01', titleSuffix: 'Day 1' },
            { date: '10.01', titleSuffix: 'Day 2' }
        ]
    }
]
