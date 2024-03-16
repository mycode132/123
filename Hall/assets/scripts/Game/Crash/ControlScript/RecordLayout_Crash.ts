// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import GameInstInfo from "../../../Public/ControlScript/GameInstInfo";




const {ccclass, property} = cc._decorator;

@ccclass
export default class RecordLayout extends cc.Component {
	protected className: string = "底部开奖记录";

	@property({type:cc.Node,displayName:"模版"})
    m_LayoutMode: cc.Node = null;


	//BG
	@property({type:[cc.SpriteFrame],displayName:"BGSprite"})
	m_BGSprite:cc.SpriteFrame[] = []

	@property({type:cc.ScrollView,displayName:"视窗"})
    m_ScrollView: cc.ScrollView = null;
	m_ItemRecord = [] //Item
	

	m_GameResult = []
    
    start () {
		this.m_ItemRecord = []
    }

	fucInit(data){
		let  val = data.reverse(); 
		this.m_GameResult =JSON.parse(JSON.stringify(val))
		this.m_ScrollView.content.removeAllChildren()
		for (let index = 0; index < this.m_GameResult.length; index++) {
			const element = this.m_GameResult[index].LotteryOpen;
			let nItem = this.fucCloneItem(element,index)
			this.m_ScrollView.content.addChild(nItem)
		}
	}

	fucWritedata(data){
		this.m_GameResult.unshift(data)
		this.m_ScrollView.content.removeAllChildren()
		for (let index = 0; index < this.m_GameResult.length; index++) {
			const element = this.m_GameResult[index].LotteryOpen;
			let nItem = this.fucCloneItem(element,index)
			this.m_ScrollView.content.addChild(nItem)
		}
	}

	fucCloneItem(nValue,index){
		let nItem = cc.instantiate(this.m_LayoutMode)
		if (index == 0 ) {
			nItem.getChildByName("mb_img_odd_new").active = true
		}
		let  bg = nItem.getChildByName("bg")
		if (nValue < 1.5) {
			bg.getComponent(cc.Sprite).spriteFrame = this.m_BGSprite[0]
		}else if (nValue < 3.5) {
			bg.getComponent(cc.Sprite).spriteFrame = this.m_BGSprite[1]
		}else if (nValue < 5.5) {
			bg.getComponent(cc.Sprite).spriteFrame = this.m_BGSprite[2]
		}else if (nValue < 8.5) {
			bg.getComponent(cc.Sprite).spriteFrame = this.m_BGSprite[3]
		}else{
			bg.getComponent(cc.Sprite).spriteFrame = this.m_BGSprite[4]
		}
		nItem.active = true
		return nItem
	}
}