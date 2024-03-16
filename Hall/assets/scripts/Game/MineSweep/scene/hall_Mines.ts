// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import GameInstInfo from "../../../Public/ControlScript/GameInstInfo";
import Desk_Mines from "../ControlScript/Desk_Mines";

const {ccclass, property, menu} = cc._decorator;

@ccclass
@menu("扫雷/大厅")
export default class NewClass  extends cc.Component {
	@property({type: cc.Node, displayName: '背景节点'})
	ndBG: cc.Node = null;
	@property({type: cc.Node, displayName: '游戏节点'})
	GameLayer: cc.Node = null;
	@property({type: cc.Node, displayName: '倍率节点'})
	downRoot: cc.Node = null;

	@property({type: cc.Node, displayName: '控制节点'})
	ControlRoot: cc.Node = null;

	@property({type: cc.Node, displayName: '提示节点'})
	GameTipsNode: cc.Node = null;
	
	m_oGameDesk:Desk_Mines = null

	m_GameStatus = {
		//自己携带金币
		mUserGold:1000000000,
	}

    start () {
		let _this = this
		//实例化桌子类
		if (!_this.m_oGameDesk) {
			_this.m_oGameDesk = new Desk_Mines();
			_this.m_oGameDesk.fucInit(_this);
		}
    }

	//消息处理
	fucCoCosgetMsg(e){
		if (!e.data.data) {
			return
		}
		let self = this
		if (e.data.type == "userbalance") {
			//这是获取用户余额
			let lbCoin = self.node.getChildByName('Money_lab')
			self.m_GameStatus.mUserGold = Math.floor(Number(e.data.data.Data.BackData))
			if (GameInstInfo.getinstance().m_curr == "VND" ) {
				lbCoin.getComponent(cc.Label).string = (self.m_GameStatus.mUserGold/100).toFixed(0)
			}else{
				lbCoin.getComponent(cc.Label).string = (self.m_GameStatus.mUserGold/100).toFixed(0)
			}
		}
		//向下传递消息
	}
}