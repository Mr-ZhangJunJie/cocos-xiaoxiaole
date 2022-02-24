import { Vec2 } from 'cc'
import { CELL_STATUS, CELL_TYPE, ANITIME, ACTION_TYPES } from './ConstValue'
import type { CELL_PLAY_DES } from './ConstValue'

export default class CellModel {
  type: CELL_TYPE | null = null
  status: CELL_STATUS = CELL_STATUS.COMMON
  x: number = 1
  y: number = 1
  startX: number = 1
  startY: number = 1
  cmd: CELL_PLAY_DES[] = []
  isDeath: boolean = false
  objectCount: number = Math.floor(Math.random() * 1000)

  init(type: CELL_TYPE) {
    this.type = type
  }

  isEmpty() {
    return this.type === CELL_TYPE.EMPTY
  }

  setEmpty() {
    this.type = CELL_TYPE.EMPTY
  }

  setXY(x: number, y: number) {
    this.x = x
    this.y = y
  }

  setStartXY(x: number, y: number) {
    this.startX = x
    this.startY = y
  }

  setStatus(status: CELL_STATUS) {
    this.status = status
  }

  moveToAndBack(pos: Vec2) {
    const srcPos: Vec2 = new Vec2(this.x, this.y)
    this.cmd.push({
      action: ACTION_TYPES.MOVETO,
      keepTime: ANITIME.TOUCH_MOVE,
      playTime: 0,
      pos: pos
    })
    this.cmd.push({
      action: ACTION_TYPES.MOVETO,
      keepTime: ANITIME.TOUCH_MOVE,
      playTime: ANITIME.TOUCH_MOVE,
      pos: srcPos
    })
  }

  moveTo(pos: Vec2, playTime: number) {
    const srcPos = new Vec2(this.x, this.y)

    this.cmd.push({
      action: ACTION_TYPES.MOVETO,
      keepTime: ANITIME.TOUCH_MOVE,
      playTime: playTime,
      pos: pos
    })
    this.x = pos.x
    this.y = pos.y
  }

  toDie(playTime: number) {
    this.cmd.push({
      action: ACTION_TYPES.TODIE,
      keepTime: ANITIME.DIE,
      playTime: playTime
    })
    this.isDeath = true
  }

  toShake(playTime: number) {
    this.cmd.push({
      action: ACTION_TYPES.TOSHAKE,
      keepTime: ANITIME.DIE_SHAKE,
      playTime: playTime
    })
  }

  setVisible(playTime: number, isVisible: boolean) {
    this.cmd.push({
      action: ACTION_TYPES.SETVISIBLE,
      keepTime: 0,
      playTime: playTime,
      isVisible: isVisible
    })
  }

  moveToAndDie(pos) {
    console.log('moveToAndDie')
  }

  isBrid() {
    return this.type === CELL_TYPE.BIRD
  }
}
