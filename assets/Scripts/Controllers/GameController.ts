import { _decorator, Component, Node, Vec2 } from 'cc'
import CellModel from '../Model/CellModel'
const { ccclass, property } = _decorator
import GameModel from '../Model/GameModel'
import { ContainerView } from '../Views/ContainerView'
import { EFECT_TYPE } from '../Types/index'

// ajax
// var xhr = new XMLHttpRequest()
// fetch()
//

/**
 * Predefined variables
 * Name = GameController
 * DateTime = Fri Feb 18 2022 19:24:06 GMT+0800 (中国标准时间)
 * Author = tt-intl-web
 * FileBasename = GameController.ts
 * FileBasenameNoExtension = GameController
 * URL = db://assets/Scripts/Controllers/GameController.ts
 * ManualUrl = https://docs.cocos.com/creator/3.4/manual/zh/
 *
 */

@ccclass('GameController')
export class GameController extends Component {
  // [1]
  // dummy = '';
  gameMode: GameModel = null

  // [2]
  // @property
  // serializableDummy = 0;

  @property(ContainerView)
  containerView: ContainerView = null

  onLoad() {
    // @ts-ignore  页面加载完成后调用
    // pageLoad()

    // 初始化游戏数据模型
    this.gameMode = new GameModel()
    // 初始化4种类型，并且mock 9 * 9 且不存在 连续3个以上的单元格 数据
    this.gameMode.init(4)

    this.containerView.setController(this)
    // 初始化单元格视图，并且指定位置
    this.containerView.initWithCellModels(this.gameMode.getCells())

    // const instance = axios.create({
    //   baseURL: 'http://live-web-api.staging2.p1staff.com',
    //   timeout: 5000
    // })

    // instance({
    //   method: 'get',
    //   url: '/v2/campaigns/leaderboard-records',
    //   params: {}
    // })
  }

  selectCell(pos: Vec2): [CellModel[], EFECT_TYPE[]] {
    return this.gameMode.selectCell(pos)
  }

  cleanCmd() {
    this.gameMode.cleanCmd()
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
