<template>
  <div class="character-panel">
    <div class="character-panel__header">
      <!-- <h3 class="character-panel__title">Marvel Rivals Characters</h3> -->

      <div class="role-filter">
        <Button
          v-for="role in roles"
          :key="role"
          :type="selectedRole === role ? 'secondary' : 'tertiary'"
          size="small"
          :title="role"
          @click="filterByRole(role)"
        />
      </div>
    </div>

    <div class="character-grid character-grid--columns">
      <div class="character-column">
        <div class="character-column__list">
          <div
            v-for="character in filteredCharacters"
            :key="`ally-` + character.id"
            class="character-card"
            :class="`character-card--${character.role.toLowerCase()}`"
            @click="selectCharacter(character)"
            @dragstart="onDragStart($event, character, 'ally')"
            draggable="true"
          >
            <div class="character-avatar">
              <img
                v-if="getAvatarPath(character, 'ally')"
                :src="getAvatarPath(character, 'ally')"
                :alt="character.name"
                class="character-image character-image--ally"
              />
              <div
                v-else
                class="character-placeholder"
                :style="{ backgroundColor: character.color }"
              >
                {{ character.name.charAt(0) }}
              </div>
            </div>

            <!-- <div class="character-info">
              <h4 class="character-name">{{ character.name }}</h4>
              <span class="character-role">{{ character.role }}</span>
            </div> -->
          </div>
        </div>
      </div>

      <div class="character-column">
        <div class="character-column__list">
          <div
            v-for="character in filteredCharacters"
            :key="`enemy-` + character.id"
            class="character-card"
            :class="`character-card--${character.role.toLowerCase()}`"
            @click="selectCharacter(character)"
            @dragstart="onDragStart($event, character, 'enemy')"
            draggable="true"
          >
            <div class="character-avatar">
              <img
                v-if="getAvatarPath(character, 'enemy')"
                :src="getAvatarPath(character, 'enemy')"
                :alt="character.name"
                class="character-image character-image--enemy"
              />
              <div
                v-else
                class="character-placeholder"
                :style="{ backgroundColor: character.color }"
              >
                {{ character.name.charAt(0) }}
              </div>
            </div>

            <!-- <div class="character-info">
              <h4 class="character-name">{{ character.name }}</h4>
              <span class="character-role">{{ character.role }}</span>
            </div> -->
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * Props
 */
const props = defineProps({
  canvas: {
    type: Object,
    default: null,
  },
});

/**
 * Emits
 */
const emit = defineEmits(["character-selected", "character-dropped"]);

/**
 * Marvel Rivals Characters Data
 */
const marvelRivalsCharacters = [
  // Duelists Characters (alphabetically sorted)
  {
    id: "black-panther",
    name: "Black Panther",
    role: "Duelist",
    color: "#dc2626",
  },
  {
    id: "black-widow",
    name: "Black Widow",
    role: "Duelist",
    color: "#dc2626",
  },
  {
    id: "blade",
    name: "Blade",
    role: "Duelist",
    color: "#dc2626",
  },
  {
    id: "daredevil",
    name: "Daredevil",
    role: "Duelist",
    color: "#dc2626",
  },
  {
    id: "hawkeye",
    name: "Hawkeye",
    role: "Duelist",
    color: "#dc2626",
  },
  {
    id: "hela",
    name: "Hela",
    role: "Duelist",
    color: "#dc2626",
  },
  {
    id: "human-torch",
    name: "Human Torch",
    role: "Duelist",
    color: "#dc2626",
  },
  {
    id: "iron-fist",
    name: "Iron Fist",
    role: "Duelist",
    color: "#dc2626",
  },
  {
    id: "ironman",
    name: "Ironman",
    role: "Duelist",
    color: "#dc2626",
  },
  {
    id: "magik",
    name: "Magik",
    role: "Duelist",
    color: "#dc2626",
  },
  {
    id: "mister-fantastic",
    name: "Mister Fantastic",
    role: "Duelist",
    color: "#dc2626",
  },
  {
    id: "moon-knight",
    name: "Moon Knight",
    role: "Duelist",
    color: "#dc2626",
  },
  {
    id: "namor",
    name: "Namor",
    role: "Duelist",
    color: "#dc2626",
  },
  {
    id: "phoenix",
    name: "Phoenix",
    role: "Duelist",
    color: "#dc2626",
  },
  {
    id: "psylocke",
    name: "Psylocke",
    role: "Duelist",
    color: "#dc2626",
  },
  {
    id: "scarlet-witch",
    name: "Scarlet Witch",
    role: "Duelist",
    color: "#dc2626",
  },
  {
    id: "spiderman",
    name: "Spiderman",
    role: "Duelist",
    color: "#dc2626",
  },
  {
    id: "squirrel-girl",
    name: "Squirrel Girl",
    role: "Duelist",
    color: "#dc2626",
  },
  {
    id: "star-lord",
    name: "Star Lord",
    role: "Duelist",
    color: "#dc2626",
  },
  {
    id: "storm",
    name: "Storm",
    role: "Duelist",
    color: "#dc2626",
  },
  {
    id: "the-punisher",
    name: "The Punisher",
    role: "Duelist",
    color: "#dc2626",
  },
  {
    id: "winter-soldier",
    name: "Winter Soldier",
    role: "Duelist",
    color: "#dc2626",
  },
  {
    id: "wolverine",
    name: "Wolverine",
    role: "Duelist",
    color: "#dc2626",
  },

  // Vanguards Characters (alphabetically sorted)
  {
    id: "angela",
    name: "Angela",
    role: "Vanguard",
    color: "#2563eb",
  },
  {
    id: "captain-america",
    name: "Captain America",
    role: "Vanguard",
    color: "#2563eb",
  },
  {
    id: "doctor-strange",
    name: "Doctor Strange",
    role: "Vanguard",
    color: "#2563eb",
  },
  {
    id: "emma-frost",
    name: "Emma Frost",
    role: "Vanguard",
    color: "#2563eb",
  },
  {
    id: "groot",
    name: "Groot",
    role: "Vanguard",
    color: "#2563eb",
  },
  {
    id: "hulk",
    name: "Hulk",
    role: "Vanguard",
    color: "#2563eb",
  },
  {
    id: "magneto",
    name: "Magneto",
    role: "Vanguard",
    color: "#2563eb",
  },
  {
    id: "peni-parker",
    name: "Peni Parker",
    role: "Vanguard",
    color: "#2563eb",
  },
  {
    id: "the-thing",
    name: "The Thing",
    role: "Vanguard",
    color: "#2563eb",
  },
  {
    id: "thor",
    name: "Thor",
    role: "Vanguard",
    color: "#2563eb",
  },
  {
    id: "venom",
    name: "Venom",
    role: "Vanguard",
    color: "#2563eb",
  },
  {
    id: "rogue",
    name: "Rogue",
    role: "Vanguard",
    color: "#2563eb",
  },

  // Strategists Characters (alphabetically sorted)
  {
    id: "adam-warlock",
    name: "Adam Warlock",
    role: "Strategist",
    color: "#16a34a",
  },
  {
    id: "cloak-and-dagger",
    name: "Cloak & Dagger",
    role: "Strategist",
    color: "#16a34a",
  },
  {
    id: "invisible-woman",
    name: "Invisible Woman",
    role: "Strategist",
    color: "#16a34a",
  },
  {
    id: "jeff-the-land-shark",
    name: "Jeff the Land Shark",
    role: "Strategist",
    color: "#16a34a",
  },
  {
    id: "loki",
    name: "Loki",
    role: "Strategist",
    color: "#16a34a",
  },
  {
    id: "luna-snow",
    name: "Luna Snow",
    role: "Strategist",
    color: "#16a34a",
  },
  {
    id: "mantis",
    name: "Mantis",
    role: "Strategist",
    color: "#16a34a",
  },
  {
    id: "rocket-raccoon",
    name: "Rocket Raccoon",
    role: "Strategist",
    color: "#16a34a",
  },
  {
    id: "ultron",
    name: "Ultron",
    role: "Strategist",
    color: "#16a34a",
  },
  {
    id: "gambit",
    name: "Gambit",
    role: "Strategist",
    color: "#16a34a",
  },
];

/**
 * Reactive data
 */
const selectedRole = ref("All");
const roles = ["All", "Duelist", "Vanguard", "Strategist"];
const selectedCharacter = ref(null);

/**
 * Computed
 */
const filteredCharacters = computed(() => {
  if (selectedRole.value === "All") {
    return marvelRivalsCharacters;
  }
  return marvelRivalsCharacters.filter(
    (char) => char.role === selectedRole.value
  );
});

/**
 * Methods
 */
/**
 * Get the avatar path for a character based on team
 * @param {Object} character - The character object
 * @param {string} team - The team type ('ally' or 'enemy')
 * @returns {string|null} The avatar path or null if not available
 */
const getAvatarPath = (character, team) => {
  if (!character || !character.id) {
    return null;
  }

  const teamFolder = team === "ally" ? "allies" : "ennemies";
  return `/characters/${teamFolder}/${character.id}.png`;
};

const filterByRole = (role) => {
  selectedRole.value = role;
};

const selectCharacter = (character) => {
  selectedCharacter.value = character;
  emit("character-selected", character);
};

const onDragStart = (event, character, team) => {
  /**
   * Include team metadata in drag payload so the canvas can color strokes
   * Also update the avatar path to use the correct team-specific image
   */
  const avatarPath = getAvatarPath(character, team);
  const payload = {
    ...character,
    team,
    avatar: avatarPath,
  };
  try {
    event.dataTransfer.setData("application/json", JSON.stringify(payload));
  } catch (e) {
    // Fallback to text if JSON is blocked by the UA
    event.dataTransfer.setData("text/plain", JSON.stringify(payload));
  }
  event.dataTransfer.effectAllowed = "copy";
};

/**
 * Expose character data for parent components
 */
defineExpose({
  marvelRivalsCharacters,
  selectedCharacter,
});
</script>

<style lang="scss" scoped>
.character-panel {
  display: flex;
  flex-direction: column;
  gap: rem(16);
  padding: rem(20);
  background: var(--blanc, #fff);
  border: 1px solid var(--gris, #e5e7eb);
  border-radius: 0 0 rem(12) rem(12);
  width: rem(320);
  height: rem(600);
  overflow: hidden;

  &__header {
    display: flex;
    flex-direction: column;
    gap: rem(12);
  }

  &__title {
    font-size: rem(16);
    font-weight: 600;
    color: var(--noir, #1f2937);
    margin: 0;
  }
}

.role-filter {
  display: flex;
  gap: rem(6);
  flex-wrap: wrap;
}

.character-grid {
  display: flex;
  flex-direction: column;
  gap: rem(8);
  overflow: hidden;
  flex: 1;

  &--columns {
    flex-direction: row;
    gap: rem(12);
  }

  &::-webkit-scrollbar {
    width: rem(6);
  }

  &::-webkit-scrollbar-track {
    background: var(--gris, #f3f4f6);
    border-radius: rem(3);
  }

  &::-webkit-scrollbar-thumb {
    background: var(--gris, #d1d5db);
    border-radius: rem(3);

    &:hover {
      background: var(--gris, #9ca3af);
    }
  }
}

.character-column {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;

  &__header {
    font-weight: 700;
    font-size: rem(14);
    color: var(--noir, #1f2937);
    padding: rem(6) rem(8);
    border: 1px solid var(--gris, #e5e7eb);
    border-bottom: none;
    border-radius: rem(8) rem(8) 0 0;
    background: var(--blanc, #fff);
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: rem(8);
    padding-right: rem(4);
    overflow-y: auto;
    flex: 1;
    /* border: 1px solid var(--gris, #e5e7eb); */
    border-radius: 0 0 rem(8) rem(8);
    background: var(--blanc, #fff);
  }
}

.character-card {
  display: flex;
  align-items: center;
  gap: rem(12);
  padding: rem(10);
  /* border: 1px solid var(--gris, #e5e7eb);
  border-radius: rem(8); */
  cursor: pointer;
  transition: all 0.2s ease;
  /* background: var(--blanc, #fff); */

  &:hover {
    /* border-color: var(--indigo, #3b82f6);
    background: var(--blanc, #f8fafc); */
    transform: translateY(-1px);
  }
  /* 
  &--duelist {
    border-left: rem(3) solid #dc2626;
  }

  &--vanguard {
    border-left: rem(3) solid #2563eb;
  }

  &--strategist {
    border-left: rem(3) solid #16a34a;
  } */
}

.character-avatar {
  width: 100%;
  height: auto;
  border-radius: rem(6);
  overflow: hidden;
  flex-shrink: 0;
}

.character-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border: 3px solid;
  border-radius: 50%;

  &--enemy {
    border-color: #991b1b;
  }

  &--ally {
    border-color: #1e40af;
  }
}

.character-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: rem(16);
}

.character-info {
  display: flex;
  flex-direction: column;
  gap: rem(2);
  flex: 1;
}

.character-name {
  font-size: rem(14);
  font-weight: 600;
  color: var(--noir, #1f2937);
  margin: 0;
}

.character-role {
  font-size: rem(12);
  color: var(--gris, #6b7280);
  text-transform: uppercase;
  font-weight: 500;
}
</style>
