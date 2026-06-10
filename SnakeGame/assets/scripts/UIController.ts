const { ccclass, property } = cc._decorator;

import GameManager, { GameState } from './GameManager';

@ccclass
export default class UIController extends cc.Component {
    @property(GameManager)
    gameManager: GameManager = null;

    protected onLoad() {
        // 键盘事件 - WASD控制
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);

        // 按钮事件
        this.registerButton('RestartBtn', () => {
            if (this.gameManager) this.gameManager.restartLevel();
        });
        this.registerButton('NextLevelBtn', () => {
            if (this.gameManager) this.gameManager.nextLevel();
        });
        this.registerButton('MenuBtn', () => {
            if (this.gameManager) this.gameManager.goToLevelSelect();
        });
        this.registerButton('PauseBtn', () => {
            if (this.gameManager) this.gameManager.pauseGame();
        });
    }

    protected onDestroy() {
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
    }

    private onKeyDown(event: cc.Event.EventKeyboard) {
        if (!this.gameManager) return;

        const snakeCtrl = this.gameManager['snake'] as any;
        if (!snakeCtrl) return;

        const GameStateEnum = GameState;

        switch (event.keyCode) {
            case cc.macro.KEY.w:
                snakeCtrl.setDirection(0); // UP
                break;
            case cc.macro.KEY.s:
                snakeCtrl.setDirection(1); // DOWN
                break;
            case cc.macro.KEY.a:
                snakeCtrl.setDirection(2); // LEFT
                break;
            case cc.macro.KEY.d:
                snakeCtrl.setDirection(3); // RIGHT
                break;
            case cc.macro.KEY.space:
                this.gameManager.pauseGame();
                break;
        }

        // 首次按键开始游戏
        if (this.gameManager.state === GameStateEnum.READY) {
            this.gameManager.startGame();
        }
    }

    private registerButton(nodeName: string, callback: () => void) {
        const root = this.gameManager ? this.gameManager.node : cc.find('Canvas');
        if (!root) return;
        const node = root.getChildByName(nodeName);
        if (node) {
            node.on(cc.Node.EventType.TOUCH_END, callback);
        } else {
            // 也可以从整个场景中查找
            const found = cc.find('Canvas/' + nodeName);
            if (found) found.on(cc.Node.EventType.TOUCH_END, callback);
        }
    }
}