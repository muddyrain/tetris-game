/**
 * 该类中提供一些列的函数，根据游戏规则判断各种情况
 */

import GameConfig from "./GameConfig";
import { Square } from "./Square";
import { SquareGroup } from "./SquareGroup";
import { MoveDirection, Point, Shape } from "./types";

/**
 * 判断该类型是不是 Point
 */
function isPoint(obj: any): obj is Point {
  return typeof obj.x !== "undefined";
}
/**
 * 判断该类型是不是 Point
 */
function isMoveDirection(obj: any): obj is MoveDirection {
  return typeof obj === "number";
}

export class TetrisRule {
  /**
   * 判断某个形状的方块，是否能够移动到目标位置
   */
  static canIMove(shape: Shape, targetPoint: Point, exists: Square[]): boolean {
    //假设，中心点已经移动到了目标位置，算出每个小方块的坐标
    const targetSquarePoints: Point[] = shape.map((it) => {
      return {
        x: it.x + targetPoint.x,
        y: it.y + targetPoint.y,
      };
    });
    //边界判断
    let result = targetSquarePoints.some((p) => {
      //是否超出了边界
      return (
        p.x < 0 ||
        p.x > GameConfig.panelSize.width - 1 ||
        p.y < 0 ||
        p.y > GameConfig.panelSize.height - 1
      );
    });
    if (result) {
      return false;
    }

    //判断是否与已有的方块有重叠
    result = targetSquarePoints.some((p) =>
      exists.some((sq) => sq.point.x === p.x && sq.point.y === p.y)
    );
    if (result) {
      return false;
    }
    return true;
  }
  /**
   * 控制移动
   */
  static move(
    tetris: SquareGroup,
    targetPointOrDirection: MoveDirection,
    exists: Square[]
  ): boolean;
  static move(
    tetris: SquareGroup,
    targetPointOrDirection: Point,
    exists: Square[]
  ): boolean;
  static move(
    tetris: SquareGroup,
    targetPointOrDirection: MoveDirection | Point,
    exists: Square[]
  ): boolean {
    if (isPoint(targetPointOrDirection)) {
      if (this.canIMove(tetris.shape, targetPointOrDirection, exists)) {
        tetris.centerPoint = targetPointOrDirection;
        return true;
      }
      return false;
    } else {
      const direction = targetPointOrDirection;
      let targetPoint: Point;
      if (direction === MoveDirection.bottom) {
        targetPoint = {
          x: tetris.centerPoint.x,
          y: tetris.centerPoint.y + 1,
        };
      } else if (direction === MoveDirection.left) {
        targetPoint = {
          x: tetris.centerPoint.x - 1,
          y: tetris.centerPoint.y,
        };
      } else {
        targetPoint = {
          x: tetris.centerPoint.x + 1,
          y: tetris.centerPoint.y,
        };
      }
      return this.move(tetris, targetPoint, exists);
    }
  }
  static moveDirectly(
    tetris: SquareGroup,
    direction: MoveDirection,
    exists: Square[]
  ) {
    while (this.move(tetris, direction, exists)) {}
  }
  static rotate(tetris: SquareGroup, exists: Square[]): boolean {
    // 得到旋转新的数据
    const newShape = tetris.afterRotateShape();
    if (this.canIMove(newShape, tetris.centerPoint, exists)) {
      tetris.rotate();
      return true;
    } else {
      return false;
    }
  }
  /**
   * 根据y坐标，得到所有y坐标为此值的方块
   * @param exists
   * @param y
   */
  private static getLineSquares(exists: Square[], y: number) {
    return exists.filter((it) => it.point.y === y);
  }

  /**
   * 从已存在的方块进行消除，并返回消除的行数
   * @param exists
   */
  static deleteSquares(exists: Square[]): number {
    // 1、获得y坐标数组
    const ys = exists.map((sq) => sq.point.y);
    // 2、获取最大和最小的坐标
    const maxY = Math.max(...ys);
    const minY = Math.min(...ys);
    // 3、循环判断每一行是否可以消除
    let num = 0;
    for (let y = minY; y <= maxY; y++) {
      if (this.deleteLine(exists, y)) {
        num++;
      }
    }
    return num;
  }

  /**
   * 消除一行
   * @param exists
   * @param y
   */
  private static deleteLine(exists: Square[], y: number): boolean {
    const squares = this.getLineSquares(exists, y);
    if (squares.length === GameConfig.panelSize.width) {
      // 这一行可以消除
      squares.forEach((sq) => {
        if (sq.viewer) {
          sq.viewer.remove();
        }
        const index = exists.indexOf(sq);
        exists.splice(index, 1);
      });
      exists
        .filter((sq) => sq.point.y < y)
        .forEach((sq) => {
          sq.point = {
            ...sq.point,
            y: sq.point.y + 1,
          };
        });
      return true;
    } else {
      return false;
    }
  }
}
