export type CategoryDefinition = {
  slug: string;
  label: string;
  description: string;
  gradient: string;
  image: string;
};

export const categories: CategoryDefinition[] = [
  {
    slug: 'strikers',
    label: 'Strikers',
    description: 'Papeles brillantes para notebooks, cascos y skates.',
    gradient: 'linear-gradient(135deg,#00b4d8,#0096c7)',
    image: '/images/categories/strikers.svg'
  },
  {
    slug: 'stickers-personalizados',
    label: 'Stickers personalizados',
    description: 'Subí tu idea o logo y lo convertimos en sticker premium.',
    gradient: 'linear-gradient(135deg,#8f8df2,#5c58e5)',
    image: '/images/categories/personalizados.svg'
  },
  {
    slug: 'planchas-tematicas',
    label: 'Planchas tematicas',
    description: 'Colecciones listas para tus packs o regalos.',
    gradient: 'linear-gradient(135deg,#0122a5,#2746f0)',
    image: '/images/categories/tematicas.svg'
  },
  {
    slug: 'promo-emprendedor',
    label: 'Promo emprendedor',
    description: 'Combos económicos para emprendedores.',
    gradient: 'linear-gradient(135deg,#dcf343,#a6f341)',
    image: '/images/categories/promo.svg'
  },
  {
    slug: 'vinilos-especiales',
    label: 'Vinilos especiales',
    description: 'Material premium para superficies exigentes.',
    gradient: 'linear-gradient(135deg,#001659,#003d8e)',
    image: '/images/categories/vinilos.svg'
  },
  {
    slug: 'planchas-personalizadas',
    label: 'Planchas personalizadas',
    description: 'Elegí tamaños, acabados y cantidades.',
    gradient: 'linear-gradient(135deg,#ffd6ff,#8f8df2)',
    image: '/images/categories/planchas.svg'
  },
  {
    slug: 'pack-mayoristas',
    label: 'Pack mayoristas',
    description: 'Pedidos grandes para revender o eventos.',
    gradient: 'linear-gradient(135deg,#00a6fb,#0477c9)',
    image: '/images/categories/mayoristas.svg'
  }
];
