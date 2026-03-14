import {
  clearOverrides,
  getMergedAnimals,
  getOverrides,
  normalizeWord,
  saveOverrides
} from './data.js';

const newAnimalInput = document.getElementById('newAnimalInput');
const addAnimalBtn = document.getElementById('addAnimalBtn');
const resetAnimalsBtn = document.getElementById('resetAnimalsBtn');
const animalAdminList = document.getElementById('animalAdminList');
const adminStatus = document.getElementById('adminStatus');

function setStatus(message) {
  adminStatus.textContent = message;
}

async function renderAnimals() {
  const animals = await getMergedAnimals();
  const overrides = getOverrides();
  const disabledSet = new Set(overrides.disabled.map(normalizeWord));
  const addedSet = new Set(overrides.added.map(normalizeWord));

  animalAdminList.innerHTML = '';

  for (const animal of animals) {
    const row = document.createElement('div');
    row.className = 'animal-row';

    const info = document.createElement('div');
    const meta = animal.source === 'repo' ? 'Repo default' : 'Added on this device';
    info.innerHTML = `<strong>${animal.name}</strong><div class="animal-meta">${meta}</div>`;

    const hideBtn = document.createElement('button');
    hideBtn.className = 'secondary small';
    hideBtn.textContent = animal.source === 'repo' ? 'Hide on Device' : 'Remove';

    hideBtn.addEventListener('click', () => {
      const current = getOverrides();
      const name = normalizeWord(animal.name);

      if (animal.source === 'repo') {
        if (!current.disabled.includes(name)) current.disabled.push(name);
      } else {
        current.added = current.added.filter((item) => normalizeWord(item) !== name);
      }

      saveOverrides({
        added: [...new Set(current.added.map(normalizeWord))],
        disabled: [...new Set(current.disabled.map(normalizeWord))]
      });

      setStatus(`${name} updated for this device.`);
      renderAnimals();
    });

    const showBtn = document.createElement('button');
    showBtn.className = 'primary small';
    showBtn.textContent = 'Show Hidden';
    showBtn.disabled = !disabledSet.size;

    showBtn.addEventListener('click', () => {
      const current = getOverrides();
      current.disabled = current.disabled.filter((item) => normalizeWord(item) !== normalizeWord(animal.name));
      saveOverrides({
        added: [...new Set(current.added.map(normalizeWord))],
        disabled: [...new Set(current.disabled.map(normalizeWord))]
      });
      setStatus(`${animal.name} restored on this device.`);
      renderAnimals();
    });

    if (animal.source === 'local') {
      showBtn.disabled = true;
      showBtn.textContent = 'Local Animal';
    } else if (!disabledSet.has(normalizeWord(animal.name))) {
      showBtn.disabled = true;
      showBtn.textContent = 'Visible';
    }

    row.append(info, hideBtn, showBtn);
    animalAdminList.appendChild(row);
  }

  if (disabledSet.size) {
    for (const hidden of [...disabledSet].sort((a, b) => a.localeCompare(b))) {
      if (animals.some((a) => a.name === hidden)) continue;

      const row = document.createElement('div');
      row.className = 'animal-row';
      row.innerHTML = `
        <div>
          <strong>${hidden}</strong>
          <div class="animal-meta">Hidden repo animal on this device</div>
        </div>
      `;

      const spacer = document.createElement('div');
      const restoreBtn = document.createElement('button');
      restoreBtn.className = 'primary small';
      restoreBtn.textContent = 'Restore';
      restoreBtn.addEventListener('click', () => {
        const current = getOverrides();
        current.disabled = current.disabled.filter((item) => normalizeWord(item) !== hidden);
        saveOverrides({
          added: [...new Set(current.added.map(normalizeWord))],
          disabled: [...new Set(current.disabled.map(normalizeWord))]
        });
        setStatus(`${hidden} restored on this device.`);
        renderAnimals();
      });

      row.append(spacer, restoreBtn);
      animalAdminList.appendChild(row);
    }
  }

  if (!animalAdminList.children.length) {
    animalAdminList.innerHTML = '<p>No animals found.</p>';
  }
}

addAnimalBtn.addEventListener('click', () => {
  const value = normalizeWord(newAnimalInput.value || '');
  if (!value) {
    setStatus('Enter an animal name first.');
    return;
  }

  const current = getOverrides();
  if (!current.added.includes(value)) current.added.push(value);
  current.disabled = current.disabled.filter((item) => normalizeWord(item) !== value);

  saveOverrides({
    added: [...new Set(current.added.map(normalizeWord))],
    disabled: [...new Set(current.disabled.map(normalizeWord))]
  });

  newAnimalInput.value = '';
  setStatus(`${value} added on this device.`);
  renderAnimals();
});

resetAnimalsBtn.addEventListener('click', () => {
  clearOverrides();
  setStatus('Device animal list reset to repo defaults.');
  renderAnimals();
});

renderAnimals().catch((error) => {
  setStatus(error.message);
});
