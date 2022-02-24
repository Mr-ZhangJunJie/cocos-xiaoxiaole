import { _decorator, Component, Node, ProgressBar, Button, director } from 'cc'
const { ccclass, property } = _decorator

/**
 * Predefined variables
 * Name = LoginController
 * DateTime = Fri Feb 18 2022 17:51:24 GMT+0800 (中国标准时间)
 * Author = tt-intl-web
 * FileBasename = LoginController.ts
 * FileBasenameNoExtension = LoginController
 * URL = db://assets/Scripts/Controllers/LoginController.ts
 * ManualUrl = https://docs.cocos.com/creator/3.4/manual/zh/
 *
 */

@ccclass('LoginController')
export class LoginController extends Component {
  // [1]
  // dummy = '';

  // [2]
  // @property
  // serializableDummy = 0;
  @property({ type: ProgressBar })
  loadingBar: ProgressBar = null

  @property(Button)
  loginButton: Button = null

  start() {
    // [3]
  }

  onLoad() {
    // 播放音乐
  }

  onLogin() {
    // 显示loading条
    this.loadingBar.node.active = true
    // loading 按钮隐藏
    this.loginButton.node.active = false
    // loadingBar 进度为0
    this.loadingBar.progress = 0
    // 加载Game场景
    director.preloadScene(
      'Game',
      function (completeCount, totalCount) {
        this.loadingBar.progress = completeCount / totalCount
      }.bind(this),
      function () {
        // 显示loading条
        this.loadingBar.node.active = false
        // loading 按钮隐藏
        this.loginButton.node.active = true
        this.scheduleOnce(function () {
          director.loadScene('Game')
        }, 4)
      }.bind(this)
    ),
      this
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
