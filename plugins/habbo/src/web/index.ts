export interface HabboWebHook {
  name: string;
  handler: (data: any) => any;
}

export class HabboWebRegistry {
  private hooks = new Map<string, HabboWebHook>();

  registerHook(hook: HabboWebHook) {
    this.hooks.set(hook.name, hook);
  }

  getHook(name: string) {
    return this.hooks.get(name);
  }

  executeHook(name: string, data: any) {
    const hook = this.getHook(name);
    return hook ? hook.handler(data) : data;
  }
}

export const habboWebRegistry = new HabboWebRegistry();
