const { ccclass, property } = cc._decorator;

import LevelConfig from './GameConfig';

@ccclass
export default class LevelManager extends cc.Component {
    @property(cc.Node)
    contentRoot: cc.Node = null;

    @property(cc.Prefab)
    levelBtnPrefab: cc.Prefab = null;

    protected onLoad() {
        // 返回按钮
        const backBtn = this.node.getChildByName('BackBtn');
        if (backBtn) {
            backBtn.on(cc.Node.EventType.TOUCH_END, () => {
                cc.director.loadScene('MenuScene');
            });
        }

        this.buildLevelButtons();
    }

    private buildLevelButtons() {
        if (!this.contentRoot) return;

        // 清除旧的按钮
        this.contentRoot.removeAllChildren();

        const cols = 3;
        const spacingX = 180;
        const spacingY = 130;

        // 为每个关卡创建按钮
        LevelConfig.forEach((level, index) => {
            const row = Math.floor(index / cols);
            const col = index % cols;
            const posX = -((cols - 1) * spacingX) / 2 + col * spacingX;
            const posY = (2 - row) * spacingY;

            let btn: cc.Node;
            if (this.levelBtnPrefab) {
                btn = cc.instantiate(this.levelBtnPrefab);
            } else {
                btn = new cc.Node(`LevelBtn_${level.id}`);
                const sprite = btn.addComponent(cc.Sprite);
                const btnComp = btn.addComponent(cc.Button);
                const label = new cc.Node('Label');
                label.addComponent(cc.Label);
                label.parent = btn;
            }

            btn.setPosition(posX, posY);
            btn.name = `LevelBtn_${level.id}`;

            // 设置关卡名称
            const labelNode = btn.getChildByName('Label');
            if (labelNode) {
                const labelComp = labelNode.getComponent(cc.Label);
                if (labelComp) {
                    labelComp.string = level.unlocked ? level.name : '🔒';
                }
            }

            // 交互状态
            const btnComp = btn.getComponent(cc.Button);
            if (btnComp) btnComp.interactable = level.unlocked;

            // 点击事件
            btn.on(cc.Node.EventType.TOUCH_END, () => {
                if (level.unlocked) {
                    this.startGame(level.id);
                }
            });

            this.contentRoot.addChild(btn);
        });
    }

    private startGame(levelId: number) {
        cc.sys.localStorage.setItem('selectedLevel', levelId.toString());
        cc.director.loadScene('GameScene');
    }
}