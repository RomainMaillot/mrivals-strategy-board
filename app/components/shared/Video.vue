<template>
  <vue-plyr ref="plyr" key="video" :options="options" :class="{ cover }">
    <div v-if="isYoutube && videoId" class="plyr__video-embed">
      <iframe
        :src="`https://www.youtube.com/embed/${videoId}?iv_load_policy=3&amp;modestbranding=1&amp;playsinline=1&amp;showinfo=0&amp;rel=0&amp;enablejsapi=1`"
        allowfullscreen
        allowtransparency
        allow="autoplay"
      ></iframe>
    </div>
    <video
      v-else-if="!isYoutube && videoFile?.mediaItemUrl"
      playsinline
      muted
      autoplay
      preload
      :loop="noControls"
    >
      <source :src="videoFile?.mediaItemUrl" type="video/mp4" />
    </video>
  </vue-plyr>
</template>

<script setup>
// imports
import { ScrollTrigger } from "gsap/all";

// composables
// const { start, stop } = useScroll();

// emits
const emit = defineEmits(["play", "pause"]);

// props
const props = defineProps({
  videoId: String,
  cover: Boolean,
  isYoutube: Boolean,
  videoFile: Object,
  noControls: Boolean,
});

// data
const plyr = ref(null);
const options = ref({
  controls: props.noControls
    ? false
    : [
        "play-large",
        "play",
        "progress",
        "current-time",
        "mute",
        "volume",
        "captions",
        "settings",
        "pip",
        "airplay",
        "fullscreen",
      ],
  autoplay: props.noControls,
  muted: true,
  loop: { active: props.noControls },
});
const tr = ref(null);
const player = computed(() => plyr.value.player);

// methods
const play = () => {
  plyr.value.player.play();
};

// hooks
onMounted(() => {
  // unmute if necessary
  player.value.on("ready", () => {
    if (!props.noControls) {
      player.value.muted = false;
    } else {
      player.value.muted = true;
      player.value.play();
    }
  });

  // add events
  player.value.on("play", () => emit("play"));
  player.value.on("pause", () => emit("pause"));
  // player.value.on('enterfullscreen', stop);
  // player.value.on('exitfullscreen', start);

  // scroll trigger
  tr.value = ScrollTrigger.create({
    trigger: plyr.value.$el,
    start: "top bottom",
    end: "bottom top",
    onEnter: () => (props.noControls ? player.value.play() : null),
    onEnterBack: () => (props.noControls ? player.value.play() : null),
    onLeave: () => player.value.pause(),
    onLeaveBack: () => player.value.pause(),
  });
});
onBeforeUnmount(() => {
  if (tr.value) tr.value.kill();
  tr.value = null;
});

// exposes
defineExpose({
  play,
});
</script>

<style lang="scss">
.plyr video {
  object-fit: contain;

  &.cover {
    object-fit: cover;
  }
}

.plyr__video-embed {
  transform: scale(1.007);
}

.plyr--video,
.plyr__video-wrapper {
  background: transparent;
}
</style>
