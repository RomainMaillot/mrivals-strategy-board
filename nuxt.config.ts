// https://nuxt.com/docs/api/configuration/nuxt-config
const scripts: any[] = [];

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  app: {
    head: {
      meta: [
        { charset: "utf-8" },
        {
          name: "viewport",
          content: "width=device-width, initial-scale=1",
        },
        { name: "format-detection", content: "telephone=no" },
        {
          "data-hid": "robots",
          name: "robots",
          content:
            process.env.ENV == "production"
              ? "index,follow"
              : "noindex,nofollow",
        },
        {
          "data-hid": "msapplication",
          name: "msapplication-TileColor",
          content: "#2A2A2D",
        },
        { "data-hid": "theme", name: "theme-color", content: "#2a2a2d" },
      ],
      link: [
        { rel: "icon", href: "/meta/favicon.svg" },
        {
          rel: "mask-icon",
          color: "#E85437",
          href: "/meta/favicon.svg",
        },
      ],
      script: scripts,
    },
  },
  components: [
    {
      path: "~/components",
      pathPrefix: false,
    },
  ],

  css: ["~/assets/scss/root.scss", "~/assets/scss/application.scss"],

  vite: {
    plugins: [],
    css: {
      preprocessorOptions: {
        scss: {
          additionalData:
            '@use "sass:math"; @use "@/assets/scss/utils/easings.scss" as easings; @use "@/assets/scss/utils/style-guide-mixins.scss" as mixins; @use "@/assets/scss/utils/tools.scss" as tools; @use "@/assets/scss/utils/media-queries.scss" as mq;',
        },
      },
    },
    esbuild: {
      drop: process.env.ENV == "production" ? ["console", "debugger"] : [],
    },
  },
  build: {
    transpile: [],
  },

  runtimeConfig: {
    // Public keys that are exposed to the client
    public: {
      siteDomain: process.env.SITE_DOMAIN,
      defaultLanguage: process.env.DEFAULT_LANGUAGE,
    },
    private: {},
  },

  modules: ["@nuxtjs/device", "@nuxt/devtools"],

  // Static site generation
  ssr: true,
  nitro: {
    output: {
      dir:
        process.env.TARGET == "static" ? "static-generation" : "ssr-generation",
    },
  },
  devtools: { enabled: true },
});
