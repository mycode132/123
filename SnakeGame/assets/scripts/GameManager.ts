const { ccclass, property } = cc._decorator;

import SnakeController, { Direction } from './SnakeController';
import FoodSpawner from './FoodSpawner';
import ObstacleManager from './ObstacleManager';
import LevelConfig, { LevelData, CELL_SIZE } from './GameConfig';

export enum GameState {
    READY, PLAYING, PAUSED, GAME_OVER, LEVEL_CLEAR
}

@ccclass
export default class GameManager extends cc.Component {
    @property(SnakeController)
    snake: SnakeController = null;

    @property(FoodSpawner)
    foodSpawner: FoodSpawner = null;

    @property(ObstacleManager)
    obstacleMgr: ObstacleManager = null;

    @property(cc.Label)
    scoreLabel: cc.Label = null;

    @property(cc.Node)
    gameOverPanel: cc.Node = null;

    @property(cc.Node)
    levelClearPanel: cc.Node = null;

    private _state: GameState = GameState.READY;
    private _currentLevel: LevelData = null;
    private _score: number = 0;
    private _moveTimer: number = 0;
    private _gridWidth: number = 15;
    private _gridHeight: number = 15;
    private _cellSize: number = CELL_SIZE;

    public get state(): GameState { return this._state; }
    public get score(): number { return this._score; }
    public get currentLevel(): LevelData { return this._currentLevel; }

    protected onLoad() {
        // 从本地存储读取要加载的关卡
        const levelIdStr = cc.sys.localStorage.getItem('selectedLevel');
        const levelId = levelIdStr ? parseInt(levelIdStr) : 1;
        this.startLevel(levelId);
    }

    // 从外部调用，初始化关卡
    startLevel(levelId: number) {
        const level = LevelConfig.find(l => l.id === levelId);
        if (!level) return;

        this._currentLevel = level;
        this._score = 0;
        this._gridWidth = level.gridWidth;
        this._gridHeight = level.gridHeight;
        this._moveTimer = 0;
        this._state = GameState.READY;

        // 清理
        this.snake.reset();
        this.foodSpawner.removeFood();
        this.obstacleMgr.clear();

        // 初始化各模块
        this.snake.init(
            this.gridToWorld(2, Math.floor(this._gridHeight / 2)).x,
            this.gridToWorld(2, Math.floor(this._gridHeight / 2)).y,
            this._cellSize
        );

        this.foodSpawner.init(this._cellSize);
        this.obstacleMgr.init(this._cellSize);

        // 创建墙壁
        this.obstacleMgr.createWalls(this._gridWidth, this._gridHeight);

        // 放置障碍物
        this.obstacleMgr.placeObstacles(level.obstacles);

        // 生成第一个食物
        this.spawnFood();

        // 隐藏面板
        if (this.gameOverPanel) this.gameOverPanel.active = false;
        if (this.levelClearPanel) this.levelClearPanel.active = false;

        // 更新UI
        this.updateScoreUI();

        this._state = GameState.PLAYING;
    }

    startGame() {
        if (this._state === GameState.READY) {
            this._state = GameState.PLAYING;
        }
    }

    pauseGame() {
        if (this._state === GameState.PLAYING) {
            this._state = GameState.PAUSED;
        } else if (this._state === GameState.PAUSED) {
            this._state = GameState.PLAYING;
        }
    }

    restartLevel() {
        if (this._currentLevel) {
            this.startLevel(this._currentLevel.id);
        }
    }

    nextLevel() {
        if (this._currentLevel) {
            const nextId = this._currentLevel.id + 1;
            if (nextId <= LevelConfig.length) {
                // 解锁下一关
                const nextLevel = LevelConfig.find(l => l.id === nextId);
                if (nextLevel) nextLevel.unlocked = true;
                this.startLevel(nextId);
            } else {
                // 全部通关，回到选关
                cc.director.loadScene('LevelSelectScene');
            }
        }
    }

    goToLevelSelect() {
        cc.director.loadScene('LevelSelectScene');
    }

    protected update(dt: number) {
        if (this._state !== GameState.PLAYING) return;

        this._moveTimer += dt * 1000;
        if (this._moveTimer < this._currentLevel.speed) return;
        this._moveTimer = 0;

        // 移动蛇
        const result = this.snake.move();

        if (result.dead) {
            this.gameOver();
            return;
        }

        // 检查边界碰撞 (与墙壁)
        const headPos = this.snake.headPos;
        if (this.obstacleMgr.checkCollision(headPos)) {
            this.gameOver();
            return;
        }

        // 检查自身碰撞
        if (this.snake.checkSelfCollision()) {
            this.gameOver();
            return;
        }

        // 检查是否吃到食物
        if (result.ate || this.checkEatFood(headPos)) {
            this.snake.grow();
            this._score++;
            this.updateScoreUI();

            // 检查是否过关
            if (this._score >= this._currentLevel.targetScore) {
                this._state = GameState.LEVEL_CLEAR;
                if (this.levelClearPanel) this.levelClearPanel.active = true;
                return;
            }

            // 生成新食物
            this.spawnFood();
        }
    }

    private checkEatFood(headPos: cc.Vec2): boolean {
        const food = this.foodSpawner.foodNode;
        if (!food) return false;
        return headPos.equals(food.getPosition());
    }

    private spawnFood() {
        const occupied = [
            ...this.snake.getOccupiedPositions(),
            ...this.obstacleMgr.getObstaclePositions()
        ];
        this.foodSpawner.spawn(occupied, this._gridWidth, this._gridHeight);
    }

    private gameOver() {
        this._state = GameState.GAME_OVER;
        if (this.gameOverPanel) this.gameOverPanel.active = true;
    }

    private updateScoreUI() {
        if (this.scoreLabel) {
            this.scoreLabel.string = `分数: ${this._score} / ${this._currentLevel ? this._currentLevel.targetScore : 0}`;
        }
    }

    private gridToWorld(gx: number, gy: number): cc.Vec2 {
        const offset = this._cellSize / 2;
        return cc.v2(gx * this._cellSize + offset, gy * this._cellSize + offset);
    }
}