export interface HabboWebHooks {
  /**
   * Generates a URL for a user's avatar image.
   * @param look The user's look string (figure data).
   * @param options Optional rendering parameters (size, direction, etc).
   */
  getAvatarUrl?: (look: string, options?: any) => string;

  /**
   * Generates a URL for a room's thumbnail image.
   * @param roomId The room ID.
   */
  getRoomThumbnailUrl?: (roomId: string | number) => string;

  /**
   * Formats a Habbo timestamp (often unix seconds) into a readable string or Date.
   */
  formatTimestamp?: (timestamp: number | string) => string | Date;
}

export class HabboWebRegistry {
  private _hooks: Partial<HabboWebHooks> = {};

  registerHooks(hooks: Partial<HabboWebHooks>) {
    this._hooks = {...this._hooks, ...hooks};
  }

  get hooks() {
    return this._hooks;
  }

  /**
   * Helper to execute a hook if it exists, otherwise return a default value.
   */
  execute<K extends keyof HabboWebHooks>(
    hook: K,
    ...args: Parameters<NonNullable<HabboWebHooks[K]>>
  ): ReturnType<NonNullable<HabboWebHooks[K]>> | undefined {
    const handler = this._hooks[hook] as any;
    if (handler) {
      return handler(...args);
    }
    return undefined;
  }
}

export const habboWebRegistry = new HabboWebRegistry();
