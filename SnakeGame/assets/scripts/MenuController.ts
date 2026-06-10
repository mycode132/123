const { ccclass, property } = cc._decorator;

@ccclass
export default class MenuController extends cc.Component {
    protected onLoad() {
        // 开始游戏按钮
        const startBtn = this.node.getChildByName('StartBtn');
        if (startBtn) {
            startBtn.on(cc.Node.EventType.TOUCH_END, () => {
                cc.director.loadScene('LevelSelectScene');
            });
        }

        // 退出按钮
        const exitBtn = this.node.getChildByName('ExitBtn');
        if (exitBtn) {
            exitBtn.on(cc.Node.EventType.TOUCH_END, () => {
                cc.game.end();
            });
        }
    }
}