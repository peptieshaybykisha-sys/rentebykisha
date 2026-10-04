/**
 * Boutique showroom layout. Slot 0 is the centre piece, then right and left pairs outward.
 * Sizes differ on small screens (full-height crop) and md+ (the doorway is dollied into).
 */
export const SHOWROOM_SLOTS = [
  { left: '50%', size: 'h-[74%] md:h-[62%]', z: 3, hideOnSmall: false },
  { left: '19%', size: 'h-[58%] md:h-[50%]', z: 2, hideOnSmall: false },
  { left: '81%', size: 'h-[58%] md:h-[50%]', z: 2, hideOnSmall: false },
  { left: '-3%', size: 'h-[46%] md:h-[40%]', z: 1, hideOnSmall: true },
  { left: '103%', size: 'h-[46%] md:h-[40%]', z: 1, hideOnSmall: true },
]

/** Names shown in the admin hero editor for each slot. */
export const HERO_SLOT_NAMES = ['Centre piece', 'Right', 'Left', 'Far right', 'Far left']
export const HERO_MAX_DRESSES = SHOWROOM_SLOTS.length

/** Scroll progress keyframes for the doors: crack of light, gap, half open, nearly open, fully open. */
export const DOOR_PROGRESS = [0, 0.15, 0.4, 0.6, 0.85, 1]
export const DOOR_ANGLES = [0, 3, 26, 50, 70, 82]
export const DOOR_ANGLES_REDUCED = [0, 0, 0, 0, 0, 0]
