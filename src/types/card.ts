// ========= This is sample interface ========= //
export interface Card {
  id: string;
  name: string;
  setName: string;
  rarity: string;
  number: number;
  image: string;
}

// ========= This is real interface ========= //
export interface CardReal {
  card_id: string;
  name: string;
  rarity: string;
  image_normal_url: string;
  image_large_url: string;
  image_thumb_url?: string;
  meta_data: YGOMetaData | PKMMetaData;
}

export interface YGOMetaData {
  type: string;
  desc: string;
  atk: number;
  def: number;
  level: number;
  race: string;
  attribute: string;
  archetype: string;
  sets: YGOCardSet[];
}

export interface YGOCardSet {
  set_code: string;
  set_name: string;
  set_price: string;
  set_rarity: string;
  set_rarity_code: string;
}

export interface PKMMetaData {
  id: string;
  name: string;
  hp: number;
  types: string[];
  stage: string;
  abilities: PKMAbility[];
  attacks: PKMAttack[];
  retreat: number;
  rarity: string;
  set: string;
  set_id: string;
  series: string;
  dexId: number[];
  illustrator: string;
  variants: Record<string, any>;
  regulationMark: string;
}

export interface PKMAbility {
  name: string;
  text: string;
}

export interface PKMAttack {
  name: string;
  cost: string[];
  damage: string;
  text: string;
}
