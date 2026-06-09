import React, {createContext, useContext} from 'react';

import {PluginDefinition} from '@gustav/types';

export interface ActiveThemeInfo {
  activeTheme: string | null;
  themePlugin: PluginDefinition | null;
  loading: boolean;
}

const ActiveThemeContext = createContext<ActiveThemeInfo>({
  activeTheme: null,
  themePlugin: null,
  loading: true,
});

export function useActiveTheme() {
  return useContext(ActiveThemeContext);
}

export {ActiveThemeContext};