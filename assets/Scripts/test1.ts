import { _decorator, Component, Node, EventTouch } from 'cc'
const { ccclass, property } = _decorator

/**
 * Predefined variables
 * Name = test1
 * DateTime = Tue Feb 22 2022 10:20:58 GMT+0800 (中国标准时间)
 * Author = tt-intl-web
 * FileBasename = test1.ts
 * FileBasenameNoExtension = test1
 * URL = db://assets/Scripts/test1.ts
 * ManualUrl = https://docs.cocos.com/creator/3.4/manual/zh/
 *
 */

@ccclass('test1')
export class test1 extends Component {
  // [1]
  // dummy = '';

  // [2]
  // @property
  // serializableDummy = 0;

  start() {
    // [3]
  }

  onLoad() {
    this.node.on(Node.EventType.TOUCH_START, function (event: EventTouch) {}, this)
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
