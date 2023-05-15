import { Game } from "./Game";
import { SquareGroup } from "./SquareGroup";

export interface Point {
  readonly x: number;
  readonly y: number;
}

export interface IViewer {
  /**
   * 显示
   */
  show: () => void;
  /**
   * 移除
   */
  remove: () => void;
}

/**
 * 形状
 */
export type Shape = Point[];

/**
 * 移动方向
 */
export enum MoveDirection {
  left,
  right,
  bottom,
}

/**
 * 游戏状态
 */
export enum GameStatus {
  init, // 未开始
  playing, // 进行中
  pause, // 暂停
  over, // 已结束
}

export interface GameViewer {
  /**
   *
   * @param tetris 下一个方块对象
   */
  showNext(tetris: SquareGroup): void;
  /**
   *
   * @param tetris 切换的方块对象
   */
  switch(tetris: SquareGroup): void;

  /**
   * 完成界面的初始化
   */
  init(game: Game): void;

  /**
   * 显示分数
   */
  showScore(score: number): void;

  onGamePause(): void;

  onGameStart(): void;

  onGameOver(): void;
}
