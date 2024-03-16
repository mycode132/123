// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import { manager } from "../../../control/engines/GameEngine";
import GameInstInfo from "../../../Public/ControlScript/GameInstInfo";
import ScrollviewLayout from "../../../Public/ControlScript/ScrollviewLayout";

const {ccclass, property} = cc._decorator;

@ccclass
export default class RecordLayout extends cc.Component {
	protected className: string = "底部开奖记录";

    @property({type:cc.Label,displayName:"闲"})
    xian_label: cc.Label = null;

	@property({type:cc.Label,displayName:"庄"})
    zhuang_label: cc.Label = null;

	@property({type:cc.Label,displayName:"和"})
    he_label: cc.Label = null;

	@property({type:cc.Node,displayName:"模版"})
    m_LayoutMode: cc.Node = null;

	@property({type:cc.ScrollView,displayName:"视窗"})
    m_ScrollView: cc.ScrollView = null;

	//龙虎和 标记
	@property({type:cc.Node,displayName:"庄标记"})
    zhuang_Sprite: cc.Node = null;

	m_ItemRecord = []

	m_RecordData = []

	m_CountRecord = [0,0,0]  //  dra :1   tig:2   tie:3

	m_zuangSpritePool = null

	m_ScrollviewLayout = null

	onLoad(){
		this.m_ScrollviewLayout = new ScrollviewLayout()
	}

    onEnable () {
		this.m_zuangSpritePool = new cc.NodePool();
		for (let i = 0; i < 1000; ++i) {
			let zhuang = cc.instantiate(this.zhuang_Sprite); 
			this.m_zuangSpritePool.put(zhuang); 
		}
    }

	createzhuang() {
		let enemy:cc.Node = null;
		if (this.m_zuangSpritePool.size() > 0) { 
			enemy = this.m_zuangSpritePool.get();
		} 
		else { 
			enemy = cc.instantiate(this.zhuang_Sprite);
		}
		enemy.active = true
		return enemy
	}
	
	initData(nData){
		let  data = nData.reverse(); 
		this.m_RecordData = []
		for (let index = 0; index < data.length; index++) {
			let aa = this.fucGameresult(data[index].LotteryOpen)
			this.m_RecordData.push(aa)
		}
	
		this.fucUpLabe()
		//创建滚动图
		let self = this
		let n_Result = this.m_ScrollviewLayout.fucDataTongjiToArray(this.m_RecordData,3,function(a,b) {
			return self.fucExactlySame(a ,b)
		})  
		
		this.m_ScrollviewLayout.initView(this.m_LayoutMode,this.m_ScrollView,n_Result,this.fucupItem.bind(this),true,35)
	}

	fucGameresult(data){
		//获取开奖结果
		let result =  data.split(",");
		let TouziPonits = [0,0,0,0,0,0]
		if (Number(result[0]) == 3 ) {
			TouziPonits[3] = Number(result[2])
			TouziPonits[4] = Number(result[3])
			TouziPonits[5] = Number(result[4])

			TouziPonits[0] = Number(result[5])
			TouziPonits[1] = Number(result[6])
			TouziPonits[2] = 0
			//闲 3  庄 3
			if (Number(result[1]) == 3) {
				TouziPonits[2] = Number(result[7])
			}
		}else{
			TouziPonits[3] = Number(result[2])
			TouziPonits[4] = Number(result[3])
			TouziPonits[5] = 0
			TouziPonits[0] = Number(result[4])
			TouziPonits[1] = Number(result[5])
			if (Number(result[1]) == 3) {
				TouziPonits[2] = Number(result[6])
			}
		}
		return this.fuccompareCard(TouziPonits)
	}

	//  闲 :1   庄:0   tie:2
	fuccompareCard(TouziPonits){
		let result = [0,0]
		for (let index = 0; index < TouziPonits.length-3; index++) {
			const element = TouziPonits[index];
			if (element>=10 ) {
				result[0] +=0
			}else{
				result[0] +=element
			}
			if (result[0]>=10) {
				result[0] = result[0]-10
			}
		}

		for (let index = 3; index < TouziPonits.length; index++) {
			const element = TouziPonits[index];
			if (element>=10 ) {
				result[1] +=0
			}else{
				result[1] +=element
			}
			if (result[1]>=10) {
				result[1] = result[1]-10
			}
		}
		return (result[0] > result[1] ) ? 0 :(( result[0] < result[1] ) ? 1 : 2) 
	}

	fucWiterData(nCardData){
		let LotteryOpen = this.fucGameresult(nCardData.LotteryOpen)
		this.m_RecordData.push(LotteryOpen)

		this.fucUpLabe()
		//追加数据
		let self = this
		let n_Result = this.m_ScrollviewLayout.fucDataTongjiToArray(this.m_RecordData,3,function(a,b) {
			return self.fucExactlySame(a ,b)
		})  
		this.m_ScrollviewLayout.fucupdatainfo(n_Result)
		this.fucblink(this.m_ScrollviewLayout)
	}

	fucUpLabe(){
		this.m_CountRecord = [0,0,0] 
		for (let index = 0; index < this.m_RecordData.length; index++) {
			this.m_CountRecord[this.m_RecordData[index]] +=1
		}
		this.xian_label.getComponent(cc.Label).string  = ""+ this.m_CountRecord[0]
		this.zhuang_label.getComponent(cc.Label).string  = ""+ this.m_CountRecord[1]
		this.he_label.getComponent(cc.Label).string  = ""+ this.m_CountRecord[2]
	}

	fucblink(_ScrollviewLayout){
		let n_Result = _ScrollviewLayout.m_endItemPos
		let Item = _ScrollviewLayout.itemsArr[n_Result[0]]
		if (Item) {
			let itemNode = Item.getChildByName("desk"+n_Result[1])
			if (itemNode) {
				itemNode.stopAllActions()
				itemNode.runAction(cc.blink(3,5))
			}
		}
	}

	update (dt) {
		if (this.m_ScrollviewLayout) {
			this.m_ScrollviewLayout.update(dt)
		}
    }

	fucupItem(item,data){
		for (let deskindex = 0; deskindex < 6; deskindex++) {
			let itemNode = item.getChildByName("desk"+deskindex)
			//itemNode.removeAllChildren()
			//itemNode.destroyAllChildren()
			for (let index = 0; index < itemNode.children.length; index++) {
				let  element = itemNode.children[index];
				this.m_zuangSpritePool.put(element); 
			}
			
			if (data[deskindex] >= 0) {
				let recordSprite = this.fucGetItem(data[deskindex])
				itemNode.addChild(recordSprite)
			}
		}
		item.active = true
	}

	fucGetItem(nValue){
		let recordSprite = this.createzhuang()
		const path = 'Public/resources/Plist/HeList';
		let Imagename = ``
		if (nValue == 0) {
			Imagename = "img_content_1"
		}else if (nValue == 1){
			Imagename = "img_content_2"
		}else{
			Imagename = "img_content_3"
		}
		manager().resourceMgr.loadPlistImage(recordSprite,path,Imagename);
		recordSprite.setPosition(cc.v2(0,0))
		recordSprite.active = true
		return recordSprite
	}


	//  dra :1   tig:2   tie:3
	fucExactlySame(nCount1,nCount2){
		if (nCount1 == 2  || nCount2 == 2) {
			return true
		}
		if (nCount1 != nCount2) {
			return false
		}
		return true
	}
}