<template>
  <div class="strategy-page">
    <ClientOnly>
      <StrategyBoard />
      <template #fallback>
        <div class="loading-container">
          <h1>Loading...</h1>
          <p>Please wait while we initialize the canvas.</p>
        </div>
      </template>
    </ClientOnly>
  </div>
</template>

<script setup>
import StrategyBoard from "~/components/StrategyBoard/StrategyBoard.vue";

/**
 * Page meta
 */
useHead({
  title: "Marvel Rivals Strategy Board",
  meta: [
    {
      name: "description",
      content:
        "Create and share strategies for Marvel Rivals with our interactive strategy board.",
    },
  ],
});
</script>

<style lang="scss" scoped>
.strategy-page {
  height: 100vh;
  overflow: hidden;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  text-align: center;
  background: var(--gris, #f3f4f6);

  h1 {
    font-size: rem(32);
    font-weight: 700;
    color: var(--noir, #1f2937);
    margin-bottom: rem(16);
  }

  p {
    font-size: rem(16);
    color: var(--gris, #6b7280);
  }
}
</style>
