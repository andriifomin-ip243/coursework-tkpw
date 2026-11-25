export const apparelItems = [
  {
    id: '1',
    name: 'Футболка "Street Toxic: Dragon"',
    collection: 'Street Toxic',
    category: 'Футболки', // Додали поле category для фільтрації
    price: 950,
    status: 'available',
    statusLabel: 'В наявності',
    description: 'Лімітована футболка оверсайз крою з авторським принтом у стилі темного стрітвеару. Щільний бавовняний трикотаж.',
    images: [
    { id: 1, url: '/images/Dragon.jpg', title: 'Принт' },
  ]
  },
  {
    id: '2',
    name: 'Худі "Antique Hades"',
    collection: 'Greek Mythology',
    category: 'Худі',
    price: 1650,
    status: 'preorder',
    statusLabel: 'Передзамовлення',
    description: 'Тепле худі з начісом із щільної тринитки. Глибокий капюшон, вінтажний графічний елемент на спині.',
    images: [
    { id: 1, url: '/images/Antique-Hades.jpg', title: 'Принт' },
  ]
  },
  {
    id: '3',
    name: 'Футболка "Lanos 1.5 Special"',
    collection: 'Retro Auto',
    category: 'Футболки',
    price: 850,
    status: 'soldout',
    statusLabel: 'Розпродано',
    description: 'Іронічний ретро-принт, присвячений культовій класиці українських доріг. Лише 50 екземплярів.',
    images: [
    { id: 1, url: '/images/Lanos1.5Special.jpg', title: 'Принт' },
  ]
  },
  {
  id: 'cyber-otaman-hoodie',
  name: 'Худі "Cyber Otaman"',
  collection: 'Cyberpunk UA',
  price: 1750,
  status: 'available',
  statusLabel: 'В наявності',
  description: 'Футуристичне худі зі світловідбивними елементами та кіберпанк-графікою на грудях.',
  category: 'Худі',
  images: [
    { id: 1, url: '/images/hudi1.jpg', title: 'Вигляд спереду' },
    { id: 2, url: '/images/hudi2.jpg', title: 'Вигляд ззаду' },
    { id: 3, url: '/images/hudi3.jpg', title: 'Деталі принта' }
  ]
  },
  {
    id: '5',
    name: 'Футболка "Kyiv Brutalism"',
    collection: 'Architecture',
    category: 'Футболки',
    price: 900,
    status: 'available',
    statusLabel: 'В наявності',
    description: 'Принт із зображенням бруталістських обєктів столиці. Преміальна варена бавовна.',
    images: [
    { id: 1, url: '/images/Kyiv.jpg', title: 'Принт' },
  ]
  },
  {
    id: '6',
    name: 'Шопер MERA "Grave"',
    collection: 'Accessories',
    category: 'Аксесуари',
    price: 450,
    status: 'available',
    statusLabel: 'В наявності',
    description: 'Міцний тканинний шопер із щільного саржевого полотна для повсякденного носіння.',
    images: [
    { id: 1, url: '/images/Grave.jpg', title: 'Принт' },
  ]
  },
  {
    id: '7',
    name: 'Штани Cargo "MERA Tactical"',
    category: 'Штани',
    collection: 'UTILITY 2026',
    price: 1650,
    status: 'In Stock',
    statusLabel: 'В наявності',
    description: 'Вільні карго-штани з міцної саржі з фіксованими ременями та глибокими кишенями.',
    images: [
    { id: 1, url: '/images/Tactical.jpg', title: 'Принт' },
  ]
  },
  {
    id: '8',
    name: 'Лонгслів "Cybernet Dark"',
    category: 'Лонгсліви',
    collection: 'CYBERPUNK',
    price: 1100,
    status: 'In Stock',
    statusLabel: 'В наявності',
    description: 'Щільний лонгслів з мінімалістичними світловідбиваючими принтами на рукавах.',
    images: [
    { id: 1, url: '/images/Cybernet.jpg', title: 'Принт' },
  ]
  },
  {
    id: '9',
    name: 'Вітровка "MERA Windrunner"',
    category: 'Верхній одяг',
    collection: 'OUTERWEAR',
    price: 2400,
    status: 'Pre-order',
    statusLabel: 'Передзамовлення',
    description: 'Легка та вологозахисна вітровка вільного крою з глибоким капюшоном.',
    images: [
    { id: 1, url: '/images/Windrunner.jpg', title: 'Принт' },
  ]
  },
  {
    id: '10', // важливо зробити рядком, щоб useParams() чітко знаходив за ID
    name: 'Шкарпетки високі "MERA Classic"',
    category: 'Аксесуари',
    collection: 'ESSENTIALS',
    price: 350,
    status: 'available',
    statusLabel: 'В наявності',
    description: 'Зміцнені спортивні шкарпетки з жаккардовим логотипом бренду.',
    images: [
      { id: 1, url: '/images/socks_black.jpg', title: 'Чорний', color: 'Чорний' },
      { id: 2, url: '/images/socks_gray.jpg', title: 'Сірий', color: 'Сірий' },
      { id: 3, url: '/images/socks_white.jpg', title: 'Білий', color: 'Білий' }
    ]
  }
]