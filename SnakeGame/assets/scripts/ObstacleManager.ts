const { ccclass, property } = cc._decorator;

@ccclass
export default class ObstacleManager extends cc.Component {
    @property(cc.Prefab)
    obstaclePrefab: cc.Prefab = null;

    @property(cc.Prefab)
    wallPrefab: cc.Prefab = null;

    @property(cc.Node)
    gameArea: cc.Node = null;

    private _obstacles: cc.Node[] = [];
    private _cellSize: number = 32;

    init(cellSize: number) {
        this._cellSize = cellSize;
    }

    /** 放置障碍物 */
    placeObstacles(obstacleData: { x: number; y: number }[]) {
        this.clear();

        for (let data of obstacleData) {
            const pos = this.gridToWorld(data.x, data.y);
            const node = cc.instantiate(this.obstaclePrefab);
            node.setPosition(pos);
            this.gameArea.addChild(node);
            this._obstacles.push(node);
        }
    }

    /** 创建墙壁 */
    createWalls(gridWidth: number, gridHeight: number) {
        const walls: { x: number; y: number }[] = [];

        // 上下边界
        for (let x = -1; x <= gridWidth; x++) {
            walls.push({ x, y: -1 });
            walls.push({ x, y: gridHeight });
        }
        // 左右边界
        for (let y = 0; y < gridHeight; y++) {
            walls.push({ x: -1, y });
            walls.push({ x: gridWidth, y });
        }

        for (let w of walls) {
            const pos = this.gridToWorld(w.x, w.y);
            const node = cc.instantiate(this.wallPrefab);
            node.setPosition(pos);
            this.gameArea.addChild(node);
            this._obstacles.push(node);
        }
    }

    /** 检查位置是否碰撞障碍物 */
    checkCollision(pos: cc.Vec2): boolean {
        for (let obs of this._obstacles) {
            const obsPos = obs.getPosition();
            if (pos.equals(obsPos)) return true;
        }
        return false;
    }

    /** 获取障碍物占用的所有位置 */
    getObstaclePositions(): cc.Vec2[] {
        return this._obstacles.map(n => n.getPosition());
    }

    clear() {
        for (let n of this._obstacles) n.destroy();
        this._obstacles = [];
    }

    private gridToWorld(gx: number, gy: number): cc.Vec2 {
        const offset = this._cellSize / 2;
        return cc.v2(gx * this._cellSize + offset, gy * this._cellSize + offset);
    }
}