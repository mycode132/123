// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import CCGIF from "./CCGIF";

const {ccclass, property} = cc._decorator;

@ccclass
export default class AutoGif extends cc.Component {

   
    async start () {
		await Promise.all(this.node.children.map(n =>
            n.getComponent(CCGIF).preload()
        ))
		this.node.children.forEach(v => v.getComponent(CCGIF).play(true));
    }

	onDestroy(){
		this.node.children.forEach(v => v.getComponent(CCGIF).stop());

	}
}
