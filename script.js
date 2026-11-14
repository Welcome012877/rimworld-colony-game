const weatherTypes = ["Mild", "Rainy", "Cold", "Stormy", "Clear"];

const initialState = () => ({
  day: 1,
  food: 45,
  wood: 20,
  stone: 18,
  metal: 8,
  morale: 75,
  weather: "Mild",
  threat: 1,
  defense: 0,
  objective: 30,
  log: ["The first settlers arrive at a cold frontier. The colony must survive."],
  colonists: [
    { name: "Lena", hunger: 72, mood: 78, health: 100, role: "Scout" },
    { name: "Milo", hunger: 64, mood: 80, health: 100, role: "Builder" },
    { name: "Juno", hunger: 58, mood: 74, health: 100, role: "Farmer" }
  ]
});

let state = initialState();

const els = {
  dayValue: document.getElementById("dayValue"),
  foodValue: document.getElementById("foodValue"),
  woodValue: document.getElementById("woodValue"),
  stoneValue: document.getElementById("stoneValue"),
  metalValue: document.getElementById("metalValue"),
  moraleValue: document.getElementById("moraleValue"),
  weatherValue: document.getElementById("weatherValue"),
  threatValue: document.getElementById("threatValue"),
  defenseValue: document.getElementById("defenseValue"),
  objectiveValue: document.getElementById("objectiveValue"),
  colonistList: document.getElementById("colonistList"),
  eventLog: document.getElementById("eventLog"),
  nextDayBtn: document.getElementById("nextDayBtn"),
  overlay: document.getElementById("gameOverlay"),
  overlayTitle: document.getElementById("overlayTitle"),
  overlayText: document.getElementById("overlayText"),
  restartBtn: document.getElementById("restartBtn")
};

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function addLog(message) {
  state.log.unshift(message);
  state.log = state.log.slice(0, 10);
}

function updateStats() {
  const averageMood = Math.round(
    state.colonists.reduce((sum, colonist) => sum + colonist.mood, 0) / state.colonists.length
  );

  els.dayValue.textContent = state.day;
  els.foodValue.textContent = state.food;
  els.woodValue.textContent = state.wood;
  els.stoneValue.textContent = state.stone;
  els.metalValue.textContent = state.metal;
  els.moraleValue.textContent = averageMood;
  els.weatherValue.textContent = state.weather;
  els.threatValue.textContent = state.threat === 1 ? "Low" : state.threat === 2 ? "Medium" : "High";
  els.defenseValue.textContent = state.defense;
  els.objectiveValue.textContent = `Survive ${state.objective} days`;
}

function renderColonists() {
  els.colonistList.innerHTML = state.colonists
    .map((colonist) => {
      const hungerBarClass = colonist.hunger < 35 ? "bar low" : colonist.hunger < 60 ? "bar warning" : "bar";
      const moodBarClass = colonist.mood < 35 ? "bar low" : colonist.mood < 60 ? "bar warning" : "bar";
      return `
        <div class="colonist-card">
          <div>
            <div class="colonist-name">${colonist.name}</div>
            <div class="colonist-meta">${colonist.role}</div>
          </div>
          <div class="colonist-bars">
            <div class="bar-row">
              <span>Hunger</span>
              <div class="${hungerBarClass}"><span style="width:${clamp(colonist.hunger, 0, 100)}%"></span></div>
              <span>${colonist.hunger}</span>
            </div>
            <div class="bar-row">
              <span>Mood</span>
              <div class="${moodBarClass}"><span style="width:${clamp(colonist.mood, 0, 100)}%"></span></div>
              <span>${colonist.mood}</span>
            </div>
          </div>
        </div>
      `;
    })
    .join("");
}

function renderLog() {
  els.eventLog.innerHTML = state.log.map((entry) => `<li>${entry}</li>`).join("");
}

function render() {
  updateStats();
  renderColonists();
  renderLog();
}

function applyActions(action) {
  const colonist = state.colonists[randomInt(0, state.colonists.length - 1)];

  switch (action) {
    case "forage": {
      const gain = randomInt(5, 12);
      state.food += gain;
      colonist.hunger = clamp(colonist.hunger + 8, 0, 100);
      colonist.mood = clamp(colonist.mood + 6, 0, 100);
      addLog(`${colonist.name} forages wild roots and berries. +${gain} food.`);
      break;
    }
    case "gatherWood": {
      const gain = randomInt(6, 15);
      state.wood += gain;
      colonist.mood = clamp(colonist.mood + 4, 0, 100);
      addLog(`${colonist.name} chops timber. +${gain} wood.`);
      break;
    }
    case "mineStone": {
      const gain = randomInt(5, 12);
      state.stone += gain;
      colonist.mood = clamp(colonist.mood + 2, 0, 100);
      addLog(`${colonist.name} mines stone from the rocky ground. +${gain} stone.`);
      break;
    }
    case "smeltMetal": {
      if (state.stone < 6) {
        addLog("The colony is short on stone to smelt usable steel.");
        return;
      }
      state.stone -= 6;
      state.metal += randomInt(3, 7);
      addLog(`The smiths refine ore into metal. +${randomInt(3, 7)} steel.`);
      break;
    }
    case "rest": {
      state.colonists.forEach((person) => {
        person.mood = clamp(person.mood + 5, 0, 100);
        person.hunger = clamp(person.hunger - 4, 0, 100);
      });
      addLog("The settlers rest and repair morale under the canopy.");
      break;
    }
    case "buildShelter": {
      if (state.wood < 12 || state.stone < 8) {
        addLog("Not enough materials to reinforce the shelter.");
        return;
      }
      state.wood -= 12;
      state.stone -= 8;
      state.defense += 2;
      state.colonists.forEach((person) => {
        person.mood = clamp(person.mood + 7, 0, 100);
      });
      addLog("A sturdier shelter rises from the ground. Defense +2.");
      break;
    }
    default:
      break;
  }

  state.food = clamp(state.food, 0, 999);
  render();
  checkGameState();
}

function nextDay() {
  state.day += 1;
  state.weather = weatherTypes[randomInt(0, weatherTypes.length - 1)];
  state.threat = randomInt(1, 3);

  state.colonists.forEach((person) => {
    person.hunger = clamp(person.hunger - randomInt(8, 16), 0, 100);
    person.mood = clamp(person.mood - randomInt(2, 7) + (state.weather === "Mild" ? 1 : 0), 0, 100);
  });

  const totalFoodNeeded = state.colonists.length * 5;
  if (state.food >= totalFoodNeeded) {
    state.food -= totalFoodNeeded;
    state.colonists.forEach((person) => {
      person.mood = clamp(person.mood + 3, 0, 100);
    });
    addLog(`The colony eats well and keeps moving. Food used: ${totalFoodNeeded}.`);
  } else {
    const shortage = totalFoodNeeded - state.food;
    state.food = 0;
    state.colonists.forEach((person) => {
      person.mood = clamp(person.mood - 12, 0, 100);
      person.health = clamp(person.health - randomInt(4, 10), 0, 100);
    });
    addLog(`Food shortages hit the colony. ${shortage} food short.`);
  }

  for (const colonist of state.colonists) {
    if (colonist.hunger < 20) {
      colonist.mood = clamp(colonist.mood - 8, 0, 100);
    }
    if (colonist.mood < 25) {
      colonist.health = clamp(colonist.health - 8, 0, 100);
    }
  }

  state.morale = Math.round(
    state.colonists.reduce((sum, colonist) => sum + colonist.mood, 0) / state.colonists.length
  );

  if (state.day >= state.objective) {
    addLog(`The colony survives ${state.day} days and earns a hard-won victory.`);
    showOverlay("Victory", "The colony endured the harsh frontier and built a resilient future.");
  }

  render();
  checkGameState();
}

function checkGameState() {
  const averageMood = state.colonists.reduce((sum, colonist) => sum + colonist.mood, 0) / state.colonists.length;
  const anyDead = state.colonists.some((colonist) => colonist.health <= 0);

  if (averageMood <= 10 || anyDead) {
    showOverlay("Colony Lost", "The settlers could not withstand the harsh world. Try again.");
  }
}

function showOverlay(title, text) {
  els.overlayTitle.textContent = title;
  els.overlayText.textContent = text;
  els.overlay.classList.remove("hidden");
}

function restartGame() {
  state = initialState();
  els.overlay.classList.add("hidden");
  render();
}

document.querySelectorAll(".action-btn").forEach((button) => {
  button.addEventListener("click", () => applyActions(button.dataset.action));
});

els.nextDayBtn.addEventListener("click", nextDay);
els.restartBtn.addEventListener("click", restartGame);

render();
