<template>
  <div class="styleguide">
    <div class="section section--typography">
      <h2 class="section__title">Typography</h2>
      <div v-for="text in texts" :key="text">
        <CText tag="p" :type="text">{{ capitalizeFirstLetter(text) }}</CText>
        <CText tag="p" :type="text" uppercase>{{
          capitalizeFirstLetter(text)
        }}</CText>
        <CText tag="p" :type="text" bold>{{
          capitalizeFirstLetter(text)
        }}</CText>
        <CText tag="p" :type="text" italic>{{
          capitalizeFirstLetter(text)
        }}</CText>
        <CText tag="p" :type="text" serif>{{
          capitalizeFirstLetter(text)
        }}</CText>
        <br />
        <br />
      </div>
    </div>
    <div class="section section--spacers">
      <h2 class="section__title">Spacers</h2>
      <div class="spacer spacer-xxs">xxs</div>
      <div class="spacer spacer-xs">xs</div>
      <div class="spacer spacer-m">m</div>
      <div class="spacer spacer-l">l</div>
      <div class="spacer spacer-xl">xl</div>
      <div class="spacer spacer-xxl">xxl</div>
    </div>

    <div class="section section--colors">
      <h2 class="section__title">Colors</h2>
      <div
        v-for="color in colors"
        :key="color"
        class="style-color"
        :style="{ '--style-color': `var(${color})` }"
      >
        {{ color.replace("--", "").replace("-", " ") }} ( {{ color }} )
      </div>
    </div>
  </div>
</template>

<script setup>
const capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

const texts = [
  "uber",
  "h1",
  "h2",
  "h3",
  "h4",
  "quote",
  "body-xxl",
  "body-xl",
  "body-l",
  "body-m",
  "body-s",
  "body-xs",
  "body-xxs",
];

const colors = [
  "--blanc",
  "--rouge",
  "--noir",
  "--bourgogne",
  "--rose",
  "--jaune",
  "--indigo",
  "--gris",
  "--menthe",
  "--sarcelle",
  "--khaki",
  "--lime",
];
</script>

<style lang="scss">
@use "~/assets/scss/utils/media-queries" as *;
@use "~/assets/scss/utils/tools" as *;
@use "~/assets/scss/utils/style-guide-mixins" as *;

.styleguide {
  width: 100%;
  padding: var(--m);
  color: #000;

  @media screen and (max-width: $mobile) {
    padding: 0 base8(2) base8(2) base8(2);
  }

  .image {
    width: 100%;
    height: auto;
  }

  .section {
    margin-bottom: var(--m);

    &__container {
      padding: 0 base8(4) base8(4) base8(4);
    }

    &__title {
      @include h4-style;
      padding: base8(4);
      background-color: var(--indigo);
      color: #fff;
      margin-bottom: base8(4);
    }

    &--spacers {
      margin-top: base8(6);

      div {
        margin-bottom: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }

    &--colors {
      .style-color {
        display: flex;
        align-items: center;
        margin-bottom: base8(2);
        line-height: 1em;
        &:before {
          content: "";
          display: block;
          width: 1em;
          height: 1em;
          background-color: var(--style-color);
          display: inline-block;
          border-radius: 4px;
          margin-right: 5px;
          border: 1px solid gray;
        }
      }
    }
  }

  .spacer {
    background-color: lightgray;

    &-xxs {
      width: var(--xxs);
      height: var(--xxs);
    }

    &-xs {
      width: var(--xs);
      height: var(--xs);
    }

    &-m {
      width: var(--m);
      height: var(--m);
    }

    &-l {
      width: var(--l);
      height: var(--l);
    }

    &-xl {
      width: var(--xl);
      height: var(--xl);
    }

    &-xxl {
      width: var(--xxl);
      height: var(--xxl);
    }
  }
}
</style>
