import { Vec2 } from 'cc'

/**
 * 减法
 * @param points
 * @param exclusivePoint
 */
export function exclusivePoint(points: Vec2[], exclusivePoint: Vec2) {
  let result = new Array<Vec2>()
  for (const point of points) {
    if (!point.equals(exclusivePoint)) {
      result.push(point)
    }
  }
  return result
}

/**
 * 合并,去掉水平和竖直方向 相同的cell
 */

export function mergePointArray(rowPoints: Vec2[], colPoints: Vec2[]) {
  let result = rowPoints.concat()
  colPoints = colPoints.filter(function (colEle) {
    let repeat = false
    result.forEach(function (rowEle) {
      if (colEle.equals(rowEle)) {
        repeat = true
      }
    }, this)
    return !repeat
  })
  result.push(...colPoints)
  return result
}
