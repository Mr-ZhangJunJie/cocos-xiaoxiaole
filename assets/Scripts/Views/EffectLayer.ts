import { _decorator, Component, Node, tween, Tween, instantiate } from 'cc'
import CellModel from '../Model/CellModel'
import { CELL_WIDTH } from '../Model/ConstValue'
const { ccclass, property } = _decorator
import { EFECT_TYPE } from '../Types/index'

/**
 * Predefined variables
 * Name = EffectLayer
 * DateTime = Wed Feb 23 2022 14:47:47 GMT+0800 (中国标准时间)
 * Author = tt-intl-web
 * FileBasename = EffectLayer.ts
 * FileBasenameNoExtension = EffectLayer
 * URL = db://assets/Scripts/Views/EffectLayer.ts
 * ManualUrl = https://docs.cocos.com/creator/3.4/manual/zh/
 *
 */

@ccclass('EffectLayer')
export class EffectLayer extends Component {
  // [1]
  // dummy = '';

  // [2]
  // @property
  // serializableDummy = 0;
  animal: Tween<Node> = null
  onLoad() {
    this.animal = tween(this.node)
  }
  start() {
    // [3]
  }

  playEffects(efectsQueue: EFECT_TYPE[] | undefined) {
    //不存在动画
    if (!efectsQueue || efectsQueue.length <= 0) {
      return
    }
    let soundMap = {}

    efectsQueue.forEach(function (cmd) {
      this.animal.delay(cmd.playTime)
      this.animal.call(() => {
        let instantEffect = null
        let animation = null

        if (cmd.action === 'crush') {
          instantEffect = instantiate(this.crushEffect)
          animation = instantEffect.getComponent(Animation)
          animation.play('effect')
          !soundMap['crush' + cmd.playTime] && this.audioUtils.playEliminate(cmd.step)
          soundMap['crush' + cmd.playTime] = true
        } else if (cmd.action === 'rowBomb') {
          instantEffect = instantiate(this.bombWhite)
          animation = instantEffect.getComponent(Animation)
          animation.play('effect_line')
        } else if (cmd.action === 'colBomb') {
          instantEffect = instantiate(this.bombWhite)
          animation = instantEffect.getComponent(Animation)
          animation.play('effect_col')
        }

        instantEffect.x = CELL_WIDTH * (cmd.pos.x - 0.5)
        instantEffect.y = CELL_WIDTH * (cmd.pos.y - 0.5)

        this.node.addChild(instantEffect)
        animation.on(
          'finished',
          function () {
            instantEffect.destroy()
          },
          this
        )
      })

      this.animal.start()
      // let delayTime
      //   let delayTime = cmd.playTime
      //   let callFunc = function () {
      //     let instantEffect = null
      //     let animation = null
      //     if (cmd.action === 'crush') {
      //     } else if (cmd.action === 'rowBomb') {
      //     } else if (cmd.action === 'colBomb') {
      //     }
      //   }
      // 执行动画
      //   this.node.runAction(sequence(delayTime, callFunc))
    }, this)
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
