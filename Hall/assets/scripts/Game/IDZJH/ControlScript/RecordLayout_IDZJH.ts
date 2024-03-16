// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import { manager } from "../../../control/engines/GameEngine";
import GameInstInfo from "../../../Public/ControlScript/GameInstInfo";
import ScrollviewLayout from "../../../Public/ControlScript/ScrollviewLayout";
import Compare from "./Compare_IDZJH";

const {ccclass, property} = cc._decorator;

@ccclass
export default class RecordLayout extends cc.Component {
	protected className: string = "底部开奖记录";

    @property({type:cc.Label,displayName:"A"})
    A_label: cc.Label = null;

	@property({type:cc.Label,displayName:"B"})
    B_label: cc.Label = null;

	@property({type:cc.Label,displayName:"tie"})
	C_label: cc.Label = null;

	@property({type:cc.Node,displayName:"模版"})
    m_LayoutMode: cc.Node = null;

	@property({type:cc.ScrollView,displayName:"视窗"})
    m_ScrollView: cc.ScrollView = null;

	@property({type:cc.Node,displayName:"模版"})
    Mode_Sprite: cc.Node = null;
	//牌型算法
	m_Compare:Compare = new Compare(); 

	m_ItemRecord = []

	m_RecordData = []

	m_CountRecord = [0,0,0]  

	m_ScrollviewLayout_1 = null

	m_SpritePool = null

	onLoad(){
		this.m_SpritePool = new cc.NodePool();
		let initCount = 100;
		for (let i = 0; i < initCount; ++i) {
			let  enemy = cc.instantiate(this.Mode_Sprite)
			this.m_SpritePool.put(enemy);
		}
		this.m_ScrollviewLayout_1 = new ScrollviewLayout()
	}

	createTongji() {
		let enemy = null;
		if (this.m_SpritePool.size() > 0) { 
			enemy = this.m_SpritePool.get();
		} 
		else { 
			enemy = cc.instantiate(this.Mode_Sprite);
		}
		return enemy
	}

    start () {
		
		this.initChangeImage()
    }

	//多国语言适配Image
	initChangeImage(){
		let card001 = this.node.getChildByName('card001')
		GameInstInfo.getinstance().fucChangeImage(card001)

		let card002 = this.node.getChildByName('card002')
		GameInstInfo.getinstance().fucChangeImage(card002)

		let card003 = this.node.getChildByName('card003')
		GameInstInfo.getinstance().fucChangeImage(card003)

		let tx_betbg_all_amount = this.node.getChildByName('tx_betbg_all_amount')
		GameInstInfo.getinstance().fucChangeImage(tx_betbg_all_amount)
	
		let tx_betbg_playa_pair = this.node.getChildByName('tx_betbg_playa_pair')
		GameInstInfo.getinstance().fucChangeImage(tx_betbg_playa_pair)
	
		let tx_betbg_playb_pair = this.node.getChildByName('tx_betbg_playb_pair')
		GameInstInfo.getinstance().fucChangeImage(tx_betbg_playb_pair)

		let tx_betbg_6card = this.node.getChildByName('tx_betbg_6card')
		GameInstInfo.getinstance().fucChangeImage(tx_betbg_6card)
	}

	fucGameresult(data){
		//获取开奖结果
		let result =  data.LotteryOpen.split(",");
		let GameCardsData = []
		let cardValue = []
		for (let index = 0; index < 6; index++) {
			let  element = Number(result[index])
			let  Color =  Number(result[ 6 + index])
			cardValue[index] =  element +  (Color -1)*13
		}
		GameCardsData =cardValue

		let n_result = this.fucGetWinTarget(GameCardsData)

		return n_result
	}

	//扑克比大小
	fucGetWinTarget(GameCardsData){
		//AB 和    354
		let  cards_1 = []
		for (let index = 0; index < 3; index++) {
			cards_1[index] =GameCardsData[index];	
		}
		let  cards_2 = []
		for (let index = 3; index < 6; index++) {
			cards_2[index-3] = GameCardsData[index];
		}
		let n_reslt = this.m_Compare.compareCards(cards_1,cards_2)  
		return n_reslt == 3 ? 0:(n_reslt == 4? 1 : 2 )
	}
	
	fucWiterData(CardData){

		let nCardData = CardData.reverse()  
		for (let index = 0; index < nCardData.length; index++) {
			this.m_RecordData.push(this.fucGameresult(nCardData[index]))
		}

		//1创建滚动图
		let self = this
		let n_Result = this.m_ScrollviewLayout_1.fucDataTongjiToArray(this.m_RecordData,null,function(a,b) {
			return self.fucExactlySame(a ,b)
		})  
		this.m_ScrollviewLayout_1.initView(this.m_LayoutMode,this.m_ScrollView,n_Result,this.fucupItem_1.bind(this),true,30)
	
		this.fucUpLabe()
		
		this.fucUpAllLab(1)
	}

	fucAddResult(nCardData){
		this.m_RecordData.push(this.fucGameresult(nCardData))  // A   B  tie   0  1 2
		//1追加数据
		let self = this
		let n_Result = this.m_ScrollviewLayout_1.fucDataTongjiToArray(this.m_RecordData,null,function(a,b) {
			return self.fucExactlySame(a ,b)
		})  
		this.m_ScrollviewLayout_1.fucupdatainfo(n_Result)
		this.fucblink(this.m_ScrollviewLayout_1)

		this.fucUpLabe()
		this.m_ScrollView.scrollToPercentHorizontal(0.90,0)

		this.fucUpAllLab(1)
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
	
	fucupItem_1(item,data){
		for (let deskindex = 0; deskindex < 6; deskindex++) {
			let itemNode = item.getChildByName("desk"+deskindex)
			for (let index = 0; index < itemNode.children.length; index++) {
				let  element = itemNode.children[index];
				this.m_SpritePool.put(element); 
			}
			
			if (data[deskindex] >= 0) {
				let recordSprite = this.fucGetItem(data[deskindex])
				itemNode.addChild(recordSprite)
			}
		}
		item.active = true
	}

	//大小 1小2大   大小和
	fucGetItem(nValue){
		let recordSprite =this.createTongji()
		const path = 'Game/ColorDish/resources/loadRes/img/game/Sedie';
		let Imagename = `img_content_2`
		if (nValue == 2) {
			Imagename= `img_content_1`
		}
		
		manager().resourceMgr.loadPlistImage(recordSprite,path,Imagename);
		recordSprite.setPosition(cc.v2(0,0))
		recordSprite.active = true
		return recordSprite
	}

	fucUpLabe(){
		this.m_CountRecord = [0,0,0] 
		for (let index = 0; index < this.m_RecordData.length; index++) {
			this.m_CountRecord[this.m_RecordData[index]] +=1
		}
		this.A_label.getComponent(cc.Label).string  = ""+ this.m_CountRecord[0]
		this.B_label.getComponent(cc.Label).string  = ""+ this.m_CountRecord[1]
		this.C_label.getComponent(cc.Label).string  = ""+ this.m_CountRecord[2]
	}

	
	update (dt) {
		if (this.m_ScrollviewLayout_1) {
			this.m_ScrollviewLayout_1.update(dt)
		}
    }


	//  A :0   B:1   tie:2
	fucExactlySame(DraValue,TigValue){
		if (DraValue == 2  || TigValue == 2) {
			return true
		}
		if (DraValue != TigValue) {
			return false
		}
		return true
	}

	//刷新总场次
	fucUpAllLab(data){
		let str_Allc = this.node.getChildByName("lab_Layout").getChildByName("lab_red_5")
		let str_A = this.node.getChildByName("lab_Layout").getChildByName("lab_red_5")
		let str_B = this.node.getChildByName("lab_Layout").getChildByName("lab_red_5")
		let str_T = this.node.getChildByName("lab_Layout").getChildByName("lab_red_5")
		
		str_Allc.getComponent(cc.Label).string = "111"
		str_A.getComponent(cc.Label).string    = "1"
		str_B.getComponent(cc.Label).string    = "1"
		str_T.getComponent(cc.Label).string    = "1"
	}
}