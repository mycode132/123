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

    @property({type:cc.Label,displayName:"虎"})
    hu_label: cc.Label = null;

	@property({type:cc.Label,displayName:"龙"})
    long_label: cc.Label = null;

	@property({type:cc.Label,displayName:"和"})
    he_label: cc.Label = null;

	@property({type:cc.Node,displayName:"模版"})
    m_LayoutMode: cc.Node = null;

	@property({type:cc.ScrollView,displayName:"视窗"})
    m_ScrollView: cc.ScrollView = null;

	//龙虎和 标记
	@property({type:cc.Node,displayName:"模版标记"})
    m_ModeSprite: cc.Node = null;

	

	m_ItemRecord = []

	m_RecordData = []

	m_CountRecord = [0,0,0]  //  dra :1   tig:2   tie:3



	m_ScrollviewLayout = null

	m_enemyPool = null
	onLoad() {
		this.m_enemyPool = new cc.NodePool();
		let initCount = 1000;
		for (let i = 0; i < initCount; ++i) {
			let enemy = cc.instantiate(this.m_ModeSprite); 
			this.m_enemyPool.put(enemy); 
		}

		this.m_ScrollviewLayout = new ScrollviewLayout()
	}

	createSize() {
		let enemy = null;
		if (this.m_enemyPool.size() > 0) { 
			enemy = this.m_enemyPool.get();
		} 
		else { 
			enemy = cc.instantiate(this.m_ModeSprite);
		}
		return enemy
	}

	initData(nData){
		let  data = nData.reverse(); 
		this.m_RecordData = []
		for (let index = 0; index < data.length; index++) {
			let aa = data[index].LotteryOpen.split(",");
			this.m_RecordData.push(this.fuccompareCard(Number(aa[0]),Number(aa[1])))
		}
		
		this.fucUpLabe()
	
		//创建滚动图
		let self = this
		let n_Result = this.m_ScrollviewLayout.fucDataTongjiToArray(this.m_RecordData,3,function(a,b) {
			return self.fucExactlySame(a ,b)
		})  

		this.m_ScrollviewLayout.initView(this.m_LayoutMode,this.m_ScrollView,n_Result,this.fucupItem.bind(this),true,35)

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
	m_enditem = null
	fucupItem(item,data){
		for (let deskindex = 0; deskindex < 6; deskindex++) {
			let itemNode = item.getChildByName("desk"+deskindex)
			//itemNode.removeAllChildren()
			//itemNode.destroyAllChildren()

			for (let index = 0; index < itemNode.children.length; index++) {
				let  element = itemNode.children[index];
				this.m_enemyPool.put(element); 
			}

			if (data[deskindex] > 0) {
				let recordSprite = this.fucGetItem(data[deskindex])
				itemNode.addChild(recordSprite)

				this.m_enditem = recordSprite
			}
		}
		item.active = true
	}

	update (dt) {
		if (this.m_ScrollviewLayout) {
			this.m_ScrollviewLayout.update(dt)
		}
    }

	//  dra :1   tig:2   tie:3
	fuccompareCard(DraValue,TigValue){
		if (DraValue < TigValue ) {
			return 2
		}
		if (DraValue > TigValue) {
			return 1
		}
		return 3
	}

	//追加开奖结果
	fucWiterData(dragonCard,tigerCard){
		this.m_RecordData.push(this.fuccompareCard(dragonCard,tigerCard))

		this.fucUpLabe()
		//追加数据
		let self = this
		let n_Result =  this.m_ScrollviewLayout.fucDataTongjiToArray(this.m_RecordData,3,function(a,b) {
			return self.fucExactlySame(a ,b)
		})  
		this.m_ScrollviewLayout.fucupdatainfo(n_Result)
		this.fucblink(this.m_ScrollviewLayout)
	}
	

	fucUpLabe(){
		this.m_CountRecord = [0,0,0] 
		for (let index = 0; index < this.m_RecordData.length; index++) {
			this.m_CountRecord[this.m_RecordData[index]-1] +=1
		}
		this.hu_label.getComponent(cc.Label).string  = ""+ this.m_CountRecord[1]
		this.long_label.getComponent(cc.Label).string  = ""+ this.m_CountRecord[0]
		this.he_label.getComponent(cc.Label).string  = ""+ this.m_CountRecord[2]
	}

	
	//大小 1大2小3和
	fucGetItem(nValue){
		let recordSprite =this.createSize()
		const path = 'Public/resources/coin/Chip_List';
		let Imagename = `img_content_3`
		if (nValue == 1) {
			Imagename= `img_content_2`
		}else if (nValue == 2) {
			Imagename= `img_content_1`
		}
		
		manager().resourceMgr.loadPlistImage(recordSprite,path,Imagename);
		recordSprite.setPosition(cc.v2(0,0))
		recordSprite.active = true
		return recordSprite
	}

	//  dra :1   tig:2   tie:3
	fucExactlySame(DraValue,TigValue){
		if (DraValue == 3  || TigValue == 3) {
			return true
		}
		if (DraValue != TigValue) {
			return false
		}
		return true
	}

}