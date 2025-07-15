import { Plugin } from "vite";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, resolve } from 'path';

export interface JekyllPluginOptions {
  enabled?: boolean;
  templateDir?: string;
  outDir?: string;
}

/**
 * Vite plugin to copy Jekyll configuration files for GitHub Pages deployment
 * This ensures that Jekyll processes the files correctly and fixes the 404 issue
 */
export function jekyllPlugin(options: JekyllPluginOptions = {}): Plugin {
  const {
    enabled = true,
    templateDir = resolve(process.cwd(), 'tools/build/jekyll-templates'),
    outDir = 'cdn/dist'
  } = options;

  let outputDir = outDir;

  return {
    name: 'jekyll-github-pages',
    
    configResolved(config) {
      outputDir = config.build.outDir || outDir;
    },
    
    writeBundle() {
      if (!enabled) {
        console.log('🏷️  Jekyll plugin disabled');
        return;
      }

      console.log('🏷️  Copying Jekyll configuration files...');

      try {
        // Ensure output directory exists
        if (!existsSync(outputDir)) {
          mkdirSync(outputDir, { recursive: true });
        }

        // Copy Jekyll configuration files
        const filesToCopy = ['_config.yml', '.nojekyll', 'index.html'];
        
        filesToCopy.forEach(file => {
          const srcPath = join(templateDir, file);
          const destPath = join(outputDir, file);
          
          if (existsSync(srcPath)) {
            let content = readFileSync(srcPath, 'utf8');
            
            // Replace dynamic values in index.html if needed
            if (file === 'index.html') {
              // Could add dynamic URL replacement here if needed
              // content = content.replace(/{{BASE_URL}}/g, baseUrl);
            }
            
            writeFileSync(destPath, content);
            console.log(`   ✅ Copied ${file}`);
          } else {
            console.warn(`   ⚠️  Template file not found: ${srcPath}`);
          }
        });

        console.log('✅ Jekyll configuration files copied successfully');
        console.log('   This fixes the GitHub Pages 404 issue by ensuring Jekyll processes files correctly');

      } catch (error) {
        console.error('❌ Failed to copy Jekyll files:', (error as Error).message);
        throw error;
      }
    }
  };
}