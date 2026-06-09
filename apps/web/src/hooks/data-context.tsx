import type {DynamicSchemaField} from '@gustav/types';

import {createContext, useContext} from 'react';

export interface DataContextValue {
  fields: DynamicSchemaField[];
  currentRecord: Record<string, any> | null;
}

export const DataContext = createContext<DataContextValue>({
  fields: [],
  currentRecord: null,
});

export function useDataContext(): DataContextValue {
  return useContext(DataContext);
}
