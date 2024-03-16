// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import GameInstInfo from "../../../Public/ControlScript/GameInstInfo";
import ScrollviewLayout from "../../../Public/ControlScript/ScrollviewLayout";
import Compare from "./Compare";

const {ccclass, property} = cc._decorator;

@ccclass
export default class RecordLayout extends cc.Component {
	protected className: string = "底部开奖记录";

    @property({type:cc.Label,displayName:"红"})
    Red_label: cc.Label = null;

	@property({type:cc.Label,displayName:"黑"})
    Black_label: cc.Label = null;


	@property({type:cc.Node,displayName:"模版"})
    m_LayoutMode: cc.Node = null;

	@property({type:cc.ScrollView,displayName:"视窗"})
    m_ScrollView: cc.ScrollView = null;

	@property({type:cc.Node,displayName:"红标记"})
    Red_Sprite: cc.Node = null;

	@property({type:cc.Node,displayName:"黑标记"})
    Black_Sprite: cc.Node = null;

	//牌型算法
	m_Compare:Compare = new Compare(); 

	m_ItemRecord = []

	m_RecordData = []

	m_CountRecord = [0,0]  //  dra :1   tig:2  

	m_ScrollviewLayout = null

	m_RedPool = null
	m_BalckPool = null

	onLoad(){
		this.m_ScrollviewLayout = new ScrollviewLayout()
	
		this.m_RedPool = new cc.NodePool();
		this.m_BalckPool = new cc.NodePool();
		let initCount = 100;
		
		for (let i = 0; i < initCount; ++i) {
			let  enemy = cc.instantiate(this.Red_Sprite)
			this.m_RedPool.put(enemy);

			enemy = cc.instantiate(this.Black_Sprite)
			this.m_BalckPool.put(enemy);
		}

		
	}


	createRedPool() {
		let enemy = null;
		if (this.m_RedPool.size() > 0) { 
			enemy = this.m_RedPool.get();
		} 
		else { 
			enemy = cc.instantiate(this.Red_Sprite);
		}
		return enemy
	}

	createBlackPool() {
		let enemy = null;
		if (this.m_BalckPool.size() > 0) { 
			enemy = this.m_BalckPool.get();
		} 
		else { 
			enemy = cc.instantiate(this.Black_Sprite);
		}
		return enemy
	}




	fucGameresult(data){
		//获取开奖结果
		let result =  data.LotteryOpen.split(",");
		let GameCardsData = []
		let cardValue = []
		for (let index = 0; index < 10; index++) {
			// let  element = Number(result[index])
			// let  Color =  Number(result[ 10 + index])
			cardValue[index] =  Number(result[index]) +  ( Number(result[ 10 + index]) -1)*13
		}
		GameCardsData =cardValue//cardValue.reverse()

		let  cards = []
		let Cardresult = [0,0]
		for (let index = 0; index < 5; index++) {
			cards[index] = GameCardsData[index];	
		}
		Cardresult[0] = this.m_Compare.getType(cards)
		cards = []
		for (let index = 5; index < 10; index++) {
			cards[index-5] = GameCardsData[index];
			
		}
		Cardresult[1] = this.m_Compare.getType(cards)

		let n_result = this.fucGetWinTarget(Cardresult,GameCardsData)

		return n_result
	}

	//扑克比大小
	fucGetWinTarget(Cardresult,GameCardsData){
		if (Cardresult[0] == Cardresult[1]) {
			let  cards_1 = []
			for (let index = 0; index < 5; index++) {
				cards_1[index] = GameCardsData[index];	
			}
			let  cards_2 = []
			for (let index = 5; index < 10; index++) {
				cards_2[index-5] = GameCardsData[index];
			}

			//高牌
			if ( Cardresult[0]== 0) {
				return this.m_Compare.fucBankCompare(cards_1,cards_2)
			}

			//对子  两对    找出最大对子
			if(Cardresult[0] >= this.m_Compare.PaiType.YD-1  &&  Cardresult[0] <= this.m_Compare.PaiType.TZ -1){
				return this.m_Compare.fucCardRresult(cards_1,cards_2)
			}
			//顺子 同花顺 比较 乌龙(不成牌型)
			if(Cardresult[0] > this.m_Compare.PaiType.SZ -1  &&  Cardresult[0] <= this.m_Compare.PaiType.THS -1 ){
				return this.m_Compare.fucShunZiCompare(cards_1,cards_2)
			}
			//不成牌型 散牌比较
			return this.m_Compare.fucBankCompare(cards_1,cards_2)
		}
		return (Cardresult[0] > Cardresult[1] ) ? 0 : 1
	}
	
	fucWiterData(CardData){
		
		let nCardData = CardData.reverse()  
		for (let index = 0; index < nCardData.length; index++) {
			this.m_RecordData.push(this.fucGameresult(nCardData[index]))
		}
		this.fucUpLabe()

		//创建滚动图
		let self = this
		let n_Result = this.m_ScrollviewLayout.fucDataTongjiToArray(this.m_RecordData,null,function(a,b) {
			return self.fucExactlySame(a ,b)
		})  

		this.m_ScrollviewLayout.initView(this.m_LayoutMode,this.m_ScrollView,n_Result,this.fucupItem.bind(this),true,35)

	}

	fucAddResult(nCardData){
		this.m_RecordData.push(this.fucGameresult(nCardData))
		this.fucUpLabe()
		//追加数据
		let self = this
		let n_Result = this.m_ScrollviewLayout.fucDataTongjiToArray(this.m_RecordData,null,function(a,b) {
			return self.fucExactlySame(a ,b)
		})  
		this.m_ScrollviewLayout.fucupdatainfo(n_Result)
		this.fucblink(this.m_ScrollviewLayout)
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
				if (data[deskindex] == 0) {
					this.m_RedPool.put(element); 
				}else{
					this.m_BalckPool.put(element); 
				}
			}
			
			if (data[deskindex] >= 0) {
				let recordSprite = this.fucGetItem(data[deskindex])
				itemNode.addChild(recordSprite)
			}
		}
		item.active = true
	}

	fucUpLabe(){
		this.m_CountRecord = [0,0] 
		for (let index = 0; index < this.m_RecordData.length; index++) {
			this.m_CountRecord[this.m_RecordData[index]] +=1
		}
		this.Red_label.getComponent(cc.Label).string  = ""+ this.m_CountRecord[0]
		this.Black_label.getComponent(cc.Label).string  = ""+ this.m_CountRecord[1]
	}

	//大小 1大2小3和
	fucGetItem(nValue){
		let recordSprite = null
		if (nValue == 0) {
			recordSprite = cc.instantiate(this.Red_Sprite)
		}else{
			recordSprite = cc.instantiate(this.Black_Sprite)
		}
		recordSprite.setPosition(cc.v2(0,0))
		recordSprite.active = true
		return recordSprite
	}


	//  dra :1   tig:2 
	fucExactlySame(DraValue,TigValue){
		if (DraValue != TigValue) {
			return false
		}
		return true
	}
}