import { Square } from "./Square";
import { Point, Shape } from "./types";

export class SquareGroup {
  private _squares: readonly Square[];
  public get squares() {
    return this._squares;
  }
  public get shape() {
    return this._shape;
  }
  public get centerPoint(): Point {
    return this._centerPoint;
  }
  public set centerPoint(value: Point) {
    this._centerPoint = value;
    this.setSquarePoints();
  }
  constructor(
    private _shape: Shape,
    private _centerPoint: Point,
    private _color: string
  ) {
    // 设置小方块的数组
    const arr: Square[] = [];
    this._shape.forEach((p) => {
      const sq = new Square();
      sq.color = this._color;
      arr.push(sq);
    });
    this._squares = arr;
    this.setSquarePoints();
  }
  /**
   * 旋转方向是否为顺时针
   */
  protected isClock = true;
  afterRotateShape(): Shape {
    if (this.isClock) {
      return this._shape.map((p) => {
        return {
          x: -p.y,
          y: p.x,
        };
      });
    } else {
      return this._shape.map((p) => {
        return {
          x: p.y,
          y: -p.x,
        };
      });
    }
  }
  /**
   * 根据中心点，以及形状，设置每一个小方块的坐标
   */
  private setSquarePoints() {
    this._shape.forEach((p, i) => {
      this._squares[i].point = {
        x: this._centerPoint.x + p.x,
        y: this._centerPoint.y + p.y,
      };
    });
  }
  rotate() {
    const new_shape = this.afterRotateShape();
    this._shape = new_shape;
    this.setSquarePoints();
  }
}
