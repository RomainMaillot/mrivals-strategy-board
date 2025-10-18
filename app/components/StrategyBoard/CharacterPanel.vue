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

    <div class="character-grid">
      <div
        v-for="character in filteredCharacters"
        :key="character.id"
        class="character-card"
        :class="`character-card--${character.role.toLowerCase()}`"
        @click="selectCharacter(character)"
        @dragstart="onDragStart($event, character)"
        draggable="true"
      >
        <div class="character-avatar">
          <img
            v-if="character.avatar"
            :src="character.avatar"
            :alt="character.name"
            class="character-image"
          />
          <div
            v-else
            class="character-placeholder"
            :style="{ backgroundColor: character.color }"
          >
            {{ character.name.charAt(0) }}
          </div>
        </div>

        <div class="character-info">
          <h4 class="character-name">{{ character.name }}</h4>
          <span class="character-role">{{ character.role }}</span>
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
    avatar: "/characters/black-panther.png",
  },
  {
    id: "black-widow",
    name: "Black Widow",
    role: "Duelist",
    color: "#dc2626",
    avatar: "/characters/black-widow.png",
  },
  {
    id: "blade",
    name: "Blade",
    role: "Duelist",
    color: "#dc2626",
    avatar: "/characters/blade.png",
  },
  {
    id: "daredevil",
    name: "Daredevil",
    role: "Duelist",
    color: "#dc2626",
    avatar: "/characters/daredevil.png",
  },
  {
    id: "hawkeye",
    name: "Hawkeye",
    role: "Duelist",
    color: "#dc2626",
    avatar: "/characters/hawkeye.png",
  },
  {
    id: "hela",
    name: "Hela",
    role: "Duelist",
    color: "#dc2626",
    avatar: "/characters/hela.png",
  },
  {
    id: "human-torch",
    name: "Human Torch",
    role: "Duelist",
    color: "#dc2626",
    avatar: "/characters/human-torch.png",
  },
  {
    id: "iron-fist",
    name: "Iron Fist",
    role: "Duelist",
    color: "#dc2626",
    avatar: "/characters/iron-fist.png",
  },
  {
    id: "ironman",
    name: "Ironman",
    role: "Duelist",
    color: "#dc2626",
    avatar: "/characters/ironman.png",
  },
  {
    id: "magik",
    name: "Magik",
    role: "Duelist",
    color: "#dc2626",
    avatar: "/characters/magik.png",
  },
  {
    id: "mister-fantastic",
    name: "Mister Fantastic",
    role: "Duelist",
    color: "#dc2626",
    avatar: "/characters/mister-fantastic.png",
  },
  {
    id: "moon-knight",
    name: "Moon Knight",
    role: "Duelist",
    color: "#dc2626",
    avatar: "/characters/moon-knight.png",
  },
  {
    id: "namor",
    name: "Namor",
    role: "Duelist",
    color: "#dc2626",
    avatar: "/characters/namor.png",
  },
  {
    id: "phoenix",
    name: "Phoenix",
    role: "Duelist",
    color: "#dc2626",
    avatar: "/characters/phoenix.png",
  },
  {
    id: "psylocke",
    name: "Psylocke",
    role: "Duelist",
    color: "#dc2626",
    avatar: "/characters/psylocke.png",
  },
  {
    id: "scarlet-witch",
    name: "Scarlet Witch",
    role: "Duelist",
    color: "#dc2626",
    avatar: "/characters/scarlet-witch.png",
  },
  {
    id: "spiderman",
    name: "Spiderman",
    role: "Duelist",
    color: "#dc2626",
    avatar: "/characters/spiderman.png",
  },
  {
    id: "squirrel-girl",
    name: "Squirrel Girl",
    role: "Duelist",
    color: "#dc2626",
    avatar: "/characters/squirrel-girl.png",
  },
  {
    id: "star-lord",
    name: "Star Lord",
    role: "Duelist",
    color: "#dc2626",
    avatar: "/characters/star-lord.png",
  },
  {
    id: "storm",
    name: "Storm",
    role: "Duelist",
    color: "#dc2626",
    avatar: "/characters/storm.png",
  },
  {
    id: "the-punisher",
    name: "The Punisher",
    role: "Duelist",
    color: "#dc2626",
    avatar: "/characters/the-punisher.png",
  },
  {
    id: "winter-soldier",
    name: "Winter Soldier",
    role: "Duelist",
    color: "#dc2626",
    avatar: "/characters/winter-soldier.png",
  },
  {
    id: "wolverine",
    name: "Wolverine",
    role: "Duelist",
    color: "#dc2626",
    avatar: "/characters/wolverine.png",
  },

  // Vanguards Characters (alphabetically sorted)
  {
    id: "angela",
    name: "Angela",
    role: "Vanguard",
    color: "#2563eb",
    avatar: "/characters/angela.png",
  },
  {
    id: "captain-america",
    name: "Captain America",
    role: "Vanguard",
    color: "#2563eb",
    avatar: "/characters/captain-america.png",
  },
  {
    id: "doctor-strange",
    name: "Doctor Strange",
    role: "Vanguard",
    color: "#2563eb",
    avatar: "/characters/doctor-strange.png",
  },
  {
    id: "emma-frost",
    name: "Emma Frost",
    role: "Vanguard",
    color: "#2563eb",
    avatar: "/characters/emma-frost.png",
  },
  {
    id: "groot",
    name: "Groot",
    role: "Vanguard",
    color: "#2563eb",
    avatar: "/characters/groot.png",
  },
  {
    id: "hulk",
    name: "Hulk",
    role: "Vanguard",
    color: "#2563eb",
    avatar: "/characters/hulk.png",
  },
  {
    id: "magneto",
    name: "Magneto",
    role: "Vanguard",
    color: "#2563eb",
    avatar: "/characters/magneto.png",
  },
  {
    id: "peni-parker",
    name: "Peni Parker",
    role: "Vanguard",
    color: "#2563eb",
    avatar: "/characters/peni-parker.png",
  },
  {
    id: "the-thing",
    name: "The Thing",
    role: "Vanguard",
    color: "#2563eb",
    avatar: "/characters/the-thing.png",
  },
  {
    id: "thor",
    name: "Thor",
    role: "Vanguard",
    color: "#2563eb",
    avatar: "/characters/thor.png",
  },
  {
    id: "venom",
    name: "Venom",
    role: "Vanguard",
    color: "#2563eb",
    avatar: "/characters/venom.png",
  },

  // Strategists Characters (alphabetically sorted)
  {
    id: "adam-warlock",
    name: "Adam Warlock",
    role: "Strategist",
    color: "#16a34a",
    avatar: "/characters/adam-warlock.png",
  },
  {
    id: "cloak-and-dagger",
    name: "Cloak & Dagger",
    role: "Strategist",
    color: "#16a34a",
    avatar: "/characters/cloak-and-dagger.png",
  },
  {
    id: "invisible-woman",
    name: "Invisible Woman",
    role: "Strategist",
    color: "#16a34a",
    avatar: "/characters/invisible-woman.png",
  },
  {
    id: "jeff-the-land-shark",
    name: "Jeff the Land Shark",
    role: "Strategist",
    color: "#16a34a",
    avatar: "/characters/jeff-the-land-shark.png",
  },
  {
    id: "loki",
    name: "Loki",
    role: "Strategist",
    color: "#16a34a",
    avatar: "/characters/loki.png",
  },
  {
    id: "luna-snow",
    name: "Luna Snow",
    role: "Strategist",
    color: "#16a34a",
    avatar: "/characters/luna-snow.png",
  },
  {
    id: "mantis",
    name: "Mantis",
    role: "Strategist",
    color: "#16a34a",
    avatar: "/characters/mantis.png",
  },
  {
    id: "rocket-raccoon",
    name: "Rocket Raccoon",
    role: "Strategist",
    color: "#16a34a",
    avatar: "/characters/rocket-raccoon.png",
  },
  {
    id: "ultron",
    name: "Ultron",
    role: "Strategist",
    color: "#16a34a",
    avatar: "/characters/ultron.png",
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
const filterByRole = (role) => {
  selectedRole.value = role;
};

const selectCharacter = (character) => {
  selectedCharacter.value = character;
  emit("character-selected", character);
};

const onDragStart = (event, character) => {
  event.dataTransfer.setData("application/json", JSON.stringify(character));
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
  overflow-y: auto;
  flex: 1;
  padding-right: rem(4);

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

.character-card {
  display: flex;
  align-items: center;
  gap: rem(12);
  padding: rem(10);
  border: 1px solid var(--gris, #e5e7eb);
  border-radius: rem(8);
  cursor: pointer;
  transition: all 0.2s ease;
  background: var(--blanc, #fff);

  &:hover {
    border-color: var(--indigo, #3b82f6);
    background: var(--blanc, #f8fafc);
    transform: translateY(-1px);
  }

  &--duelist {
    border-left: rem(3) solid #dc2626;
  }

  &--vanguard {
    border-left: rem(3) solid #2563eb;
  }

  &--strategist {
    border-left: rem(3) solid #16a34a;
  }
}

.character-avatar {
  width: rem(40);
  height: rem(40);
  border-radius: rem(6);
  overflow: hidden;
  flex-shrink: 0;
}

.character-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
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
