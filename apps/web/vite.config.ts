import fs from 'fs';
import path from 'path';
import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';

function gustavPlugins() {
  const virtualModuleId = 'virtual:gustav-plugins';
  const resolvedVirtualModuleId = '\0' + virtualModuleId;

  return {
    name: 'gustav-plugins',
    resolveId(id: string) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId;
      }
    },
    load(id: string) {
      if (id === resolvedVirtualModuleId) {
        const rootDir = path.resolve(__dirname, '../../');
        const manifestPath = path.join(rootDir, 'gustav.plugins.json');
        let pluginPackages: string[] = [];

        if (fs.existsSync(manifestPath)) {
          try {
            const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
            pluginPackages = manifest.plugins || [];
          } catch (e) {
            console.error('Failed to parse gustav.plugins.json', e);
          }
        }

        let imports = '';
        const exportsList: string[] = [];

        pluginPackages.forEach((pkg, idx) => {
          imports += `import { plugin as plugin_${idx} } from '${pkg}';\n`;
          exportsList.push(`plugin_${idx}`);
        });

        return `${imports}\nexport const plugins = [${exportsList.join(', ')}];\n`;
      }
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), gustavPlugins()],
  server: {
    port: 5173,
  },
});
