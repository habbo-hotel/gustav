import * as fs from 'fs';
import * as path from 'path';
import {DynamicModule, Module} from '@nestjs/common';

import {UserModule} from './user/user.module';
import {AuthModule} from './auth/auth.module';
import {PageModule} from './page/page.module';
import {SchemaModule} from './schema/schema.module';
import {HealthModule} from './health/health.module';
import {DatabaseModule} from './database/database.module';

@Module({
  imports: [
    DatabaseModule,
    UserModule,
    AuthModule,
    PageModule,
    SchemaModule,
    HealthModule,
  ],
})
export class AppModule {
  static async registerPlugins(): Promise<DynamicModule> {
    const rootDir = path.resolve(process.cwd(), '../../');
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

    const dynamicImports: any[] = [];

    for (const pkg of pluginPackages) {
      try {
        const pluginModule = await import(pkg);
        if (pluginModule.PluginBackendModule) {
          dynamicImports.push(pluginModule.PluginBackendModule);
          console.log(`[Plugin System] Loaded backend module for ${pkg}`);
        } else {
          console.log(`[Plugin System] No backend module found for ${pkg}`);
        }
      } catch (err: any) {
        console.log(
          `[Plugin System] Skipping backend loading for ${pkg}: ${err.message}`
        );
      }
    }

    return {
      module: AppModule,
      imports: [...dynamicImports],
    };
  }
}
