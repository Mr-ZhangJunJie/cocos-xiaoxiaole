import { Vec2 } from 'cc'

export const CELL_BASENUM = 6

export const GRID_WIDTH = 9
export const GRID_HEIGHT = 9

export const CELL_WIDTH = 70
export const CELL_HEIGHT = 70

export enum CELL_TYPE {
  EMPTY,
  A,
  B,
  C,
  D,
  E,
  F,
  BIRD
}

export enum CELL_STATUS {
  COMMON = 0,
  CLICK = 'click',
  LINE = 'line',
  COLUMN = 'column',
  WRAP = 'wrap',
  BIRD = 'bird'
}

export type CELL_PLAY_DES = {
  action: ACTION_TYPES
  keepTime: number
  playTime: number
  pos?: Vec2
  isVisible?: boolean
}

export enum ACTION_TYPES {
  MOVETO = 'moveTo',
  TODIE = 'toDie',
  TOSHAKE = 'toShake',
  SETVISIBLE = 'setVisible'
}

export enum ANITIME {
  TOUCH_MOVE = 0.3,
  DIE = 0.2,
  DOWN = 0.5,
  BOMB_DELAY = 0.3,
  BOMB_BIRD_DELAY = 0.7,
  DIE_SHAKE = 0.4
}

export const GRID_PIXEL_WIDTH = GRID_WIDTH * CELL_WIDTH
export const GRID_PIXEL_HEIGHT = GRID_HEIGHT * CELL_HEIGHT
