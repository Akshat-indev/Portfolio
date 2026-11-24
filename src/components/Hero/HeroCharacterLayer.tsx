import { HERO_FULLBODY_SRC, HERO_PORTRAIT_SRC } from '../../config/heroMedia';

/**
 * Renders the character artwork:
 * - `variant="base"`: Full-body silhouette (`assets/Port_FullBody.png`) visible
 *   in the hero background outside and behind all masking windows.
 * - `variant="masterMask"`: ONE single globally positioned portrait layer
 *   (`assets/Port_CloseUp.png`) revealed continuously through all four
 *   draggable window apertures via `#hero-mask-apertures`.
 */

interface HeroCharacterLayerProps {
  variant: 'base' | 'masterMask';
}

export function HeroCharacterLayer({ variant }: HeroCharacterLayerProps) {
  const isMaster = variant === 'masterMask';

  return (
    <img
      src={isMaster ? HERO_PORTRAIT_SRC : HERO_FULLBODY_SRC}
      alt={isMaster ? '' : 'Akshat character illustration'}
      aria-hidden={isMaster}
      draggable={false}
      style={{
        display: 'block',
        width: '100%',
        height: '100%',
        objectFit: 'contain',
        objectPosition: isMaster ? 'center top' : 'center bottom',
        userSelect: 'none',
        pointerEvents: 'none',
      }}
    />
  );
}
