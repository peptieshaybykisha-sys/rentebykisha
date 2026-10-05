/** Showroom photo adjustments used until an admin changes them. */
export const DEFAULT_SHOWROOM = { focusX: 50, focusY: 60, zoom: 1, brightness: 1 }
export const SHOWROOM_LIMITS = { zoom: [1, 2.5], brightness: [0.7, 1.3] } as const

/** Scroll progress keyframes for the doors: crack of light, gap, half open, nearly open, fully open. */
export const DOOR_PROGRESS = [0, 0.15, 0.4, 0.6, 0.85, 1]
export const DOOR_ANGLES = [0, 3, 26, 50, 70, 82]
export const DOOR_ANGLES_REDUCED = [0, 0, 0, 0, 0, 0]
