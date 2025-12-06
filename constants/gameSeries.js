// src/constants/gameSeries.js
// Shared configuration for all game series across the app

export const gameSeries = [
  {
    id: 1,
    name: 'Yu-Gi-Oh!',
    domain: 'ygo', // This maps to card_type in API
    logoUrl: require('@/assets/images/ygo_banner.png'),
    color: '#8B0000',
  },
  {
    id: 2,
    name: 'Pokémon',
    domain: 'pkm',
    logoUrl: require('@/assets/images/pkm_banner.png'),
    color: '#FFCB05',
  },
//   {
//     id: 3,
//     name: 'Magic: The Gathering',
//     domain: 'mtg',
//     logoUrl: 'https://www.icomedia.eu/wp-content/uploads/2021/03/MTG_Primary_LL_1c_Black_LG_V12.png',
//     color: '#F15A24',
//   },
//   {
//     id: 4,
//     name: 'Gundam',
//     domain: 'gundam',
//     logoUrl: 'https://travellingman.com/cdn/shop/files/gundam-card-game-newtype-rising-booster-box-gd01-499905_1200x1200.webp?v=1756386542',
//     color: '#1a1a1a',
//   },
  {
    id: 5,
    name: 'Riftbound',
    domain: 'rb',
    logoUrl: require('@/assets/images/rb_banner.png'),
    color: '#1a1a1a',
  },
];

// Helper function to get series by domain
export const getSeriesByDomain = (domain) => {
  return gameSeries.find(series => series.domain === domain);
};