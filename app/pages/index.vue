<template>
  <div class="home">
    <h1>MRivals Strategy Board</h1>
    <p>Welcome to your project!</p>

    <nav class="navigation">
      <NuxtLink to="/styleguide" class="nav-link"> View Styleguide </NuxtLink>
    </nav>
  </div>
</template>

<script setup>
// You can add any page-specific logic here
</script>

<style lang="scss" scoped>
.home {
  padding: 2rem;
  text-align: center;

  h1 {
    font-size: 2.5rem;
    margin-bottom: 1rem;
    color: var(--noir, #000);
  }

  p {
    font-size: 1.2rem;
    margin-bottom: 2rem;
    color: var(--gris, #666);
  }
}

.navigation {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.nav-link {
  display: inline-block;
  padding: 1rem 2rem;
  background-color: var(--indigo, #4f46e5);
  color: white;
  text-decoration: none;
  border-radius: 0.5rem;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: var(--bourgogne, #7c2d12);
  }
}
</style>
