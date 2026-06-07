import {habboWebRegistry} from '@gustav/habbo-plugin';

export function registerArcturusHooks() {
  habboWebRegistry.registerHooks({
    getAvatarUrl: (look, options) => {
      const size = options?.size || 'm';
      const direction = options?.direction || 2;
      const headDirection = options?.head_direction || 2;
      const gesture = options?.gesture || 'std';
      const action = options?.action || '';
      
      return `https://www.habbo.com/habbo-imaging/avatarimage?figure=${look}&size=${size}&direction=${direction}&head_direction=${headDirection}&gesture=${gesture}&action=${action}`;
    },
    getRoomThumbnailUrl: (roomId) => {
      // Arcturus often uses a specific path for room thumbnails if hosted locally,
      // or a placeholder if not.
      return `/api/habbo/rooms/${roomId}/thumbnail`;
    },
    formatTimestamp: (ts) => {
      const num = typeof ts === 'string' ? parseInt(ts) : ts;
      // Habbo often uses unix seconds
      return new Date(num * 1000);
    }
  });
}
