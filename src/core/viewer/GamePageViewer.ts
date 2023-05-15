import { Game } from '../Game'
import GameConfig from '../GameConfig'
import { SquareGroup } from '../SquareGroup'
import { GameStatus, GameViewer } from '../types'
import PageConfig from './PageConfig'
import { SquarePageViewer } from './SquarePageViewer'
import $ from 'jquery'

export class GamePageViewer implements GameViewer {
  private nextDom = $('#next')
  private panelDom = $('#panel')
  private scoreDom = $('#score')
  private msgDom = $('#msg')
  onGamePause(): void {
    this.msgDom.css({
      display: 'flex',
    })
    this.msgDom.find('p').html('游戏暂停')
  }
  onGameStart(): void {
    this.msgDom.hide()
  }
  onGameOver(): void {
    this.msgDom.css({
      display: 'flex',
    })
    this.msgDom.find('p').html('游戏结束')
  }
  init(game: Game): void {
    // 设置宽高
    this.panelDom.css({
      width: GameConfig.panelSize.width * PageConfig.SquareSize.width,
      height: GameConfig.panelSize.height * PageConfig.SquareSize.height,
    })
    this.nextDom.css({
      width: GameConfig.nextSize.width * PageConfig.SquareSize.width,
      height: GameConfig.nextSize.height * PageConfig.SquareSize.height,
    })

    $(document).on('keydown', e => {
      // console.log(e.key);
      if (e.key === 'a' || e.key === 'ArrowLeft') {
        game.control_left()
      }
      if (e.key === 'd' || e.key === 'ArrowRight') {
        game.control_right()
      }
      if (e.key === 'w' || e.key === 'ArrowUp') {
        game.controlRotate()
      }
      if (e.key === 's' || e.key === 'ArrowDown') {
        game.control_bottom()
      }
      if (e.key === ' ') {
        if (game.gameStatus === GameStatus.playing) {
          game.pause()
        } else {
          game.start()
        }
      }
    })
  }
  showNext(tetris: SquareGroup): void {
    tetris.squares.forEach(square => {
      square.viewer = new SquarePageViewer(square, $('#next')[0])
    })
  }
  switch(tetris: SquareGroup): void {
    tetris.squares.forEach(square => {
      square.viewer?.remove()
      square.viewer = new SquarePageViewer(square, $('#panel')[0])
    })
  }
  showScore(score: number): void {
    this.scoreDom.html(score.toString())
  }
}
