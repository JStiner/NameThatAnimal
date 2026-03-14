export const STORAGE_KEY = 'animalNameGeneratorAnimalOverrides';

export const names = {
  male: [
    'Archie', 'Bandit', 'Benny', 'Charlie', 'Cooper', 'Finn', 'Gus', 'Henry', 'Jasper', 'Leo',
    'Louie', 'Milo', 'Murphy', 'Oliver', 'Ollie', 'Otis', 'Ralphie', 'Roscoe', 'Teddy', 'Winston'
  ],
  female: [
    'Bella', 'Birdie', 'Bonnie', 'Daisy', 'Ellie', 'Evie', 'Gigi', 'Hazel', 'Lily', 'Lucy',
    'Luna', 'Maisie', 'Molly', 'Nora', 'Penny', 'Piper', 'Poppy', 'Rosie', 'Ruby', 'Sadie'
  ],
  neutral: [
    'Bailey', 'Biscuit', 'Blue', 'Buttons', 'Clover', 'Mochi', 'Noodle', 'Pebble', 'Pumpkin', 'Scout',
    'Skipper', 'Snickers', 'Sunny', 'Toffee', 'Waffles', 'Whiskers', 'Ziggy', 'Maple', 'Dusty', 'River'
  ]
};

export const middleWords = {
  cute: ['Bean', 'Boo', 'Cupcake', 'Honey', 'Jelly', 'Muffin', 'Peach', 'Pip', 'Sprout', 'Twinkle'],
  classic: ['Anne', 'Grace', 'James', 'Jane', 'Jo', 'Lee', 'Mae', 'Ray', 'Rose', 'Skye'],
  funny: ['Banjo', 'Biscuit', 'Bubble', 'Giggles', 'Jazz', 'Nugget', 'Pickles', 'Socks', 'Tater', 'Wobble'],
  fancy: ['Aurora', 'Celeste', 'Duchess', 'Emerald', 'Juliet', 'Magnolia', 'Pearl', 'Sterling', 'Velvet', 'Willow'],
  rustic: ['Barley', 'Cedar', 'Copper', 'Clover', 'Hickory', 'Juniper', 'Meadow', 'Oak', 'Prairie', 'Thistle']
};

export const lastWords = {
  common: ['Belle', 'Bloom', 'Brook', 'Carter', 'Cove', 'Fox', 'Lane', 'Moon', 'Reed', 'Stone'],
  formal: ['Ashford', 'Beauregard', 'Fairchild', 'Harrington', 'Kingsley', 'Montgomery', 'Sinclair', 'Thistledown', 'Wellington', 'Whitmore'],
  show: ['Brightstar', 'Goldenbrook', 'Moonwhistle', 'Rosehaven', 'Silvercrest', 'Starbloom', 'Sunnymeadow', 'Willowbrook', 'Windancer', 'Wonderglade']
};

export const prefixes = ['Captain', 'Lady', 'Little', 'Miss', 'Mister', 'Professor', 'Sir'];
export const connectors = ['of', 'from'];

export const animalToneMap = {
  Alpaca: ['cute', 'funny', 'rustic'],
  Bird: ['cute', 'classic', 'fancy'],
  Cat: ['cute', 'fancy', 'funny'],
  Chicken: ['funny', 'rustic', 'cute'],
  Chinchilla: ['cute', 'fancy', 'funny'],
  Cow: ['rustic', 'classic', 'cute'],
  Dog: ['classic', 'cute', 'funny'],
  Donkey: ['rustic', 'funny', 'classic'],
  Duck: ['cute', 'funny', 'classic'],
  Ferret: ['funny', 'cute', 'classic'],
  Fish: ['fancy', 'cute', 'classic'],
  Goat: ['funny', 'rustic', 'cute'],
  'Guinea Pig': ['cute', 'funny', 'classic'],
  Hamster: ['cute', 'funny', 'classic'],
  Hedgehog: ['cute', 'funny', 'fancy'],
  Horse: ['formal', 'classic', 'show'],
  Llama: ['funny', 'rustic', 'show'],
  Pig: ['funny', 'cute', 'rustic'],
  Pony: ['show', 'cute', 'classic'],
  Rabbit: ['cute', 'whimsical', 'classic'],
  Raccoon: ['funny', 'quirky', 'cute'],
  Rat: ['quirky', 'cute', 'funny'],
  Sheep: ['cute', 'rustic', 'classic'],
  Snake: ['fancy', 'quirky', 'show'],
  Turtle: ['classic', 'cute', 'fancy']
};

export function normalizeWord(value) {
  return value
    .trim()
    .replace(/\s+/g, ' ')
    .split(' ')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

export async function loadDefaultAnimals() {
  const response = await fetch('./data/animals.json', { cache: 'no-store' });
  if (!response.ok) throw new Error('Unable to load default animal list.');
  const animals = await response.json();
  return animals
    .filter((animal) => animal.enabled)
    .map((animal) => ({ name: normalizeWord(animal.name), source: 'repo' }));
}

export function getOverrides() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { added: [], disabled: [] };
    const parsed = JSON.parse(raw);
    return {
      added: Array.isArray(parsed.added) ? parsed.added.map(normalizeWord) : [],
      disabled: Array.isArray(parsed.disabled) ? parsed.disabled.map(normalizeWord) : []
    };
  } catch {
    return { added: [], disabled: [] };
  }
}

export function saveOverrides(overrides) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
}

export function clearOverrides() {
  localStorage.removeItem(STORAGE_KEY);
}

export async function getMergedAnimals() {
  const repoAnimals = await loadDefaultAnimals();
  const overrides = getOverrides();
  const disabledSet = new Set(overrides.disabled.map(normalizeWord));
  const addedSet = new Set(overrides.added.map(normalizeWord));

  const merged = repoAnimals
    .filter((animal) => !disabledSet.has(animal.name))
    .map((animal) => ({ ...animal, disabled: false }));

  for (const animal of addedSet) {
    if (!merged.some((entry) => entry.name === animal)) {
      merged.push({ name: animal, source: 'local', disabled: false });
    }
  }

  return merged.sort((a, b) => a.name.localeCompare(b.name));
}
