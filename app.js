import {
  animalToneMap,
  connectors,
  getMergedAnimals,
  lastWords,
  middleWords,
  names,
  normalizeWord,
  prefixes
} from './data.js';

const animalSelect = document.getElementById('animalSelect');
const sexSelect = document.getElementById('sexSelect');
const lengthSelect = document.getElementById('lengthSelect');
const styleSelect = document.getElementById('styleSelect');
const preferredFirst = document.getElementById('preferredFirst');
const preferredMiddle = document.getElementById('preferredMiddle');
const preferredLast = document.getElementById('preferredLast');
const generateBtn = document.getElementById('generateBtn');
const tryAgainBtn = document.getElementById('tryAgainBtn');
const copyBtn = document.getElementById('copyBtn');
const resultDisplay = document.getElementById('resultDisplay');
const resultBox = document.getElementById('resultBox');
const copyStatus = document.getElementById('copyStatus');

let lastGenerated = '';

function randomItem(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function uniquePush(parts, value) {
  if (!value) return;
  if (!parts.includes(value)) parts.push(value);
}

function getToneBucket(animal, style) {
  const tones = animalToneMap[animal] || ['cute', 'classic', 'funny'];
  switch (style) {
    case 'nickname':
      return randomItem(['cute', 'funny', ...tones]);
    case 'short':
      return randomItem(['classic', 'cute', ...tones]);
    case 'formal':
      return randomItem(['fancy', 'classic', 'rustic', ...tones]);
    case 'show':
      return randomItem(['fancy', 'classic', 'funny', ...tones]);
    default:
      return randomItem(['classic', 'cute', 'fancy', ...tones]);
  }
}

function pickFirstName(sex) {
  if (sex === 'male') return randomItem([...names.male, ...names.neutral]);
  if (sex === 'female') return randomItem([...names.female, ...names.neutral]);
  return randomItem([...names.male, ...names.female, ...names.neutral]);
}

function pickMiddleWord(tone) {
  if (tone === 'formal' || tone === 'show') return randomItem(middleWords.fancy);
  if (tone === 'whimsical' || tone === 'quirky') return randomItem([...middleWords.funny, ...middleWords.cute]);
  return randomItem(middleWords[tone] || middleWords.classic);
}

function pickLastWord(style, tone) {
  if (style === 'show') return randomItem(lastWords.show);
  if (style === 'formal') return randomItem(lastWords.formal);
  if (tone === 'fancy') return randomItem([...lastWords.formal, ...lastWords.show]);
  return randomItem(lastWords.common);
}

function buildName() {
  const animal = animalSelect.value;
  const sex = sexSelect.value;
  const length = Number(lengthSelect.value);
  const style = styleSelect.value;

  const prefFirst = normalizeWord(preferredFirst.value || '');
  const prefMiddle = normalizeWord(preferredMiddle.value || '');
  const prefLast = normalizeWord(preferredLast.value || '');

  const tone = getToneBucket(animal, style);
  const parts = [];

  if (style === 'nickname') {
    if (length === 1) {
      uniquePush(parts, prefFirst || prefMiddle || prefLast || pickFirstName(sex));
    } else {
      uniquePush(parts, prefFirst || pickFirstName(sex));
      while (parts.length < length) {
        uniquePush(parts, pickMiddleWord(tone));
      }
    }
    return parts.slice(0, length).join(' ');
  }

  if (style === 'show' && length >= 4) {
    uniquePush(parts, randomItem(prefixes));
  }

  uniquePush(parts, prefFirst || pickFirstName(sex));

  if (length >= 3) {
    uniquePush(parts, prefMiddle || pickMiddleWord(tone));
  }

  if (length >= 2) {
    uniquePush(parts, prefLast || pickLastWord(style, tone));
  }

  while (parts.length < length) {
    if (style === 'show' && parts.length === length - 2 && length >= 4) {
      uniquePush(parts, randomItem(connectors));
      uniquePush(parts, pickLastWord('show', tone));
    } else {
      uniquePush(parts, pickMiddleWord(tone));
    }
  }

  return parts.slice(0, length).join(' ');
}

async function populateAnimals() {
  const animals = await getMergedAnimals();
  animalSelect.innerHTML = '';
  for (const animal of animals) {
    const option = document.createElement('option');
    option.value = animal.name;
    option.textContent = animal.name;
    animalSelect.appendChild(option);
  }
  animalSelect.value = animals.some((a) => a.name === 'Dog') ? 'Dog' : animals[0]?.name || '';
}

function showGenerated(name) {
  lastGenerated = name;
  resultDisplay.textContent = name;
  resultBox.value = name;
  copyStatus.textContent = '';
}

generateBtn.addEventListener('click', () => showGenerated(buildName()));
tryAgainBtn.addEventListener('click', () => showGenerated(buildName()));

copyBtn.addEventListener('click', async () => {
  if (!lastGenerated) return;
  resultBox.select();
  resultBox.setSelectionRange(0, resultBox.value.length);

  try {
    await navigator.clipboard.writeText(lastGenerated);
    copyStatus.textContent = 'Name copied.';
  } catch {
    document.execCommand('copy');
    copyStatus.textContent = 'Name copied.';
  }
});

populateAnimals().catch((error) => {
  resultDisplay.textContent = 'Unable to load animals.';
  copyStatus.textContent = error.message;
});
