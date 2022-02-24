import { _decorator, Component, Node, instantiate, Prefab, EventTouch, Vec2, Vec3 } from 'cc'
const { ccclass, property } = _decorator
import { GameController } from '../Controllers/GameController'
import CellModel from '../Model/CellModel'
import { CELL_HEIGHT, CELL_WIDTH, GRID_HEIGHT, GRID_PIXEL_HEIGHT, GRID_PIXEL_WIDTH, GRID_WIDTH } from '../Model/ConstValue'
import { AudioUtils } from '../Utils/AudioUtils'
import { CellView } from './CellView'
import { EffectLayer } from './EffectLayer'

/**
 * Predefined variables
 * Name = ContainerView
 * DateTime = Sat Feb 19 2022 09:46:07 GMT+0800 (中国标准时间)
 * Author = tt-intl-web
 * FileBasename = ContainerView.ts
 * FileBasenameNoExtension = ContainerView
 * URL = db://assets/Scripts/Views/ContainerView.ts
 * ManualUrl = https://docs.cocos.com/creator/3.4/manual/zh/
 *
 */

@ccclass('ContainerView')
export class ContainerView extends Component {
  // [1]
  // dummy = '';

  // [2]
  // @property
  // serializableDummy = 0;

  // 对应单元格的预制体数组
  @property({ type: [Prefab] })
  aniPre: Prefab[] = []

  @property(EffectLayer)
  effectLayer: EffectLayer = null

  @property(AudioUtils)
  audioUtils: AudioUtils = null

  controller: GameController = null
  // 存放预制体节点
  cellViews: Node[][] = []
  lastTouchPos: Vec2 = new Vec2(-1, -1)
  isCanMove: boolean = true
  isInPlayAni: boolean = false
  nodePos: Vec3 = new Vec3()

  onLoad() {
    // 设置各种事件监听
    this.setListener()
    this.lastTouchPos = new Vec2(-1, -1)
    this.isCanMove = true
    this.isInPlayAni = false
  }

  setController(controller: GameController) {
    this.controller = controller
  }

  initWithCellModels(cellsModels: CellModel[][]) {
    this.cellViews = []
    for (let i = 1; i <= GRID_WIDTH; i++) {
      this.cellViews[i] = []
      for (let j = 1; j <= GRID_HEIGHT; j++) {
        const type = cellsModels[i][j].type

        const aniView: Node = instantiate(this.aniPre[type])

        // aniView.parent = this.node
        this.node.addChild(aniView)

        const cellViewScript = aniView.getComponent('CellView')
        // 设置单元格的位置和动画
        ;(cellViewScript as CellView).initWithModel(cellsModels[i][j])

        this.cellViews[i][j] = aniView
      }
    }
  }

  // 设置监听事件
  setListener() {
    // 点击事件逻辑
    this.node.on(
      Node.EventType.TOUCH_START,
      function (event: EventTouch) {
        // 动画播放中,不允许点击
        if (this.isInPlayAni) {
          return true
        }
        const touchPos = event.getUILocation()
        // 将点击的位置转换为单元格的坐标位置
        const cellPos = this.convertTouchPosToCell(touchPos)

        if (cellPos) {
          const changeModels = this.selectCell(cellPos)
          // this.isCanMove = changeModels.length < 3
        } else {
          this.isCanMove = false
        }
        return true
      },
      this
    )
    // 滑动操作逻辑
    this.node.on(Node.EventType.TOUCH_MOVE, function () {}, this)

    this.node.on(
      Node.EventType.TOUCH_CANCEL,
      function (event: EventTouch) {
        // console.log("touchCancell");
      },
      this
    )
  }

  // 根据点击的像素位置，转换成网格中的位置
  convertTouchPosToCell(pos: Vec2) {
    // 获取点击层的世界坐标
    this.node.getWorldPosition(this.nodePos)

    const uiPos = new Vec2()
    uiPos.x = pos.x - this.nodePos.x
    uiPos.y = pos.y - this.nodePos.y

    // 判断是否出了边界
    if (uiPos.x < 0 || uiPos.x >= GRID_PIXEL_WIDTH || uiPos.y < 0 || uiPos.y >= GRID_PIXEL_HEIGHT) {
      return false
    }
    const x = Math.floor(uiPos.x / CELL_WIDTH) + 1
    const y = Math.floor(uiPos.y / CELL_HEIGHT) + 1
    return new Vec2(x, y)
  }
  // 动画的最长时间
  getPlayAniTime(changeModels: CellModel[]) {
    if (!changeModels) return 0
    let maxTime = 0
    changeModels.forEach(function (ele) {
      ele.cmd.forEach(function (cmd) {
        if (maxTime < cmd.playTime + cmd.keepTime) {
          maxTime = cmd.playTime + cmd.keepTime
        }
      }, this)
    }, this)
  }

  // 动画的最长阶段
  getStep(efectsQueue) {
    if (!efectsQueue) return 0
    return efectsQueue.reduce(function (maxVal, effectCmd) {
      return Math.max(maxVal, effectCmd.step || 0)
    }, 0)
  }

  // 正常击中格子后的操作
  // 格子的坐标 cellPos
  selectCell(cellPos: Vec2) {
    // changeModels 改变的单元格，efectsQueue 效果队列，不消除的时候为undefined
    const [changeModels, efectsQueue] = this.controller.selectCell(cellPos)
    // 播放爆炸效果，当不能消时，不执行
    this.playEffect(efectsQueue)
    // 动画期间禁止操作，之后播放相应step的音乐
    this.disableTouch(this.getPlayAniTime(changeModels), this.getStep(efectsQueue))

    // 移动格子
    this.updateView(changeModels)
    this.controller.cleanCmd()

    if (changeModels.length >= 2) {
      this.updateSelect(new Vec2(-1, -1))
      this.audioUtils.playSwap()
    } else {
      this.updateSelect(cellPos)
      this.audioUtils.playClick()
    }
    return changeModels
  }

  // 取消其他各格子背景，显示选中的格子背景，并播放动画
  updateSelect(pos: Vec2) {
    for (var i = 1; i <= GRID_WIDTH; i++) {
      for (var j = 1; j <= GRID_HEIGHT; j++) {
        if (this.cellViews[i][j]) {
          var cellScript: CellView = this.cellViews[i][j].getComponent('CellView') as CellView
          if (pos.x === j && pos.y === i) {
            cellScript.setSelect(true)
          } else {
            cellScript.setSelect(false)
          }
        }
      }
    }
  }

  // 移动格子
  updateView(changeModels: CellModel[]) {
    let newCellViewInfo = []
    for (let i = 0; i < changeModels.length; i++) {
      const model = changeModels[i]
      // 通过model 映射  view
      const viewInfo = this.findiewByModel(model)
      let view: Node = null
      // 如果原来的cell不存在，则新建 view
      if (!viewInfo) {
        const type = model.type
        const aniView: Node = instantiate(this.aniPre[type])
        this.node.addChild(aniView)
        var cellViewScript = aniView.getComponent('CellView')
        ;(cellViewScript as CellView).initWithModel(model)
        view = aniView
      } else {
        // 如果已经存在
        view = viewInfo.view
        this.cellViews[viewInfo.y][viewInfo.x] = null
      }
      const cellScript = view.getComponent('CellView')
      ;(cellScript as CellView).updateView() // 执行移动操作
      if (!model.isDeath) {
        newCellViewInfo.push({
          model,
          view
        })
      }
    }
    // 重新标记this.cellviews的信息
    newCellViewInfo.forEach(function (ele) {
      let model = ele.model
      this.cellViews[model.y][model.x] = ele.view
    }, this)
  }
  /**
   * 根据cell的model返回对应的view
   * @param model
   *
   */
  findiewByModel(model: CellModel) {
    for (var i = 1; i <= GRID_WIDTH; i++) {
      for (var j = 1; j <= GRID_HEIGHT; j++) {
        const cellView: Node = this.cellViews[i][i]
        const cellViewScript: Component = cellView.getComponent('CellView')
        if (cellView && (cellViewScript as CellView).model == model) {
          return { view: this.cellViews[i][j], x: j, y: i }
        }
      }
    }
    return null
  }

  playEffect(efectsQueue) {
    this.effectLayer.playEffects(efectsQueue)
  }

  // 一段时间禁止操作，时间过后播放音乐
  disableTouch(time: number, step: number) {
    if (time < 0) return
    this.isInPlayAni = true
    this.scheduleOnce(function () {
      this.isInPlayAni = false
      this.audioUtils.playContinuousMatch(step)
    }, time)
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
