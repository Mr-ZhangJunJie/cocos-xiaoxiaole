import { _decorator, Component, Node, AnimationClip, SpriteFrame, AnimationComponent, Animation, Sprite, tween, Vec2, Vec3, Color, Quat } from 'cc'
const { ccclass, property } = _decorator
import CellModel from '../Model/CellModel'
import { CELL_WIDTH, CELL_HEIGHT, CELL_STATUS, ANITIME } from '../Model/ConstValue'

/**
 * Predefined variables
 * Name = CellView
 * DateTime = Mon Feb 21 2022 15:56:50 GMT+0800 (中国标准时间)
 * Author = tt-intl-web
 * FileBasename = CellView.ts
 * FileBasenameNoExtension = CellView
 * URL = db://assets/Scripts/Views/CellView.ts
 * ManualUrl = https://docs.cocos.com/creator/3.4/manual/zh/
 *
 */

@ccclass('CellView')
export class CellView extends Component {
  // [1]
  // dummy = '';

  // [2]
  // @property
  // serializableDummy = 0;

  @property(SpriteFrame)
  defaultFrame: SpriteFrame = null

  model: CellModel = null
  isSelect: boolean = false

  status: CELL_STATUS = CELL_STATUS.COMMON

  onLoad() {
    this.isSelect = false
  }

  initWithModel(model: CellModel) {
    this.model = model
    const x = model.startX
    const y = model.startY
    // console.log(CELL_WIDTH * (x - 0.5), CELL_HEIGHT * (y - 0.5))

    this.node.setPosition(CELL_WIDTH * (x - 0.5), CELL_HEIGHT * (y - 0.5), 0)
    const animation: AnimationComponent = this.node.getComponent(Animation)

    if (model.status === CELL_STATUS.COMMON) {
      animation.stop()
    } else {
      animation.play(model.status)
    }
  }

  moveToAndBack() {}

  moveTo() {}

  setSelect(flag: boolean) {
    var animation = this.getComponent(Animation)
    var bg = this.node.getChildByName('Select')
    if (flag === false && this.isSelect && this.model.status == CELL_STATUS.COMMON) {
      animation.stop()
      this.getComponent(Sprite).spriteFrame = this.defaultFrame
    } else if (flag && this.model.status == CELL_STATUS.COMMON) {
      animation.play(CELL_STATUS.CLICK)
    } else if (flag && this.model.status == CELL_STATUS.BIRD) {
      animation.play(CELL_STATUS.BIRD)
    }
    bg.active = flag
    this.isSelect = flag
  }
  // 播放动画
  updateView() {
    const cmd = this.model.cmd
    const animal = tween(this.node)
    if (cmd.length <= 0) {
      return
    }
    let actionArray = []
    let curTime = 0
    for (let i = 0; i < cmd.length; i++) {
      const c = cmd[i]
      actionArray[i] = {}
      if (c.playTime > curTime) {
        const delay = c.playTime - curTime
        animal.delay(delay)
      }

      if (c.action === 'moveTo') {
        const x = (c.pos.x - 0.5) * CELL_WIDTH
        const y = (c.pos.y - 0.5) * CELL_HEIGHT
        animal.to(ANITIME.TOUCH_MOVE, { position: new Vec3(x, y, 0) })
        // 移动动画
      } else if (c.action === 'toDie') {
        if (this.status === CELL_STATUS.BIRD) {
          let animation = this.getComponent(Animation)
          animation.play('effect')
          // 延迟时间
          animal.delay(ANITIME.BOMB_BIRD_DELAY)
        }
        animal.call(() => {
          this.node.destroy()
        })
        // 回调函数
      } else if (c.action === 'setVisible') {
        let isVisible = c.isVisible
        animal.call(() => {
          const sprite = this.node.getComponent(Sprite)
          if (isVisible) {
            sprite.color = new Color(sprite.color.r, sprite.color.g, sprite.color.b, 255)
          } else {
            sprite.color = new Color(sprite.color.r, sprite.color.g, sprite.color.b, 0)
          }
        })
      } else if (c.action === 'toShake') {
        //
        animal.union()
        animal.by(0.06, { rotation: new Quat(Math.sin(90), Math.sin(90), Math.sin(30), Math.cos(90)) })
        animal.by(0.12, { rotation: new Quat(Math.sin(90), Math.sin(90), Math.sin(-60), Math.cos(90)) })
        animal.repeat(2)
      }
      curTime = c.playTime + c.keepTime
    }

    animal.start()
  }

  // update (deltaTime: number) {
  //     // [4]
  // }
}

/**
 * [1] Class member could be defined like this.
 * [2] Use `property` decorator if your want the member to be serializable.
 * [3] Your initialization goes here.
 * [4] Your update function goes here.
 *
 * Learn more about scripting: https://docs.cocos.com/creator/3.4/manual/zh/scripting/
 * Learn more about CCClass: https://docs.cocos.com/creator/3.4/manual/zh/scripting/ccclass.html
 * Learn more about life-cycle callbacks: https://docs.cocos.com/creator/3.4/manual/zh/scripting/life-cycle-callbacks.html
 */
