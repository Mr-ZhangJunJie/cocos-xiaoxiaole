import { _decorator, Component, Node } from 'cc'
import CellModel from '../Model/CellModel'
const { ccclass, property } = _decorator

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

  start() {
    // [3]
  }

  playEffects(efectsQueue: CellModel[] | undefined) {
    //不存在动画
    if (!efectsQueue || efectsQueue.length <= 0) {
      return
    }
    let soundMap = {}

    efectsQueue.forEach(function (cmd) {
      //    let delayTime  = cmd.
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
