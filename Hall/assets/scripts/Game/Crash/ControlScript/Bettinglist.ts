// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import GameInstInfo from "../../../Public/ControlScript/GameInstInfo";
import GameInfo from "./GameInfo";

const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {
	@property({type: cc.Label, displayName: '人数'})
	mPlayer_lab: cc.Label = null;

	@property({type: cc.Label, displayName: '总额度'})
	mAllMoney_lab: cc.Label = null;

	@property({type: cc.ScrollView, displayName: '视窗'})
	mScrollView: cc.ScrollView = null;

	@property({type: cc.Node, displayName: '模版'})
	mItem: cc.Node = null;

	m_loagIndex = 0
	m_mItemArray = []
	m_MaxPlayer = 0

    start () {
		this.m_MaxPlayer = 100+ Math.round(Math.random()*100)
		this.mAllMoney_lab.getComponent(cc.Label).string = ""+(100+ Math.round(Math.random()*100) *1000)
    }


	fucAddItem(){
		for (let index = 0; index < 10; index++) {
			let  item = this.fucSetItemInfo()
			this.mScrollView.content.addChild(item)
			this.m_mItemArray.push(item)
		}
		this.m_loagIndex = 10
		this.mScrollView.content.setContentSize(cc.size(this.mItem.getContentSize().width,this.mItem.getContentSize().height*this.m_loagIndex))
	}

	//动态数据
	fucSetItemInfo(){
		let Item = cc.instantiate(this.mItem)

		let namelab = Item.getChildByName('info');

		let name_str = GameInstInfo.getinstance().random("",5+Math.random()*3)

		name_str = name_str.replace(`${name_str.substring(1, name_str.length-1)}`, '****');

		namelab.getComponent(cc.Label).string = name_str
		let menoy = Item.getChildByName('menoy');
		menoy.getComponent(cc.Label).string = "" + (100+ Math.round(Math.random()*20000))
		Item.active = true
		return Item
	}

	fucGameStart(){
		this.m_loagIndex = 0
		this.mScrollView.content.removeAllChildren()
		this.m_MaxPlayer = this.m_MaxPlayer + Math.round(Math.random()*100)
		this.mPlayer_lab.getComponent(cc.Label).string = ""+this.m_MaxPlayer

		this.fucAddItem()
		this.unschedule(this.fucGameEnd)
		this.schedule(this.fucupdate, 0.5, cc.macro.REPEAT_FOREVER, 0)  //延时三秒
	}

	fucGameOver(){
		for (let index = 0; index < this.m_mItemArray.length; index++) {
			const element = this.m_mItemArray[index];
			element.getChildByName('menoy').active = false
		}
		this.unschedule(this.fucupdate)
		this.schedule(this.fucGameEnd, 2.5, cc.macro.REPEAT_FOREVER, 3)  //延时三秒
	}

	//游戏开始后  刷  倍数与盈利
	fucupdate (dt) {
		this.m_MaxPlayer = this.m_MaxPlayer + Math.round(Math.random()*5)
		this.mPlayer_lab.getComponent(cc.Label).string = ""+this.m_MaxPlayer

		let count = (1+ Math.round(Math.random()*10))
		let Array = []
		for (let index = 0; index < count; index++) {
			Array.push(1+ Math.round(Math.random()*10))
		}
		for (let index = 0; index < Array.length; index++) {
			const element = Array[index];
			if (!this.m_mItemArray[element]) {
				continue
			}
			let nMoney = this.m_mItemArray[element].getChildByName('menoy').getComponent(cc.Label).string
			this.m_mItemArray[element].getChildByName('menoy').getComponent(cc.Label).string = Number(nMoney) +count +""
		}

		let n_allMoney = 0
		for (let index = 0; index < this.m_mItemArray.length; index++) {
			const element = this.m_mItemArray[index];
			let nMoney = element.getChildByName('menoy').getComponent(cc.Label).string
			n_allMoney +=  Number(nMoney)
		}
		this.mAllMoney_lab.getComponent(cc.Label).string = ""+n_allMoney
	}

	fucGameEnd(dt){
		let count = Math.round(Math.random()*this.m_mItemArray.length)
		let Array = []
		for (let index = 0; index < count; index++) {
			Array.push(Math.round(Math.random()*count))
		}
		for (let index = 0; index < Array.length; index++) {
			const element = Array[index];
			if (!this.m_mItemArray[element]) {
				continue
			}
			let WinLab = this.m_mItemArray[element].getChildByName('WinLab')
			if (WinLab.active) continue
			WinLab.active = true
			let double = (GameInfo.getinstance().m_Currentmultiple/100).toFixed(2) 
			let score = Math.round( 1000+ Math.random()*10000)
			WinLab.getComponent(cc.Label).string = `${double}x/${score}`
		}
	}
}