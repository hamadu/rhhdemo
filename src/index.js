import Two from 'two.js'

const EMPTY = 1000000000;

function init() {
  const canvas = document.getElementById('canvas');
  const two = new Two({ width: 320, height: 320 }).appendTo(canvas);

  const circle = two.makeCircle(72, 100, 50);
  circle.fill = '#FF8000';
  circle.stroke = 'orangered'; // Accepts all valid css color
  circle.linewidth = 5;

  const rect = two.makeRectangle(213, 100, 100, 100);
  rect.fill = 'rgb(0, 200, 255)';
  rect.opacity = 0.75;
  rect.noStroke();

  two.update();
}

function random(max) {
  return Math.floor(Math.random() * max);
}

function generateTable(hashSize, maxNumber) {
  return {
    hashSize: hashSize,
    maxNumber: maxNumber,
    table: Array(hashSize).fill(EMPTY),
    stat: {
      filled: 0,
      scanSize: 0,
      minDIB: 0,
      maxDIB: 0
    }
  }
}

function generateOperation(table) {
  const percent = table.stat.filled * 100 / table.hashSize;
  if (percent >= 90) {
    const idx = random(table.hashSize);
    if (table.table[idx] != EMPTY && table.table[idx] >= 0) {
      return ['remove', table.table[idx]];
    }
  }
  return ['add', random(table.maxNumber)];
}

function findValue(table, value) {
  const hash = value % table.hashSize;
  const minDIB = table.stat.minDIB;
  const maxDIB = table.stat.maxDIB;
  const from = (hash + minDIB) % table.hashSize;
  const to = (hash + maxDIB + 10) % table.hashSize;

  for (let idx = from ; idx != to ; idx = (idx + 1) % table.hashSize) {
    if (table.table[idx] == EMPTY) {
      return -1;
    } else if (table.table[idx] == value) {
      return idx;
    }
  }
  return -1;
}

function addValue(table, value) {
  if (findValue(table, value) != -1) {
    return;
  }

  let idx = value % table.hashSize;
  const firstIdx = idx;
  let currentValue = value;
  let distanceFromIdx = 0;
  while (true) {
    if (table.table[idx] == EMPTY || table.table[idx] < 0) {
      table.table[idx] = currentValue;
      break;
    } else {
      const value = table.table[idx] < 0 ? -table.table[idx]-1 : table.table[idx];
      const dib = (idx + table.hashSize - value % table.hashSize) % table.hashSize;
      if (dib < distanceFromIdx) {
        if (table.table[idx] < 0) {
          // is tombstone
          console.log('removed tomb');
          table.table[idx] = currentValue;
          break;
        } else {
          const tmp = table.table[idx];
          table.table[idx] = currentValue;
          currentValue = tmp;
          distanceFromIdx = dib;
        }
      }
    }
    idx = (idx + 1) % table.hashSize;
    distanceFromIdx++;

    if (idx == firstIdx) {
      console.log('not found')
      break;
    }
  }
}

function removeValue(table, value) {
  const idx = findValue(table, value);
  if (idx != -1) {
    table.table[idx] = -(value+1); // tombstone
  }
}

function updateStats(table) {
  let filled = 0;
  let tombstone = 0;
  let scanSize = 0;
  let minDIB = table.hashSize;
  let maxDIB = 0;

  for (let i = 0 ; i < table.hashSize ; i++) {
    if (table.table[i] != EMPTY) {
      filled++;
      let val = table.table[i];
      if (val < 0) {
        tombstone++;
        val = -val-1;
      }
      const dib = (i + table.hashSize - val % table.hashSize) % table.hashSize;
      minDIB = Math.min(minDIB, dib);
      maxDIB = Math.max(maxDIB, dib);
    }
  }
  table.stat = {
    filled: filled,
    tombstone: tombstone,
    scanSize: 0,
    minDIB: minDIB,
    maxDIB: maxDIB
  };

  console.log({
    filled: filled,
    tombstone: tombstone,
    scanSize: 0,
    minDIB: minDIB,
    maxDIB: maxDIB
  });
}

function doit() {
  const hashSize = 100;
  const maxNumber = 1000;
  const maxTurn = 10000;
  const operations = [];
  const statsByTurn = [];

  const table = generateTable(hashSize, maxNumber);
  const available = 0;
  for (let turn = 0 ; turn < maxTurn ; turn++) {
    const op = generateOperation(table);
    console.log(op);
    if (op[0] === 'add') {
      addValue(table, op[1]);
    } else if (op[0] === 'remove') {
      removeValue(table, op[1]);
    }
    updateStats(table);
  }
}

window.onload = () => {
  init();
  document.getElementById('start').addEventListener('click', doit);
}
