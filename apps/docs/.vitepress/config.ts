import { defineConfig } from "vitepress";
import { resolve } from "path";

export default defineConfig({
  title: "DataPrism Core",
  description:
    "High-performance browser-based analytics engine with WebAssembly",
  base: "/DataPrism/",

  head: [
    ["link", { rel: "icon", href: "/favicon.ico" }],
    ["meta", { name: "theme-color", content: "#3b82f6" }],
    ["meta", { property: "og:type", content: "website" }],
    ["meta", { property: "og:locale", content: "en" }],
    ["meta", { property: "og:title", content: "DataPrism Core Documentation" }],
    ["meta", { property: "og:site_name", content: "DataPrism Docs" }],
    [
      "meta",
      {
        property: "og:image",
        content: "https://srnarasim.github.io/DataPrism/og-image.png",
      },
    ],
    ["meta", { property: "og:url", content: "https://srnarasim.github.io/DataPrism/" }],
    // Required for WebAssembly
    [
      "meta",
      { "http-equiv": "Cross-Origin-Embedder-Policy", content: "require-corp" },
    ],
    [
      "meta",
      { "http-equiv": "Cross-Origin-Opener-Policy", content: "same-origin" },
    ],
  ],

  themeConfig: {
    logo: "/logo.svg",

    nav: [
      { text: "Guide", link: "/guide/" },
      { text: "API Reference", link: "/api/" },
      { text: "Examples", link: "/examples/" },
      { text: "Plugins", link: "/plugins/" },
      {
        text: "Links",
        items: [
          { text: "Demo", link: "https://demo.dataprism.dev" },
          { text: "GitHub", link: "https://github.com/srnarasim/DataPrism" },
          {
            text: "NPM",
            link: "https://www.npmjs.com/package/@dataprism/core",
          },
        ],
      },
    ],

    sidebar: {
      "/guide/": [
        {
          text: "Introduction",
          collapsed: false,
          items: [
            { text: "What is DataPrism?", link: "/guide/" },
            { text: "Getting Started", link: "/guide/getting-started" },
            { text: "Installation", link: "/guide/installation" },
            { text: "Quick Start", link: "/guide/quick-start" },
          ],
        },
        {
          text: "Core Concepts",
          collapsed: false,
          items: [
            { text: "Architecture", link: "/guide/architecture" },
            { text: "WebAssembly Engine", link: "/guide/webassembly" },
            { text: "DuckDB Integration", link: "/guide/duckdb" },
            { text: "Data Processing", link: "/guide/data-processing" },
          ],
        },
        {
          text: "Features",
          collapsed: false,
          items: [
            { text: "Query Engine", link: "/guide/query-engine" },
            { text: "Data Loading", link: "/guide/data-loading" },
            { text: "Memory Management", link: "/guide/memory-management" },
            { text: "Performance Optimization", link: "/guide/performance" },
          ],
        },
        {
          text: "Advanced",
          collapsed: false,
          items: [
            { text: "Custom Plugins", link: "/guide/plugins" },
            { text: "LLM Integration", link: "/guide/llm-integration" },
            { text: "Security", link: "/guide/security" },
            { text: "Deployment", link: "/guide/deployment" },
          ],
        },
      ],
      "/api/": [
        {
          text: "API Reference",
          collapsed: false,
          items: [
            { text: "Overview", link: "/api/" },
            { text: "DataPrismEngine", link: "/api/engine" },
            { text: "DataPrismOrchestrator", link: "/api/orchestrator" },
            { text: "Plugin Framework", link: "/api/plugin-framework" },
          ],
        },
        {
          text: "Core APIs",
          collapsed: false,
          items: [
            { text: "Query Methods", link: "/api/query" },
            { text: "Data Loading", link: "/api/data-loading" },
            { text: "Memory Management", link: "/api/memory" },
            { text: "Error Handling", link: "/api/errors" },
          ],
        },
        {
          text: "Plugin APIs",
          collapsed: false,
          items: [
            { text: "Plugin Base", link: "/api/plugin-base" },
            { text: "Data Processors", link: "/api/data-processors" },
            { text: "Visualizations", link: "/api/visualizations" },
            { text: "Integrations", link: "/api/integrations" },
          ],
        },
      ],
      "/examples/": [
        {
          text: "Basic Examples",
          collapsed: false,
          items: [
            { text: "Hello World", link: "/examples/" },
            { text: "Loading CSV Data", link: "/examples/csv-loading" },
            { text: "Simple Queries", link: "/examples/simple-queries" },
            { text: "Data Visualization", link: "/examples/visualization" },
          ],
        },
        {
          text: "Advanced Examples",
          collapsed: false,
          items: [
            { text: "Real-time Analytics", link: "/examples/realtime" },
            { text: "Complex Aggregations", link: "/examples/aggregations" },
            { text: "Custom Plugins", link: "/examples/custom-plugins" },
            { text: "Performance Monitoring", link: "/examples/monitoring" },
          ],
        },
        {
          text: "Integration Examples",
          collapsed: false,
          items: [
            { text: "React Integration", link: "/examples/react" },
            { text: "Vue Integration", link: "/examples/vue" },
            { text: "CDN Usage", link: "/examples/cdn" },
            { text: "Node.js Backend", link: "/examples/nodejs" },
          ],
        },
      ],
      "/plugins/": [
        {
          text: "Plugin Development",
          collapsed: false,
          items: [
            { text: "Overview", link: "/plugins/" },
            { text: "Plugin Types", link: "/plugins/types" },
            { text: "Development Guide", link: "/plugins/development" },
            { text: "Testing Plugins", link: "/plugins/testing" },
          ],
        },
        {
          text: "Built-in Plugins",
          collapsed: false,
          items: [
            { text: "CSV Importer", link: "/plugins/csv-importer" },
            { text: "Observable Charts", link: "/plugins/observable-charts" },
            { text: "Semantic Clustering", link: "/plugins/clustering" },
            {
              text: "Performance Monitor",
              link: "/plugins/performance-monitor",
            },
          ],
        },
        {
          text: "Plugin API",
          collapsed: false,
          items: [
            { text: "Plugin Interface", link: "/plugins/interface" },
            { text: "Lifecycle Methods", link: "/plugins/lifecycle" },
            { text: "Data Processing", link: "/plugins/data-processing" },
            { text: "Security Model", link: "/plugins/security" },
          ],
        },
      ],
    },

    socialLinks: [
      { icon: "github", link: "https://github.com/srnarasim/DataPrism" },
    ],

    footer: {
      message: "Released under the MIT License.",
      copyright: "Copyright © 2024 DataPrism Team",
    },

    editLink: {
      pattern: "https://github.com/srnarasim/DataPrism/edit/main/apps/docs/:path",
      text: "Edit this page on GitHub",
    },

    search: {
      provider: "local",
      options: {
        locales: {
          root: {
            translations: {
              button: {
                buttonText: "Search docs",
                buttonAriaLabel: "Search docs",
              },
              modal: {
                noResultsText: "No results for",
                resetButtonTitle: "Clear search criteria",
                footer: {
                  selectText: "to select",
                  navigateText: "to navigate",
                },
              },
            },
          },
        },
      },
    },
  },

  markdown: {
    theme: {
      light: "github-light",
      dark: "github-dark",
    },
    lineNumbers: true,
    config: (md) => {
      // Add custom markdown plugins if needed
    },
  },

  vite: {
    resolve: {
      alias: {
        "@": resolve(__dirname, "../"),
        "@dataprism/core": resolve(__dirname, "../../../packages/core/src"),
        "@dataprism/orchestration": resolve(
          __dirname,
          "../../../packages/orchestration/src",
        ),
        "@dataprism/plugin-framework": resolve(
          __dirname,
          "../../../packages/plugins/src",
        ),
      },
    },
    optimizeDeps: {
      exclude: [
        "@dataprism/core",
        "@dataprism/orchestration",
        "@dataprism/plugin-framework",
      ],
    },
    // Required for WebAssembly in docs
    server: {
      headers: {
        "Cross-Origin-Embedder-Policy": "require-corp",
        "Cross-Origin-Opener-Policy": "same-origin",
      },
    },
  },

  lastUpdated: true,
  cleanUrls: true,
  ignoreDeadLinks: true,

  sitemap: {
    hostname: "https://srnarasim.github.io/DataPrism",
  },
});
