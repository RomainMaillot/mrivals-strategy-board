<template>
  <div class="home">
    <div class="hero">
      <h1 class="hero__title">Marvel Rivals Strategy Board</h1>
      <p class="hero__description">
        Create, share, and analyze strategies for Marvel Rivals.
      </p>

      <nav class="navigation">
        <NuxtLink to="/strategy" class="nav-link nav-link--primary">
          Launch Strategy Board
        </NuxtLink>
        <!-- <NuxtLink to="/styleguide" class="nav-link nav-link--secondary">
          View Styleguide
        </NuxtLink> -->
      </nav>
    </div>

    <div class="features">
      <div class="feature">
        <h3 class="feature__title">Interactive Canvas</h3>
        <p class="feature__description">
          Draw strategies, add character positions, and create tactical plans.
        </p>
      </div>

      <div class="feature">
        <h3 class="feature__title">All Marvel Rivals Heroes</h3>
        <p class="feature__description">Complete your roster.</p>
      </div>

      <div class="feature">
        <h3 class="feature__title">Save & Share</h3>
        <p class="feature__description">
          Save your strategies locally and export them as images to share with
          your team.
        </p>
      </div>
    </div>

    <!-- Version Display -->
    <div class="version">
      <span class="version__text">v{{ version }}</span>
    </div>
  </div>
</template>

<script setup>
// Get version from package.json
const packageJson = await import("../../package.json");
const version = packageJson.version;
</script>

<style lang="scss" scoped>
@use "~/assets/scss/utils/tools" as *;

.home {
  min-height: 100vh;
  background: linear-gradient(
    135deg,
    var(--blanc, #f8fafc) 0%,
    var(--gris, #e2e8f0) 100%
  );
  position: relative;
}

.hero {
  padding: rem(80) rem(24);
  text-align: center;
  max-width: rem(800);
  margin: 0 auto;

  &__title {
    font-size: rem(48);
    font-weight: 800;
    margin-bottom: rem(24);
    color: var(--noir, #1f2937);
    line-height: 1.2;
  }

  &__description {
    font-size: rem(20);
    margin-bottom: rem(40);
    color: var(--gris, #6b7280);
    line-height: 1.6;
  }
}

.navigation {
  display: flex;
  justify-content: center;
  gap: rem(16);
  flex-wrap: wrap;
}

.nav-link {
  display: inline-block;
  padding: rem(16) rem(32);
  text-decoration: none;
  border-radius: rem(12);
  font-weight: 600;
  font-size: rem(16);
  transition: all 0.3s ease;
  border: 2px solid transparent;

  &--primary {
    background-color: var(--indigo, #3b82f6);
    color: white;

    &:hover {
      background-color: var(--indigo, #2563eb);
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3);
    }
  }

  &--secondary {
    background-color: transparent;
    color: var(--indigo, #3b82f6);
    border-color: var(--indigo, #3b82f6);

    &:hover {
      background-color: var(--indigo, #3b82f6);
      color: white;
      transform: translateY(-2px);
    }
  }
}

.features {
  padding: rem(80) rem(24) rem(40);
  max-width: rem(1200);
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(rem(300), 1fr));
  gap: rem(40);
}

.feature {
  text-align: center;
  padding: rem(32);
  background: var(--blanc, #fff);
  border-radius: rem(16);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 25px rgba(0, 0, 0, 0.1);
  }

  &__title {
    font-size: rem(24);
    font-weight: 700;
    margin-bottom: rem(16);
    color: var(--noir, #1f2937);
  }

  &__description {
    font-size: rem(16);
    color: var(--gris, #6b7280);
    line-height: 1.6;
  }
}

.version {
  position: fixed;
  bottom: rem(20);
  left: rem(20);
  z-index: 10;

  &__text {
    font-size: rem(12);
    color: var(--gris, #9ca3af);
    font-weight: 500;
    background: rgba(255, 255, 255, 0.8);
    padding: rem(4) rem(8);
    border-radius: rem(4);
    backdrop-filter: blur(4px);
    border: 1px solid rgba(255, 255, 255, 0.2);
  }
}
</style>
