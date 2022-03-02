import { Vec2 } from 'cc'
import CellModel from './CellModel'
import { mergePointArray, exclusivePoint } from '../Utils/ModelUtils'
import { CELL_BASENUM, CELL_STATUS, GRID_HEIGHT, GRID_WIDTH, CELL_TYPE, ANITIME } from './ConstValue'
import { EFECT_TYPE } from '../Types/index'

type CELL_STATUS_TYPE = [Vec2[], CELL_STATUS, CELL_TYPE | null, Vec2]

export default class GameModel {
  cells: CellModel[][] = []
  cellBgs = null
  lastPos: Vec2 = new Vec2(-1, -1)
  // 种类数量
  cellTypeNum = 5
  // 升级种类只在这个数组里查找
  cellCreateType: number[] = []

  changeModels: CellModel[] = []

  efectsQueue: EFECT_TYPE[] = []
  // 播放节点
  curTime: number = 0

  // 初始化单元格数据，并且mock的数据不存在连续3个及以上的情况
  init(cellTypeNum: number) {
    this.cells = []
    this.setCellTypeNum(cellTypeNum || this.cellTypeNum)
    for (let i = 1; i <= GRID_WIDTH; i++) {
      this.cells[i] = []
      for (let j = 1; j <= GRID_HEIGHT; j++) {
        this.cells[i][j] = new CellModel()
      }
    }

    // mock
    for (let i = 1; i <= GRID_WIDTH; i++) {
      for (let j = 1; j <= GRID_HEIGHT; j++) {
        // 如果已经初始化则跳过
        if (this.cells[i][j].type !== null) {
          continue
        }

        let flag: boolean = true
        while (flag) {
          flag = false
          // 初始化类型
          this.cells[i][j].init(this.getRandomCellType())

          let result = this.checkPoint(j, i)[0]
          // 保证初始化的单元格没有连续3个的情况
          if (result.length > 2) {
            flag = true
          }

          // 设置坐标单元格
          this.cells[i][j].setXY(j, i)
          this.cells[i][j].setStartXY(j, i)
        }
      }
    }
  }

  getCells() {
    return this.cells
  }
  // pos  格子坐标，哪些格子需要改变，及动画
  selectCell(pos: Vec2): [CellModel[], EFECT_TYPE[]] {
    this.changeModels = [] // 发生改变的model，将作为返回值，给view播动画
    this.efectsQueue = [] // 动物消失。爆炸等特效
    const lastPos = this.lastPos
    // 是否是相临的格子
    let delta = Math.abs(pos.x - lastPos.x) + Math.abs(pos.y - lastPos.y)
    if (delta != 1) {
      // 非相邻格子，直接返回
      this.lastPos = pos
      return [[], []]
    }
    // 当前格子
    let curClickCell = this.cells[pos.y][pos.x]
    // 相邻格子
    let lastClickCell = this.cells[lastPos.y][lastPos.x]
    // 交换格子在数组中的位置和坐标
    this.exchangeCell(lastPos, pos)
    // 检测当前点状态
    let result1 = this.checkPoint(pos.x, pos.y)[0]
    // 检测相邻点状态
    let result2 = this.checkPoint(lastPos.x, lastPos.y)[0]

    this.curTime = 0
    // 去重添加到队列
    this.pushToChangeModels(curClickCell)
    this.pushToChangeModels(lastClickCell)

    // 判断两个是否是特殊的动物(鸟)
    let isCanBomb = (curClickCell.status !== CELL_STATUS.COMMON && lastClickCell.status !== CELL_STATUS.COMMON) || curClickCell.status === CELL_STATUS.BIRD || lastClickCell.status === CELL_STATUS.BIRD

    // 如果不是鸟并且没有连续3个以上，不消除
    if (result1.length < 3 && result2.length < 3 && !isCanBomb) {
      // 不会发生消除的情况
      this.exchangeCell(lastPos, pos)
      // 到目标位置后再返回原来的位置
      curClickCell.moveToAndBack(lastPos)
      lastClickCell.moveToAndBack(pos)

      this.lastPos = new Vec2(-1, -1)
      // 返回添加的单元格
      return [this.changeModels, []]
    } else {
      //  爆炸，或者是连续3个以上
      this.lastPos = new Vec2(-1, -1)
      // 移动位置
      curClickCell.moveTo(lastPos, this.curTime)
      lastClickCell.moveTo(pos, this.curTime)

      let checkPoint = [pos, lastPos]
      this.curTime += ANITIME.TOUCH_MOVE
      // 消除
      this.processCrush(checkPoint)
      return [this.changeModels, this.efectsQueue]
    }
  }

  // 消除
  processCrush(checkPoint: Vec2[]) {
    let cycleCount: number = 0
    // 消除后，继续判断并消除
    while (checkPoint.length > 0) {
      let bombModels: CellModel[] = []
      //  特殊消除
      if (cycleCount === 0 && checkPoint.length === 2) {
        //特殊消除
        let pos1 = checkPoint[0]
        let pos2 = checkPoint[1]
        // 最新model
        let model1: CellModel = this.cells[pos1.y][pos1.x]
        let model2: CellModel = this.cells[pos2.y][pos2.x]
        if (model1.status === CELL_STATUS.BIRD || model2.status === CELL_STATUS.BIRD) {
          if (model1.status === CELL_STATUS.BIRD) {
            model1.type = model2.type
            bombModels.push(model1)
          } else {
            model2.type = model1.type
            bombModels.push(model2)
          }
        }
      }

      for (const i in checkPoint) {
        const pos = checkPoint[i]
        if (!this.cells[pos.y][pos.x]) continue
        // 当前点可以消除的点
        const [result, newCellStatus, newCellType, crushPoint] = this.checkPoint(pos.x, pos.y, false)

        if (result.length < 3) {
          continue
        }
        for (const j in result) {
          const model: CellModel = this.cells[result[j].y][result[j].x]
          // 销毁Cell，并且添加销毁动作
          this.crushCell(result[j].x, result[j].y, false, cycleCount)
          if (model.status !== CELL_STATUS.COMMON) {
            // 如果消除的表格具有bomb类型表格
            bombModels.push(model)
          }
        }
        // 触发消除的节点位置创建新的Cell（三个的时候不需要创建，但现在创建啦）
        this.createNewCell(crushPoint, newCellStatus, newCellType)
      }
      // 执行爆炸效果
      // this.processBomb(bombModels, cycleCount)
      this.curTime += ANITIME.DIE
      // 创建新的cell并且下落
      checkPoint = this.down()
      cycleCount++
    }
  }
  // 生成新的cell
  /**
   *
   * @param pos 新表格的位置
   * @param status 表格的status
   * @param type 表格的类型
   */
  createNewCell(pos: Vec2, status: CELL_STATUS, type: number) {
    if (status === CELL_STATUS.COMMON) {
      return
    }
    if (status === CELL_STATUS.BIRD) {
      type = CELL_TYPE.BIRD
    }
    let model = new CellModel()
    this.cells[pos.y][pos.x] = model
    model.init(type)
    model.setStartXY(pos.x, pos.y)
    model.setXY(pos.x, pos.y)
    model.setStatus(status)
    model.setVisible(0, false)
    model.setVisible(this.curTime, true)
    this.changeModels.push(model)
  }
  // TODO bombModels去重
  /**
   *
   * @param bombModels 爆炸的效果
   * @param cycleCount 第几轮
   */
  processBomb(bombModels: CellModel[], cycleCount: number) {
    debugger
    console.log('执行消除')
    while (bombModels.length > 0) {
      let newBombModel = []
      let bombTime = ANITIME.BOMB_DELAY
      bombModels.forEach(function (model) {
        if (model.status === CELL_STATUS.LINE) {
          // 某一行  COMMON 的 cellMod 销毁
          for (let i = 1; i <= GRID_WIDTH; i++) {
            const curCells = this.cells[model.y][i]
            if (curCells && curCells.status !== CELL_STATUS.COMMON) {
              newBombModel.push(curCells)
            }
            this.crushCell(i, model.y, false, cycleCount)
          }
          this.addRowBomb(this.curTime, new Vec2(model.x, model.y))
        } else if (model.status === CELL_STATUS.COLUMN) {
          for (let i = 1; i <= GRID_HEIGHT; i++) {
            if (this.cells[i][model.x]) {
              if (this.cells[i][model.x].status != CELL_STATUS.COMMON) {
                newBombModel.push(this.cells[i][model.x])
              }
              this.crushCell(model.x, i, false, cycleCount)
            }
          }
          this.addColBomb(this.curTime, new Vec2(model.x, model.y))
        } else if (model.status === CELL_STATUS.WRAP) {
          let x = model.x
          let y = model.y
          for (let i = 1; i <= GRID_HEIGHT; i++) {
            for (let j = 1; j <= GRID_WIDTH; j++) {
              const delta = Math.abs(x - j) + Math.abs(y - i)
              if (this.cells[i][j].status !== CELL_STATUS.COMMON) {
                newBombModel.push(this.cells[i][j])
              }
              this.crushCell(j, i, false, cycleCount)
            }
          }
        } else if (model.status === CELL_STATUS.BIRD) {
          let crushType = model.type
          if (bombTime < ANITIME.BOMB_BIRD_DELAY) {
            bombTime = ANITIME.BOMB_BIRD_DELAY
          }
          if (crushType === CELL_TYPE.BIRD) {
            crushType = this.getRandomCellType()
          }

          for (let i = 1; i <= GRID_HEIGHT; i++) {
            for (let j = 1; j < GRID_WIDTH; j++) {
              const curCell = this.cells[i][j]
              if (curCell && curCell.type === crushType) {
                newBombModel.push(this.cells[i][j])
              }
              this.crushCell(j, i, true, cycleCount)
            }
          }
        }
      }, this)
      if (bombModels.length > 0) {
        this.curTime += bombTime
      }
      bombModels = newBombModel
    }
  }
  // 创建新的cell并且下落
  down() {
    console.log('下落')

    let newCheckPoint = []
    for (let i = 1; i <= GRID_WIDTH; i++) {
      for (let j = 1; j < GRID_HEIGHT; j++) {
        // 循环，如果某一个cell为null
        if (this.cells[i][j] === null) {
          let curRow = i
          for (let k = curRow; k <= GRID_HEIGHT; k++) {
            if (this.cells[k][j]) {
              this.pushToChangeModels(this.cells[k][j])
              newCheckPoint.push(this.cells[k][j])
              this.cells[curRow][j] = this.cells[k][j]
              this.cells[k][j] = null
              this.cells[curRow][j].setXY(j, curRow)
              this.cells[curRow][j].moveTo(new Vec2(j, curRow), this.curTime)
              curRow++
            }
          }

          let count = 1
          for (var k = curRow; k <= GRID_HEIGHT; k++) {
            this.cells[k][j] = new CellModel()
            this.cells[k][j].init(this.getRandomCellType())
            this.cells[k][j].setStartXY(j, count + GRID_HEIGHT)
            this.cells[k][j].setXY(j, count + GRID_HEIGHT)
            this.cells[k][j].moveTo(new Vec2(j, k), this.curTime)
            count++
            this.changeModels.push(this.cells[k][j])
            newCheckPoint.push(this.cells[k][j])
          }
        }
      }
    }
    this.curTime += ANITIME.TOUCH_MOVE + 0.3
    return newCheckPoint
  }
  // 销毁Cell
  crushCell(x: number, y: number, needShake: boolean, step: number) {
    let model = this.cells[y][x]
    this.pushToChangeModels(model)
    if (needShake) {
      // shake 动画
      model.toShake(this.curTime)
    }
    let shakeTime = needShake ? ANITIME.DIE_SHAKE : 0
    // 添加死忙动画
    model.toDie(this.curTime + shakeTime)
    // 销毁效果
    this.addCrushEffect(this.curTime + shakeTime, new Vec2(model.x, model.y), step)
    this.cells[y][x] = null
  }

  exchangeCell(pos1: Vec2, pos2: Vec2) {
    let tmpModel = this.cells[pos1.y][pos1.x]
    this.cells[pos1.y][pos1.x] = this.cells[pos2.y][pos2.x]
    this.cells[pos1.y][pos1.x].x = pos1.x
    this.cells[pos1.y][pos1.x].y = pos1.y

    this.cells[pos2.y][pos2.x] = tmpModel
    this.cells[pos2.y][pos2.x].x = pos2.x
    this.cells[pos2.y][pos2.x].y = pos2.y
  }

  setCellTypeNum(cellTypeNum: number) {
    this.cellTypeNum = cellTypeNum
    this.cellCreateType = []
    const createTypeList: number[] = this.cellCreateType
    for (let i = 1; i <= CELL_BASENUM; i++) {
      createTypeList.push(i)
    }
    for (let i = 0; i < this.cellCreateType.length; i++) {
      // 随机索引
      let index = Math.floor(Math.random() * (CELL_BASENUM - i)) + i

      ;[createTypeList[i], createTypeList[index]] = [createTypeList[index], createTypeList[i]]
    }
  }

  getRandomCellType() {
    const index = Math.floor(Math.random() * this.cellTypeNum)
    return this.cellCreateType[index]
  }
  // x,y 为单元格的坐标
  /**
   *
   * @param x 单元格的X轴坐标
   * @param y 单元格的Y轴坐标
   * @param recursive //
   * @returns [相同点数组，状态，当前点，当前点坐标]
   */

  checkPoint(x: number, y: number, recursive?: boolean) {
    // 当前节点 水平方向 相连的cell队列
    let rowResult: Vec2[] = this.checkWithDirection(x, y, [new Vec2(1, 0), new Vec2(-1, 0)])
    // 当前节点 竖直方向 项链的cell队列
    let colResult: Vec2[] = this.checkWithDirection(x, y, [new Vec2(0, -1), new Vec2(0, 1)])

    let samePoints: Vec2[] = []
    let newCellStatus: CELL_STATUS = CELL_STATUS.COMMON
    // 如果 水平方向 或 竖直方向 相连的cell大于5个
    if (rowResult.length >= 5 || colResult.length >= 5) {
      newCellStatus = CELL_STATUS.BIRD
    } else if (rowResult.length >= 3 && colResult.length >= 3) {
      // 如果 某一方向大于 3个 状态为 wrap
      newCellStatus = CELL_STATUS.WRAP
    } else if (rowResult.length >= 4) {
      // 如果 水平方向大于等于4 为 行状态
      newCellStatus = CELL_STATUS.LINE
    } else if (colResult.length >= 4) {
      // 如果 竖直方向大于等于4 为 列状态
      newCellStatus = CELL_STATUS.COLUMN
    }

    if (rowResult.length >= 3) {
      // 水平方向个数大于等于3个
      samePoints = rowResult
    }

    if (colResult.length >= 3) {
      samePoints = mergePointArray(samePoints, colResult)
    }
    // 相同cell数组，cell 状态，当前cell，坐标
    let result: CELL_STATUS_TYPE = [samePoints, newCellStatus, this.cells[y][x].type, new Vec2(x, y)]

    // 检查下消除的其他节点，能不能生成更大范围的消除
    if (recursive && result.length >= 3) {
      // samePoints 中的其他节点
      let subCheckPoints = exclusivePoint(samePoints, new Vec2(x, y))
      for (const point of subCheckPoints) {
        let subResult = this.checkPoint(point.x, point.y, false)
        // ????  subResult[1] > result[1]
        if (subResult[1] > result[1] || (subResult[1] === result[1] && subResult[0].length > result[0].length)) {
          result = subResult
        }
      }
    }
    return result
  }

  pushToChangeModels(model: CellModel) {
    if (this.changeModels.indexOf(model) != -1) {
      return
    }
    this.changeModels.push(model)
  }

  // 某一方向上相连相同type的cell入队列
  checkWithDirection(x: number, y: number, direction: Vec2[]): Vec2[] {
    let queue = []
    let vis = []
    vis[x + y * GRID_HEIGHT] = true
    queue.push(new Vec2(x, y))
    let front = 0
    while (front < queue.length) {
      let point = queue[front]
      let cellModel = this.cells[point.y][point.x]
      front++
      if (!cellModel) {
        continue
      }
      for (let i = 0; i < direction.length; i++) {
        let tmpX = point.x + direction[i].x
        let tmpY = point.y + direction[i].y
        // tmpX < 1 当前cell在最左边
        // tmpX > GRID_WIDTH 当前cell位置在最右边
        // tmpY < 1 当前cell在最下边
        // tmY > GRID_HEIGHT 当前Cell 在最顶部
        // this.cells[tmpY][tmpX] 不存在
        // vis[tmpX + tmpY * GRID_HEIGHT] 已判断相同类型

        if (tmpX < 1 || tmpX > GRID_WIDTH || tmpY < 1 || tmpY > GRID_HEIGHT || vis[tmpX + tmpY * GRID_HEIGHT] || !this.cells[tmpY][tmpX]) {
          continue
        }
        if (cellModel.type === this.cells[tmpY][tmpX].type) {
          vis[tmpX + tmpY * GRID_HEIGHT] = true
          queue.push(new Vec2(tmpX, tmpY))
        }
      }
    }
    return queue
  }

  cleanCmd() {
    for (var i = 1; i <= GRID_WIDTH; i++) {
      for (var j = 1; j <= GRID_HEIGHT; j++) {
        if (this.cells[i][j]) {
          this.cells[i][j].cmd = []
        }
      }
    }
  }
  /**
   *
   * @param {开始播放的时间} playTime
   * @param {Cell的位置} pos
   * @param {第几次消除，用于播放音效} step
   */
  addCrushEffect(playTime: number, pos: Vec2, step: number) {
    this.efectsQueue.push({
      playTime,
      pos,
      action: 'crush',
      step
    })
  }

  addRowBomb(playTime: number, pos: Vec2) {
    this.efectsQueue.push({
      playTime,
      pos,
      action: 'rowBomb'
    })
  }

  addColBomb(playTime: number, pos: Vec2) {
    this.efectsQueue.push({
      playTime,
      pos,
      action: 'colBomb'
    })
  }

  addWrapBomb() {}
}
