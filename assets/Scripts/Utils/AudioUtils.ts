import { _decorator, Component, Node, AudioSource, assert, AudioClip } from 'cc'
const { ccclass, property } = _decorator

/**
 * Predefined variables
 * Name = AudioUtils
 * DateTime = Mon Feb 21 2022 18:22:39 GMT+0800 (中国标准时间)
 * Author = tt-intl-web
 * FileBasename = AudioUtils.ts
 * FileBasenameNoExtension = AudioUtils
 * URL = db://assets/Scripts/Utils/AudioUtils.ts
 * ManualUrl = https://docs.cocos.com/creator/3.4/manual/zh/
 *
 */

@ccclass('AudioUtils')
export class AudioUtils extends Component {
  // [1]
  // dummy = '';

  // [2]
  // @property
  // serializableDummy = 0;
  @property(AudioClip)
  continuousMatch: AudioClip[] = []

  @property(AudioClip)
  eliminate: AudioClip[] = []

  @property(AudioClip)
  click: AudioClip = null

  @property(AudioClip)
  swap: AudioClip = null

  _audioSource: AudioSource = null

  onLoad() {
    this._audioSource = this.getComponent(AudioSource)
    // 检查是否含有 AudioSource，如果没有，则输出错误消息
    assert(this._audioSource)
  }
  // 动画效果
  playContinuousMatch(step: number) {
    step = Math.min(step, 11)
    if (step < 2) return
    this._audioSource.playOneShot(this.continuousMatch[Math.floor(step / 2) - 1], 1)
  }

  playSwap() {
    this._audioSource.playOneShot(this.swap, 1)
  }

  playClick() {
    this._audioSource.playOneShot(this.click, 1)
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
