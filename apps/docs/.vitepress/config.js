import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'DataPrism Documentation',
  description: 'WebAssembly-powered browser analytics engine with DuckDB and LLM integration',
  base: '/DataPrism/',
  outDir: './.vitepress/dist',
  ignoreDeadLinks: true,
  
  // Build configuration
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['vue'],
          'theme': ['vitepress']
        }
      }
    }
  },
  
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/DataPrism/docs/favicon.svg' }],
    ['meta', { name: 'theme-color', content: '#3c82f6' }],
    ['meta', { name: 'og:type', content: 'website' }],
    ['meta', { name: 'og:locale', content: 'en' }],
    ['meta', { name: 'og:site_name', content: 'DataPrism Documentation' }],
    ['meta', { name: 'og:image', content: 'https://srnarasim.github.io/DataPrism/docs/og-image.png' }],
    ['script', { src: 'https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX', async: '' }],
    ['script', {}, `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-XXXXXXXXXX');
    `]
  ],

  themeConfig: {
    logo: '/logo.svg',
    siteTitle: 'DataPrism',
    
    nav: [
      { text: 'Guide', link: '/guide/' },
      { text: 'Plugins', link: '/plugins/' },
      { text: 'API', link: '/api/' },
      { text: 'Examples', link: '/examples/' },
      {
        text: 'v1.0.0',
        items: [
          { text: 'Changelog', link: 'https://github.com/srnarasim/DataPrism/blob/main/CHANGELOG.md' },
          { text: 'Contributing', link: 'https://github.com/srnarasim/DataPrism/blob/main/CONTRIBUTING.md' }
        ]
      }
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Introduction',
          items: [
            { text: 'What is DataPrism?', link: '/guide/' },
            { text: 'Getting Started', link: '/guide/getting-started' },
            { text: 'Installation', link: '/guide/installation' },
            { text: 'Quick Start', link: '/guide/quick-start' }
          ]
        },
        {
          text: 'Core Concepts',
          items: [
            { text: 'Architecture', link: '/guide/architecture' },
            { text: 'WebAssembly Engine', link: '/guide/wasm-engine' },
            { text: 'DuckDB Integration', link: '/guide/duckdb' },
            { text: 'LLM Integration', link: '/guide/llm' }
          ]
        },
        {
          text: 'Advanced',
          items: [
            { text: 'Performance Optimization', link: '/guide/performance' },
            { text: 'Security', link: '/guide/security' },
            { text: 'Troubleshooting', link: '/guide/troubleshooting' }
          ]
        }
      ],
      '/plugins/': [
        {
          text: 'Plugin System',
          items: [
            { text: 'Overview', link: '/plugins/' },
            { text: 'Architecture', link: '/plugins/architecture' },
            { text: 'Getting Started', link: '/plugins/getting-started' }
          ]
        },
        {
          text: 'Out-of-Box Plugins',
          items: [
            { text: 'Overview', link: '/plugins/out-of-box/' },
            { text: 'Observable Charts', link: '/plugins/out-of-box/observable-charts' },
            { text: 'CSV Importer', link: '/plugins/out-of-box/csv-importer' },
            { text: 'Semantic Clustering', link: '/plugins/out-of-box/semantic-clustering' },
            { text: 'Performance Monitor', link: '/plugins/out-of-box/performance-monitor' }
          ]
        },
        {
          text: 'Plugin Development',
          items: [
            { text: 'Creating Plugins', link: '/plugins/development' },
            { text: 'AI Plugin Generator', link: '/plugins/ai-generator/' },
            { text: 'Plugin API', link: '/plugins/api' },
            { text: 'Testing Plugins', link: '/plugins/testing' }
          ]
        }
      ],
      '/api/': [
        {
          text: 'API Reference',
          items: [
            { text: 'Overview', link: '/api/' },
            { text: 'Core Engine', link: '/api/core' },
            { text: 'Orchestration', link: '/api/orchestration' },
            { text: 'Plugin Framework', link: '/api/plugins' }
          ]
        }
      ],
      '/examples/': [
        {
          text: 'Examples',
          items: [
            { text: 'Overview', link: '/examples/' },
            { text: 'Basic Usage', link: '/examples/basic' },
            { text: 'Advanced Queries', link: '/examples/advanced' },
            { text: 'Plugin Examples', link: '/examples/plugins' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/srnarasim/DataPrism' },
      { icon: 'twitter', link: 'https://twitter.com/dataprism' },
      { icon: 'discord', link: 'https://discord.gg/dataprism' }
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024 DataPrism Contributors'
    },

    search: {
      provider: 'local',
      options: {
        locales: {
          zh: {
            translations: {
              button: {
                buttonText: '搜索文档',
                buttonAriaLabel: '搜索文档'
              },
              modal: {
                noResultsText: '无法找到相关结果',
                resetButtonTitle: '清除查询条件',
                footer: {
                  selectText: '选择',
                  navigateText: '切换'
                }
              }
            }
          }
        }
      }
    },

    editLink: {
      pattern: 'https://github.com/srnarasim/DataPrism/edit/main/apps/docs/:path',
      text: 'Edit this page on GitHub'
    },

    lastUpdated: {
      text: 'Updated at',
      formatOptions: {
        dateStyle: 'short',
        timeStyle: 'medium'
      }
    }
  },

  markdown: {
    theme: {
      light: 'github-light',
      dark: 'github-dark'
    },
    lineNumbers: true,
    config: (md) => {
      // Add custom markdown plugins here
    }
  },

  vite: {
    define: {
      __VUE_OPTIONS_API__: false
    }
  },

  // Clean URLs configuration
  cleanUrls: true
})