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
        perfectFor: string[]
        notFor?: string
    }
    energyLevel?: number
    vibeLabel?: string
    vibeIcons?: string[]
    visualTheme?: string
    dressCode?: string
    tags: string[]
    // Updated: Twin dates can now override almost any field
    twinEventDates?: {
        date: string
        titleSuffix?: string
        subtitle?: string
        description?: string
        hooks?: {
            main: string
            story: string
            alternate?: string
        }
        visualTheme?: string
        dressCode?: string
        audience?: {
            age: string
            perfectFor: string[]
            notFor?: string
        }
        vibeLabel?: string
    }[]
}

export const WINTER_SAGA_DATA: SagaEventConfig[] = [
    {
        date: '26-27.12',
        title: 'ПОЛЯРНЫЙ ЭКСПРЕСС',
        subtitle: 'СТАРТ САГИ',
        description: 'Поезд отправляется. Следующая остановка — где-то между льдом и северным сиянием.',
        visualTheme: 'Лёд, северное сияние, полярная ночь',
        dressCode: 'FREE вход в полном костюме Санты',
        tags: ['#зима', '#арктика', '#пингвины', '#визуал', '#старт_саги', '#два_дня'],
        accentColor: colors.neon.blue,
        gridSpan: '1x1',
        vibeLabel: 'MAGICAL JOURNEY',
        vibeIcons: ['Snowflake', 'Wind', 'Map', 'Compass', 'Mountain'],
        hooks: {
            main: 'поезд отправляется. следующая остановка — где-то между льдом и северным сиянием',
            alternate: 'декабрь заканчивается быстрее чем сезон любимого сериала. успеваем в последний вагон',
            story: 'первая глава зимней саги. два дня в арктической эстетике'
        },
        audience: {
            perfectFor: [
                'для тех, кто ценит визуал и эстетику',
                'для охотников за красивыми кадрами',
                'для любителей зимней сказки',
                'для пар на предновогоднем свидании',
                'для тех, кто хочет начать праздники красиво',
                'для ценителей тематических вечеринок'
            ],
            notFor: 'тех, кто ищет жёсткий танцпол с первой минуты',
            age: '18-35'
        },
        energyLevel: 3,
        twinEventDates: [
            {
                date: '26.12',
                titleSuffix: 'Day 1',
                subtitle: 'ОТПРАВЛЕНИЕ',
                description: 'Первый гудок. Посадка на борт Полярного Экспресса. Начало большого зимнего путешествия.',
                hooks: {
                    main: 'первый день саги. официальное открытие зимнего сезона',
                    story: 'старт ровно в 23:00. не опаздывай на перрон',
                    alternate: 'начало легенды. будь первым, кто увидит это'
                }
            },
            {
                date: '27.12',
                titleSuffix: 'Day 2',
                subtitle: 'ПУТЬ НА СЕВЕР',
                description: 'Экспресс набирает ход. Вторая ночь в пути — глубже в атмосферу севера и ледяных коктейлей.',
                hooks: {
                    main: 'билет в один конец. вторая ночь полярного путешествия',
                    story: 'для тех, кто не успел на открытие — второй шанс попасть в сказку',
                    alternate: 'вечеринка уже в разгаре. присоединяйся к маршруту'
                }
            }
        ]
    },
    {
        date: '31.12',
        title: 'ВОРОНИЙ БАЛ',
        subtitle: 'КУЛЬМИНАЦИЯ',
        description: 'Тайное общество приглашает избранных. Маски обязательны. Главная ночь года.',
        visualTheme: 'Бордовый, чёрный, золото, перья',
        dressCode: 'Black Tie, Маски, Готика',
        tags: ['#новый_год', '#маскарад', '#мистика', '#элегантность', '#главное_событие'],
        accentColor: '#FFD700',
        gridSpan: '2x2',
        vibeLabel: 'SECRET SOCIETY',
        vibeIcons: ['Crown', 'Key', 'Feather', 'Eye', 'Wine'],
        hooks: {
            main: 'тайное общество приглашает избранных. маски обязательны',
            alternate: 'новый год, который ты запомнишь. бордовый бархат, золото, чёрные перья',
            story: 'кульминация зимней саги. иммерсивный маскарад в полночь'
        },
        audience: {
            perfectFor: [
                'для тех, кто устал от корпоративов с оливье',
                'для желающих встретить новый год иначе',
                'для ценителей эстетики тайных обществ',
                'для любителей маскарадов и перевоплощений',
                'для тех, кто хочет новый год как в кино',
                'для искателей особенной ночи'
            ],
            notFor: 'любителей классического нового года под телевизор',
            age: '23-40'
        },
        energyLevel: 4
    },
    {
        date: '01-02.01',
        title: 'SLEEPOVER',
        subtitle: 'ПИЖАМНАЯ ВЕЧЕРИНКА',
        description: '1 января. Голова гудит. Тело просит покоя. Приходи в пижаме.',
        visualTheme: 'Уют, мягкий свет, домашний комфорт',
        dressCode: 'Пижамы, халаты, кигуруми',
        tags: ['#уют', '#пижамы', '#расслабон', '#кино', '#1_января', '#два_дня'],
        accentColor: colors.neon.blue,
        gridSpan: '1x1',
        vibeLabel: 'COZY HANGOVER',
        vibeIcons: ['Moon', 'Coffee', 'BedDouble', 'Home', 'Sunrise'],
        hooks: {
            main: '1 января. голова гудит. тело просит покоя. приходи в пижаме',
            alternate: 'похмелье — тоже праздник, если правильно его встретить',
            story: 'проснулся у друзей и решил остаться до вечера'
        },
        audience: {
            perfectFor: [
                'для уставших после главной ночи года',
                'для тех, кто хочет продолжить праздник лёжа',
                'для любителей домашнего уюта',
                'для интровертов, которые всё равно хотят тусоваться',
                'для владельцев красивых пижам и кигуруми',
                'для тех, кто не готов заканчивать праздники'
            ],
            notFor: 'тех, кто ждёт продолжения банкета на полную мощность',
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
        description: 'Возвращение в легендарный 2017-й. Когда face читал про бургер, а элджей собирал стадионы.',
        visualTheme: 'Хайп-эра, глитч, инстаграм 2017',
        dressCode: 'Хайпбист, Стритвир, Оверсайз',
        tags: ['#ностальгия', '#эпоха', '#thrasher', '#2010е', '#face', '#элджей'],
        accentColor: colors.neon.pink,
        gridSpan: '1x1',
        vibeLabel: 'SOUNDS LIKE',
        vibeIcons: ['Smartphone', 'Camera', 'Headphones', 'Flame', 'Heart'],
        hooks: {
            main: '2017 — когда face читал про бургер, а элджей был на пике. вспоминаем',
            alternate: 'год поясных сумок, розового вина и lil pump без иронии',
            story: 'хайп-культура твоей юности. худи оверсайз приветствуется'
        },
        audience: {
            perfectFor: [
                'для тех, кто помнит розовое вино наизусть',
                'для ностальгирующих по хайп-эре',
                'для поколения новой школы рэпа',
                'для тех, кому 20-27 и хочется вспомнить',
                'для любителей pharaoh, face, элджея',
                'для владельцев поясных сумок и худи оверсайз'
            ],
            notFor: 'олдскульщиков и тех, кто не слушает русский рэп',
            age: '20-27'
        },
        energyLevel: 4
    },
    {
        date: '04.01',
        title: 'GRINCHMAS',
        subtitle: 'РОЖДЕСТВО С ХАРАКТЕРОМ',
        description: 'Рождество украдено. Веселье — нет. Зелёный, вредный и абсолютно твой.',
        visualTheme: 'Красно-зелёный хаос, американское рождество',
        dressCode: 'Уродливые свитера, эльфийские уши',
        tags: ['#рождество', '#юмор', '#гринч', '#конкурс_свитеров', '#западное_рождество'],
        accentColor: colors.neon.green,
        gridSpan: '1x1',
        vibeLabel: 'COZY HANGOVER',
        vibeIcons: ['TreePine', 'Gift', 'Candy', 'Laugh', 'ThumbsDown'],
        hooks: {
            main: 'рождество украдено. веселье — нет. зелёный, вредный и абсолютно твой',
            alternate: 'американское рождество с хулиганским оттенком',
            story: 'праздник для тех, кто устал от праздников'
        },
        audience: {
            perfectFor: [
                'для фанатов эстетики западного рождества',
                'для любителей чёрного юмора',
                'для обладателей нелепых свитеров',
                'для тех, кто знает гринча наизусть',
                'для уставших от новогоднего пафоса',
                'для ценителей ироничных вечеринок'
            ],
            notFor: 'тех, кто ждёт традиционное рождество с ёлкой и мандаринами',
            age: '20-35'
        },
        energyLevel: 3
    },
    {
        date: '05.01',
        title: 'ROCK',
        subtitle: 'РОК ВЕЧЕРИНКА',
        description: 'Гитары громче. Танцы жёстче. Рок-н-ролл никогда не умирал.',
        visualTheme: 'Гранж, огонь, тьма',
        dressCode: 'Рок, кожа, цепи, чёрное',
        tags: ['#рок', '#гитары', '#драйв', '#nirvana', '#linkin_park', '#ac_dc'],
        accentColor: colors.neon.red,
        gridSpan: '1x1',
        vibeLabel: 'SOUNDS LIKE',
        vibeIcons: ['Zap', 'Music', 'Mic', 'Speaker', 'Radio'],
        hooks: {
            main: 'гитары громче. танцы жёстче. nirvana, ac/dc, linkin park в клубном формате',
            alternate: 'рок-н-ролл никогда не умирал. он ждал воскресенье в vnvnc',
            story: 'для тех, кто устал от хип-хопа. косухи приветствуются'
        },
        audience: {
            perfectFor: [
                'для истинных фанатов рока',
                'для тех, кто устал от рэпа и попсы',
                'для любителей слэма и драйва',
                'для тех, кто знает все слова in the end',
                'для владельцев косух и тяжёлых ботинок',
                'для скучающих по временам mtv headbangers ball'
            ],
            notFor: 'любителей edm и хип-хопа',
            age: '22-40'
        },
        energyLevel: 5
    },
    {
        date: '06-07.01',
        title: 'ПЛАТФОРМА 9¾',
        subtitle: 'МИР МАГИИ',
        description: 'Портал открыт. Два дня в мире, о котором ты мечтал с 11 лет.',
        visualTheme: 'Хогвартс, свечи, магия',
        dressCode: 'Мантии, шарфы факультетов',
        tags: ['#гарри_поттер', '#магия', '#факультеты', '#иммерсив', '#два_дня', '#сливочное_пиво'],
        accentColor: '#ffd700',
        gridSpan: '2x1',
        vibeLabel: 'HARRY POTTER',
        vibeIcons: ['Sparkles', 'Scroll', 'FlaskConical', 'GraduationCap', 'Key'],
        hooks: {
            main: 'портал открыт. два дня в мире, о котором ты мечтал с 11 лет',
            alternate: 'хогвартс для взрослых. светлый день и тёмная ночь',
            story: 'сливочное пиво на баре. распределение по факультетам на входе'
        },
        audience: {
            perfectFor: [
                'для поттероманов всех возрастов',
                'для тех, кто до сих пор ждёт письмо из хогвартса',
                'для знающих свой факультет наизусть',
                'для любителей иммерсивных вечеринок',
                'для желающих попробовать сливочное пиво',
                'для тех, кто вырос на этих фильмах'
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
        description: 'Золотая эра клубной музыки. Когда в клубах играла музыка, а не контент.',
        visualTheme: 'Дискошары, лазеры, 2000-е',
        dressCode: 'Гламур нулевых, блёстки, низкая талия',
        tags: ['#нулевые', '#дискотека', '#поп', '#lady_gaga', '#lmfao'],
        accentColor: colors.neon.blue,
        gridSpan: '1x1',
        vibeLabel: 'SOUNDS LIKE',
        vibeIcons: ['Disc3', 'Music', 'Martini', 'Play', 'Glasses'],
        hooks: {
            main: 'lady gaga, black eyed peas, lmfao — когда в клубах играла музыка, а не контент',
            alternate: 'золотая эра нулевых. дискошар включён',
            story: 'если помнишь crazy frog — тебе сюда'
        },
        audience: {
            perfectFor: [
                'для детей нулевых, скучающих по mtv',
                'для тех, кто хочет танцевать под хиты детства',
                'для ценителей гламура и страз',
                'для помнящих эпоху до тиктока',
                'для любителей benny benassi и david guetta',
                'для тех, кто знает что такое ipod'
            ],
            notFor: 'молодёжи 18-22, которая не застала эру mtv',
            age: '25-38'
        },
        energyLevel: 5
    },
    {
        date: '09-10.01',
        title: 'HO HO HO',
        subtitle: 'ФИНАЛ САГИ',
        description: 'Санты устали. Праздник закончен. Вечеринка — нет. Финал саги.',
        visualTheme: 'Треш-рождество, хаос после праздников',
        dressCode: 'Костюмы санты (чем хуже — тем лучше)',
        tags: ['#финал_саги', '#антирождество', '#санта', '#юмор', '#bad_santa', '#два_дня'],
        accentColor: colors.neon.red,
        gridSpan: '1x1',
        vibeLabel: 'BAD SANTA',
        vibeIcons: ['Gift', 'Trash2', 'Beer', 'Frown', 'AlertTriangle'],
        hooks: {
            main: 'санты устали. праздник закончен. вечеринка — нет',
            alternate: 'плохой санта одобряет. финал саги в два дня',
            story: 'прощаемся с праздниками так же громко, как начинали'
        },
        audience: {
            perfectFor: [
                'для тех, кто готов закрыть сезон с размахом',
                'для любителей чёрного юмора',
                'для фанатов фильма bad santa',
                'для желающих оторваться напоследок',
                'для уставших от праздничного пафоса',
                'для владельцев костюмов санты любой степени потрёпанности'
            ],
            notFor: 'семейных людей и тех, кто верит в деда мороза',
            age: '21-35'
        },
        energyLevel: 4,
        twinEventDates: [
            { date: '09.01', titleSuffix: 'Day 1' },
            { date: '10.01', titleSuffix: 'Day 2' }
        ]
    }
]