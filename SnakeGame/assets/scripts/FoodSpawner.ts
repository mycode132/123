const { ccclass, property } = cc._decorator;

@ccclass
export default class FoodSpawner extends cc.Component {
    @property(cc.Prefab)
    foodPrefab: cc.Prefab = null;

    @property(cc.Node)
    gameArea: cc.Node = null;

    private _food: cc.Node = null;
    private _cellSize: number = 32;

    public get foodNode(): cc.Node { return this._food; }

    init(cellSize: number) {
        this._cellSize = cellSize;
    }

    /** 在可用位置生成食物 */
    spawn(occupiedPositions: cc.Vec2[], gridWidth: number, gridHeight: number): cc.Vec2 {
        if (this._food) {
            this._food.destroy();
            this._food = null;
        }

        // 计算所有可用位置
        const occupied = new Set<string>();
        occupiedPositions.forEach(p => occupied.add(`${p.x},${p.y}`));

        const available: cc.Vec2[] = [];
        for (let x = 0; x < gridWidth; x++) {
            for (let y = 0; y < gridHeight; y++) {
                const pos = this.gridToWorld(x, y);
                if (!occupied.has(`${pos.x},${pos.y}`)) {
                    available.push(pos);
                }
            }
        }

        if (available.length === 0) return null;

        const randIdx = Math.floor(Math.random() * available.length);
        const spawnPos = available[randIdx];

        this._food = cc.instantiate(this.foodPrefab);
        this._food.setPosition(spawnPos);
        this.gameArea.addChild(this._food);

        return spawnPos;
    }

    removeFood() {
        if (this._food) {
            this._food.destroy();
            this._food = null;
        }
    }

    private gridToWorld(gx: number, gy: number): cc.Vec2 {
        const offset = this._cellSize / 2;
        return cc.v2(gx * this._cellSize + offset, gy * this._cellSize + offset);
    }
}