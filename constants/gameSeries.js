// src/constants/gameSeries.js
// Shared configuration for all game series across the app

export const gameSeries = [
  {
    id: 1,
    name: 'Yu-Gi-Oh!',
    domain: 'ygo', // This maps to card_type in API
    logoUrl: 'https://www.yugioh-card.com/en/wp-content/uploads/2020/04/logo-main.png',
    color: '#8B0000',
  },
  {
    id: 2,
    name: 'Pokémon',
    domain: 'pkm',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/International_Pok%C3%A9mon_logo.svg/640px-International_Pok%C3%A9mon_logo.svg.png',
    color: '#FFCB05',
  },
  {
    id: 3,
    name: 'Magic: The Gathering',
    domain: 'mtg',
    logoUrl: 'https://www.icomedia.eu/wp-content/uploads/2021/03/MTG_Primary_LL_1c_Black_LG_V12.png',
    color: '#F15A24',
  },
  {
    id: 4,
    name: 'Gundam',
    domain: 'gundam',
    logoUrl: 'https://travellingman.com/cdn/shop/files/gundam-card-game-newtype-rising-booster-box-gd01-499905_1200x1200.webp?v=1756386542',
    color: '#1a1a1a',
  },
  {
    id: 5,
    name: 'Riftbound',
    domain: 'riftbound',
    logoUrl: 'https://cmsassets.rgpub.io/sanity/images/dsfx7636/news/23d41c7809a48a013f3d8a7204b81fb4d8bdb164-10000x4389.png?auto=format&fit=fill&q=80&w=460',
    color: '#1a1a1a',
  },
];

// Helper function to get series by domain
export const getSeriesByDomain = (domain) => {
  return gameSeries.find(series => series.domain === domain);
};