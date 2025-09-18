<template>
  <div class="character-panel">
    <div class="character-panel__header">
      <h3 class="character-panel__title">Marvel Rivals Characters</h3>

      <div class="role-filter">
        <Button
          v-for="role in roles"
          :key="role"
          :type="selectedRole === role ? 'secondary' : 'tertiary'"
          size="small"
          @click="filterByRole(role)"
        >
          {{ role }}
        </Button>
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
  // DPS Characters
  {
    id: "spider-man",
    name: "Spider-Man",
    role: "DPS",
    color: "#dc2626",
    avatar: null,
  },
  {
    id: "iron-man",
    name: "Iron Man",
    role: "DPS",
    color: "#dc2626",
    avatar: null,
  },
  { id: "storm", name: "Storm", role: "DPS", color: "#dc2626", avatar: null },
  {
    id: "scarlet-witch",
    name: "Scarlet Witch",
    role: "DPS",
    color: "#dc2626",
    avatar: null,
  },
  {
    id: "winter-soldier",
    name: "Winter Soldier",
    role: "DPS",
    color: "#dc2626",
    avatar: null,
  },
  {
    id: "black-widow",
    name: "Black Widow",
    role: "DPS",
    color: "#dc2626",
    avatar: null,
  },
  {
    id: "hawkeye",
    name: "Hawkeye",
    role: "DPS",
    color: "#dc2626",
    avatar: null,
  },
  {
    id: "moon-knight",
    name: "Moon Knight",
    role: "DPS",
    color: "#dc2626",
    avatar: null,
  },
  { id: "namor", name: "Namor", role: "DPS", color: "#dc2626", avatar: null },
  {
    id: "psylocke",
    name: "Psylocke",
    role: "DPS",
    color: "#dc2626",
    avatar: null,
  },
  { id: "magik", name: "Magik", role: "DPS", color: "#dc2626", avatar: null },
  {
    id: "wolverine",
    name: "Wolverine",
    role: "DPS",
    color: "#dc2626",
    avatar: null,
  },

  // Tank Characters
  { id: "hulk", name: "Hulk", role: "Tank", color: "#2563eb", avatar: null },
  {
    id: "captain-america",
    name: "Captain America",
    role: "Tank",
    color: "#2563eb",
    avatar: null,
  },
  { id: "thor", name: "Thor", role: "Tank", color: "#2563eb", avatar: null },
  { id: "groot", name: "Groot", role: "Tank", color: "#2563eb", avatar: null },
  {
    id: "magneto",
    name: "Magneto",
    role: "Tank",
    color: "#2563eb",
    avatar: null,
  },
  {
    id: "peni-parker",
    name: "Peni Parker",
    role: "Tank",
    color: "#2563eb",
    avatar: null,
  },
  {
    id: "doctor-strange",
    name: "Doctor Strange",
    role: "Tank",
    color: "#2563eb",
    avatar: null,
  },

  // Support Characters
  {
    id: "mantis",
    name: "Mantis",
    role: "Support",
    color: "#16a34a",
    avatar: null,
  },
  {
    id: "luna-snow",
    name: "Luna Snow",
    role: "Support",
    color: "#16a34a",
    avatar: null,
  },
  {
    id: "adam-warlock",
    name: "Adam Warlock",
    role: "Support",
    color: "#16a34a",
    avatar: null,
  },
  { id: "loki", name: "Loki", role: "Support", color: "#16a34a", avatar: null },
  {
    id: "jeff",
    name: "Jeff the Land Shark",
    role: "Support",
    color: "#16a34a",
    avatar: null,
  },
  {
    id: "rocket-raccoon",
    name: "Rocket Raccoon",
    role: "Support",
    color: "#16a34a",
    avatar: null,
  },
];

/**
 * Reactive data
 */
const selectedRole = ref("All");
const roles = ["All", "DPS", "Tank", "Support"];
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

  &--dps {
    border-left: rem(3) solid #dc2626;
  }

  &--tank {
    border-left: rem(3) solid #2563eb;
  }

  &--support {
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
