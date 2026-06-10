const { ccclass, property } = cc._decorator;

/** 蛇的方向 */
export enum Direction {
    UP, DOWN, LEFT, RIGHT
}

@ccclass
export default class SnakeController extends cc.Component {
    @property(cc.Prefab)
    bodyPrefab: cc.Prefab = null;

    @property(cc.Node)
    gameArea: cc.Node = null;

    private _body: cc.Node[] = [];
    private _currentDir: Direction = Direction.RIGHT;
    private _nextDir: Direction = Direction.RIGHT;
    private _moving: boolean = false;
    private _growing: boolean = false;
    private _cellSize: number = 32;

    public get body(): cc.Node[] { return this._body; }
    public get currentDir(): Direction { return this._currentDir; }
    public get headPos(): cc.Vec2 {
        if (this._body.length === 0) return cc.v2(0, 0);
        return this._body[0].getPosition();
    }

    init(startX: number, startY: number, cellSize: number) {
        this._cellSize = cellSize;
        this._body = [];
        this._currentDir = Direction.RIGHT;
        this._nextDir = Direction.RIGHT;

        // 创建蛇头 (用第一个body节点作为头)
        if (this._body.length === 0) {
            const head = cc.instantiate(this.bodyPrefab);
            head.setPosition(startX, startY);
            this.gameArea.addChild(head);
            this._body.push(head);
        }

        // 初始长度为3
        this._growing = true;
        this.grow();
        this.grow();
        this._growing = false;
    }

    setDirection(dir: Direction) {
        // 不允许反向
        if ((dir === Direction.UP && this._currentDir === Direction.DOWN) ||
            (dir === Direction.DOWN && this._currentDir === Direction.UP) ||
            (dir === Direction.LEFT && this._currentDir === Direction.RIGHT) ||
            (dir === Direction.RIGHT && this._currentDir === Direction.LEFT)) {
            return;
        }
        this._nextDir = dir;
    }

    grow() {
        this._growing = true;
    }

    /** 移动蛇，返回是否碰撞 */
    move(): { dead: boolean; ate: boolean } {
        this._currentDir = this._nextDir;

        if (this._body.length === 0) return { dead: true, ate: false };

        // 计算新蛇头位置
        const headPos = this._body[0].getPosition();
        let newX = headPos.x;
        let newY = headPos.y;

        switch (this._currentDir) {
            case Direction.UP: newY += this._cellSize; break;
            case Direction.DOWN: newY -= this._cellSize; break;
            case Direction.LEFT: newX -= this._cellSize; break;
            case Direction.RIGHT: newX += this._cellSize; break;
        }

        const newPos = cc.v2(newX, newY);

        // 移动：将新位置插入到头部，移除尾部
        const newHead = cc.instantiate(this.bodyPrefab);
        newHead.setPosition(newPos);
        this.gameArea.addChild(newHead);
        this._body.splice(0, 0, newHead);

        if (this._growing) {
            this._growing = false;
        } else {
            // 移除尾部
            const tail = this._body.pop();
            if (tail) tail.destroy();
        }

        return { dead: false, ate: false };
    }

    /** 检查蛇头是否与自身碰撞 */
    checkSelfCollision(): boolean {
        if (this._body.length < 2) return false;
        const headPos = this._body[0].getPosition();
        for (let i = 1; i < this._body.length; i++) {
            const pos = this._body[i].getPosition();
            if (headPos.equals(pos)) return true;
        }
        return false;
    }

    /** 获取蛇占用的所有格子位置 */
    getOccupiedPositions(): cc.Vec2[] {
        return this._body.map(n => n.getPosition());
    }

    reset() {
        for (let n of this._body) n.destroy();
        this._body = [];
        this._currentDir = Direction.RIGHT;
        this._nextDir = Direction.RIGHT;
        this._moving = false;
        this._growing = false;
    }
}