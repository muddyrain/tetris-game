import GameConfig from './GameConfig'
import { Square } from './Square'
import { SquareGroup } from './SquareGroup'
import { createTetris } from './Tetris'
import { TetrisRule } from './TetrisRule'
import { GameStatus, GameViewer, MoveDirection } from './types'

export class Game {
  // 游戏状态
  private _gameStatus: GameStatus = GameStatus.init
  public get gameStatus() {
    return this._gameStatus
  }
  // 当前玩家操作的方块
  private _curTetris?: SquareGroup
  // 下一个方块
  private _nextTetris: SquareGroup = createTetris({ x: 0, y: 0 })
  // 计时器
  private _timer?: NodeJS.Timer
  // 自动下落的间隔时间
  private _duration: number = 1500
  // 当前游戏中已存在的方块
  private _exists: Square[] = []
  // 积分
  private _score: number = 0
  public get score() {
    return this._score
  }
  public set score(val) {
    this._score = val
    this._viewer.showScore(val)
    const level = GameConfig.levels.find(it => it.score < val)
    if (level?.duration === this._duration) {
      return
    }
    this._duration = level?.duration || this._duration
    if (this._timer) {
      clearInterval(this._timer)
      this._timer = undefined
      this.autoDrop()
    }
  }

  constructor(private _viewer: GameViewer) {
    this.createNext()
    this._viewer.init(this)
    this._viewer.showScore(this.score)
  }
  private createNext() {
    this._nextTetris = createTetris({ x: 0, y: 0 })
    this.resetCenterPoint(GameConfig.nextSize.width, this._nextTetris)
    this._viewer.showNext(this._nextTetris)
  }
  private init() {
    this._exists.forEach(eq => {
      eq.viewer?.remove()
    })
    this._exists = []
    this.createNext()
    this._curTetris = undefined
    this._score = 0
    this._viewer.showScore(this._score)
  }
  /**
   * 游戏开始
   */
  start() {
    // 游戏状态的改变
    if (this._gameStatus === GameStatus.playing) {
      return
    }
    // 从游戏结束到开始
    if (this._gameStatus === GameStatus.over) {
      this.init()
    }
    this._gameStatus = GameStatus.playing
    if (!this._curTetris) {
      // 给当前玩家操作的方块赋值
      this.switchTetris()
    }
    this.autoDrop()
    this._viewer.onGameStart()
  }
  /**
   * 游戏暂停
   */
  pause() {
    if (this._gameStatus === GameStatus.playing) {
      this._gameStatus = GameStatus.pause
      clearInterval(this._timer)
      this._timer = undefined
      this._viewer.onGamePause()
    }
  }

  control_left() {
    if (this._curTetris && this._gameStatus === GameStatus.playing) {
      TetrisRule.move(this._curTetris, MoveDirection.left, this._exists)
    }
  }
  control_right() {
    if (this._curTetris && this._gameStatus === GameStatus.playing) {
      TetrisRule.move(this._curTetris, MoveDirection.right, this._exists)
    }
  }
  controlRotate() {
    if (this._curTetris && this._gameStatus === GameStatus.playing) {
      TetrisRule.rotate(this._curTetris, this._exists)
    }
  }
  control_bottom() {
    if (this._curTetris && this._gameStatus === GameStatus.playing) {
      TetrisRule.moveDirectly(
        this._curTetris,
        MoveDirection.bottom,
        this._exists
      )
      this.hitDown()
    }
  }

  /**
   * 控制方块自由下落
   */
  private autoDrop() {
    if (this._timer || this._gameStatus !== GameStatus.playing) return
    this._timer = setInterval(() => {
      if (this._curTetris) {
        if (
          !TetrisRule.move(this._curTetris, MoveDirection.bottom, this._exists)
        ) {
          // 触底
          this.hitDown()
        }
      }
    }, this._duration)
  }
  /**
   * 切换方块
   */
  private switchTetris() {
    this._curTetris = this._nextTetris
    this._curTetris.squares.forEach(sq => {
      if (sq.viewer) {
        sq.viewer.remove()
      }
    })
    this.resetCenterPoint(GameConfig.panelSize.width, this._curTetris)

    if (
      !TetrisRule.canIMove(
        this._curTetris.shape,
        this._curTetris.centerPoint,
        this._exists
      )
    ) {
      // 游戏结束
      this._gameStatus = GameStatus.over
      clearInterval(this._timer)
      this._timer = undefined
      this._viewer.onGameOver()
      return
    }
    this.createNext()
    this._viewer.switch(this._curTetris)
  }
  /**
   * 设置中心点坐标，
   * @param width
   * @param tetris
   */
  private resetCenterPoint(width: number, tetris: SquareGroup) {
    const x = Math.ceil(width / 2) - 1
    const y = 0
    tetris.centerPoint = { x, y }
    while (tetris.squares.some(it => it.point.y < 0)) {
      tetris.centerPoint = {
        x: tetris.centerPoint.x,
        y: tetris.centerPoint.y + 1,
      }
    }
  }
  /**
   * 触底之后的操作
   */
  hitDown() {
    //将当前的俄罗斯方块包含的小方块，加入到已存在的方块数组中。
    this._exists = this._exists.concat(this._curTetris!.squares)
    // 处理移除
    const num = TetrisRule.deleteSquares(this._exists)
    // 增加积分
    this.addScore(num)
    this.switchTetris()
  }
  private addScore(lineNum: number) {
    if (lineNum === 0) {
      return
    } else if (lineNum === 1) {
      this.score += 10
    } else if (lineNum === 2) {
      this.score += 25
    } else if (lineNum === 3) {
      this.score += 50
    } else {
      this.score += 100
    }
    this._viewer.showScore(this.score)
  }
}
