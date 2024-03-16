// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import SoundMgr from "../../../Public/ControlScript/SoundMgr";
import GameInfo from "./GameInfo";

const {ccclass, property} = cc._decorator;

@ccclass
export default class AutoDownChip extends cc.Component {

	@property({type: cc.Node, displayName: '关闭'})
	nclose: cc.Node = null;

	@property({type: cc.Node, displayName: '上根节点'})
	upRoot: cc.Node = null;

	@property({type: cc.Node, displayName: '下根节点'})
	downRoot: cc.Node = null;

	@property({type: cc.Node, displayName: '更多细节'})
	MoreNode: cc.Node = null;

	@property({type: cc.Node, displayName: '更多节点'})
	MoreRoot: cc.Node = null;

	@property({type: cc.Node, displayName: '确定节点'})
	ConfirmRoot: cc.Node = null;
	
    // onLoad () {}
	m_parent = null

    start () {
		//关闭
		let but_Close = this.nclose.getChildByName("close_but")
		but_Close.on(cc.Node.EventType.TOUCH_END,function(event){
			SoundMgr.palyButSound()
			this.node.active = false
		}.bind(this),this)

		//更多
		let Indicating = this.MoreRoot.getChildByName("close_but")
		this.MoreRoot.on(cc.Node.EventType.TOUCH_END,function(event){
			SoundMgr.palyButSound()
			this.downRoot.active = !this.downRoot.active
			if (this.downRoot.active) {
				Indicating.angle = 180
			}else{
				Indicating.angle = 0
			}
		}.bind(this),this)

		//确定 
		let but_Confirm = this.ConfirmRoot.getChildByName("but_reduce")
		but_Confirm.on(cc.Node.EventType.TOUCH_END,function(event){
			SoundMgr.palyButSound()
			this.fucConfirmCallBack()
			this.node.active = false
		}.bind(this),this)

		this.fucInitUpRoot()
		this.fucInitMore()
    }

	fucSetParent(parent){
		this.m_parent = parent
	}


	fucConfirmCallBack(){

		//通知上层更改
		if (this.m_parent) {
			this.m_parent.intTemplate()
		}

	}

   //初始化上跟节点
   fucInitUpRoot(){
		for (let index = 0; index < 6; index++) {
			const element = this.upRoot.getChildByName("But_"+index)
			let sGameInning = element.getChildByName("Background").getChildByName("Label")
			sGameInning.getComponent(cc.Label).string = "" + GameInfo.getinstance().m_Gameinning[index]
			element.on(cc.Node.EventType.TOUCH_END,function(event){
				SoundMgr.palyButSound()
				element.getComponent(cc.Button).interactable = false
				GameInfo.getinstance().m_GameData.m_Gameinning =  GameInfo.getinstance().m_Gameinning[index] //游戏局数选择
				for (let z = 0; z < 6; z++) {
					const but = this.upRoot.getChildByName("But_"+z)
					if (but != element) {
						but.getComponent(cc.Button).interactable = true
					}
				}
			}.bind(this),this)
		}
		//底分
		let n_stopLi = this.upRoot.getChildByName("DiscroeBut")
		this.fucBindBut(n_stopLi,GameInfo.getinstance().m_GameData.m_stopLi,"amount")

		//倍数
		let n_stopSun = this.upRoot.getChildByName("douBut")
		this.fucBindBut(n_stopSun,GameInfo.getinstance().m_GameData.m_stopSun,"odd")
   }

    //初始化更多节点
   fucInitMore(){
		let n_stopLi = this.MoreNode.getChildByName("stopLiBut")
		this.fucBindBut(n_stopLi,GameInfo.getinstance().m_GameData.m_stopLi,"Li")

		let n_stopSun = this.MoreNode.getChildByName("stopSunBut")
		this.fucBindBut(n_stopSun,GameInfo.getinstance().m_GameData.m_stopSun,"Sun")

		let WinDouble = this.MoreNode.getChildByName("WinToggle")

		WinDouble.on('toggle', this.fucWinTagglecallback, this);

		let LoseDouble = this.MoreNode.getChildByName("losToggle")
		LoseDouble.on('toggle', this.fucLoseTagglecallback, this);
   }

	fucWinTagglecallback(toggle){
		let  bSelect = toggle.isChecked
		GameInfo.getinstance().m_GameData.m_bWinDouble =  bSelect //赢加倍
			
	}
	fucLoseTagglecallback(toggle){
		let  bSelect = toggle.isChecked
		GameInfo.getinstance().m_GameData.m_LoseDouble =  bSelect //输加倍
	}

   //绑定多功能按钮  
	fucBindBut(node,lab,Type){
		let self  = this
		let  str_Label = node.getChildByName("strLabel")
		node.on(cc.Node.EventType.TOUCH_END,function(event){
			let Num = str_Label.getComponent(cc.Label).string
			let EditBoxLayout = cc.instantiate(this.m_parent.m_Editboxprefab)
			self.node.addChild(EditBoxLayout)
			let Compoent = EditBoxLayout.getComponent("EditBoxLayout")
			Compoent.fucShowType(Num,Type,lab)
			Compoent.fucCallBcak(function(str){
				str_Label.getComponent(cc.Label).string = str
			})
		},this)
	}

	toThousands(num) {
		return (num || 0).toString().replace(/(\d)(?=(?:\d{3})+$)/g, '$1,');
	}

   fucShow(){
		//底分
		let n_stopLi = this.upRoot.getChildByName("DiscroeBut")
		n_stopLi.getChildByName("strLabel").getComponent(cc.Label).string  = this.toThousands(GameInfo.getinstance().m_GameData.m_Basicscore)+"k"
		//倍数
		let n_stopSun = this.upRoot.getChildByName("douBut")
		n_stopSun.getChildByName("strLabel").getComponent(cc.Label).string = this.toThousands(GameInfo.getinstance().m_GameData.m_multiple) +".00x"
		for (let index = 0; index < 6; index++) {
			const element = this.upRoot.getChildByName("But_"+index)
			if ( GameInfo.getinstance().m_Gameinning[index] ==  GameInfo.getinstance().m_GameData.m_Gameinning) {
				element.getComponent(cc.Button).interactable = false
			}
		}
   }
}