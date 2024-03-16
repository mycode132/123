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

    @property({type:cc.Label,displayName:"大"})
    hu_label: cc.Label = null;

	@property({type:cc.Label,displayName:"小"})
    long_label: cc.Label = null;


	@property({type:cc.Node,displayName:"模版"})
    m_LayoutMode: cc.Node = null;

	@property({type:cc.ScrollView,displayName:"第二视窗"})
    m_ScrollViewSize: cc.ScrollView = null;
	m_ItemRecord = [] //Item
	

	@property({type:cc.ScrollView,displayName:"第一视窗"})
    m_ScrollViewDanShuang: cc.ScrollView = null;
	m_TongjiItem = [] //Item

	@property({type:cc.Node,displayName:"数据显示层"})
    m_LabLayout: cc.Node = null;

	@property({type:cc.Node,displayName:"大小模版"})
    m_SizeSprite: cc.Node = null;

	@property({type:cc.Node,displayName:"显示模版"})
    m_DanshuangSprite: cc.Node = null;

	m_RecordData = []  //大小和
	m_SDData = []  //单双结果

	m_CountRecord = [0,0,0]  //  小 :1   大:2   和:3    数目
	m_GameResult = []  //游戏结果

	//结果   几个  单双
	m_Result ={
		mValue:0,
		Type:1,
		nSize:0  //大小
	}


	m_ScrollviewLayout_1 = null
	m_ScrollviewLayout_2 = null

	m_Danshuang = null
	m_SizePllo = null
	onLoad(){
		
	
		this.m_Danshuang = new cc.NodePool();
		this.m_SizePllo = new cc.NodePool();
		let initCount = 1000;
		
		for (let i = 0; i < initCount; ++i) {
			let  enemy = cc.instantiate(this.m_DanshuangSprite)
			this.m_Danshuang.put(enemy);

			enemy = cc.instantiate(this.m_SizeSprite)
			this.m_SizePllo.put(enemy);
		}

		this.m_ScrollviewLayout_1 = new ScrollviewLayout()
		this.m_ScrollviewLayout_2 = new ScrollviewLayout()
	}


	createTongji() {
		let enemy = null;
		if (this.m_Danshuang.size() > 0) { 
			enemy = this.m_Danshuang.get();
		} 
		else { 
			enemy = cc.instantiate(this.m_DanshuangSprite);
		}
		return enemy
	}

	createSize() {
		let enemy = null;
		if (this.m_SizePllo.size() > 0) { 
			enemy = this.m_SizePllo.get();
		} 
		else { 
			enemy = cc.instantiate(this.m_SizeSprite);
		}
		return enemy
	}



    start () {
		
		
		this.initChangeImage()
    }


	//多国语言适配Image
	initChangeImage(){
		let btnInning = this.node.getChildByName('image_Node');   //大小和
		let element = null
		for (let index = 5; index < 9; index++) {
			element = btnInning.getChildByName("sheet_"+index)
			GameInstInfo.getinstance().fucChangeImage(element)
		}
	}

	//  小 :1   大:2  
	fuccompareCard(Value){
		if (Value > 2 ) {
			return 2
		}
		return 1
	}

	//单双  1  2  3  4
	fucSingleDouble(Value){
		let n_Result = JSON.parse(JSON.stringify(this.m_Result))
		n_Result.mValue = Value
		n_Result.Type = Value%2==0? 1:2  //1双2单
		n_Result.nSize = Value >2 ? 1:2  //1大2小
		return n_Result
	}

	

	fucInitData(nData){
		
		let  val = nData.reverse(); 
		this.m_GameResult =JSON.parse(JSON.stringify(val))
		this.m_RecordData = []
		this.m_SDData= []
		
		for (let index = 0; index < this.m_GameResult.length; index++) {
			this.m_RecordData.push(this.fuccompareCard(Number(this.m_GameResult[index].LotteryOpen) ))
			this.m_SDData.push(this.fucSingleDouble(Number(this.m_GameResult[index].LotteryOpen) ))
		}
		
		//1创建滚动图
		let self = this
		let n_Result =this.m_ScrollviewLayout_1.fucDataTongjiToArray(this.m_RecordData,null,function(a,b) {
			return self.fucExactlySame(a ,b)
		})  
		this.m_ScrollviewLayout_1.initView(this.m_LayoutMode,this.m_ScrollViewSize,n_Result,this.fucupItem_1.bind(this),true,35)

		//2创建滚动图
		n_Result = this.m_ScrollviewLayout_2.fucDataTongjiToArray(this.m_SDData,null,function(a,b) {
			return a.Type == b.Type
		})  
		this.m_ScrollviewLayout_2.initView(this.m_LayoutMode,this.m_ScrollViewDanShuang,n_Result,this.fucupItem_2.bind(this),true,35)

		this.fucUpLabe()  

		this.fucCalculateData()
	}

	fucWiterData(nCardData){
		let LotteryOpen = Number(nCardData.LotteryOpen)
		this.m_RecordData.push(this.fuccompareCard(LotteryOpen))
		this.m_SDData.push(this.fucSingleDouble(LotteryOpen))

		//1追加数据
		let self = this
		let n_Result = this.m_ScrollviewLayout_1.fucDataTongjiToArray(this.m_RecordData,null,function(a,b) {
			return self.fucExactlySame(a ,b)
		})  
		
		this.m_ScrollviewLayout_1.fucupdatainfo(n_Result)
		this.fucblink(this.m_ScrollviewLayout_1)

		//2
		n_Result = this.m_ScrollviewLayout_2.fucDataTongjiToArray(this.m_SDData,null,function(a,b) {
			return a.Type == b.Type
		})  
	
		this.m_ScrollviewLayout_2.fucupdatainfo(n_Result)
		this.fucblink(this.m_ScrollviewLayout_2)
		
		this.fucUpLabe()  
		this.fucCalculateData()
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
		if (this.m_ScrollviewLayout_1) {
			this.m_ScrollviewLayout_1.update(dt)
		}

		if (this.m_ScrollviewLayout_2) {
			this.m_ScrollviewLayout_2.update(dt)
		}
    }

	fucupItem_1(item,data){
		for (let deskindex = 0; deskindex < 6; deskindex++) {
			let itemNode = item.getChildByName("desk"+deskindex)
			//itemNode.removeAllChildren()

			//itemNode.destroyAllChildren()
			for (let index = 0; index < itemNode.children.length; index++) {
				let  element = itemNode.children[index];
				this.m_SizePllo.put(element); 
			}
			
			if (data[deskindex] >= 0) {
				let recordSprite = this.fucGetItem(data[deskindex])
				itemNode.addChild(recordSprite)
			}
		}
		item.active = true
	}

	fucupItem_2(item,data){
		for (let deskindex = 0; deskindex < 6; deskindex++) {
			let itemNode = item.getChildByName("desk"+deskindex)
			//itemNode.removeAllChildren()

			//itemNode.destroyAllChildren()
			for (let index = 0; index < itemNode.children.length; index++) {
				let  element = itemNode.children[index];
				this.m_Danshuang.put(element); 
			}
		
			if (data[deskindex] && data[deskindex].mValue >= 0) {
				let recordSprite = this.fucCloneItem(data[deskindex].mValue)
				itemNode.addChild(recordSprite)
			}
		}
		item.active = true
	}

	//大小 1小2大
	fucGetItem(nValue){
		let recordSprite =this.createSize()// cc.instantiate(this.m_SizeSprite)
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
			let  n_data = this.m_RecordData[index];
			this.m_CountRecord[n_data-1] +=1
		}

		this.hu_label.getComponent(cc.Label).string  = ""+ this.m_CountRecord[1]
		this.long_label.getComponent(cc.Label).string  = ""+ this.m_CountRecord[0]
	}

	// 
	fucExactlySame(DraValue,TigValue){
		if (DraValue != TigValue) {
			return false
		}
		return true
	}

	//单双
	fucCloneItem(nValue){
		let recordSprite = this.createTongji()//cc.instantiate(this.m_DanshuangSprite)
		const path = 'Game/ColorDish/resources/loadRes/img/game/Sedie';
		let Imagename = `img_content_1_${nValue}`
		if (nValue%2 == 0) {
			Imagename= `img_content_2_${nValue}`
		}
		manager().resourceMgr.loadPlistImage(recordSprite,path,Imagename);
		recordSprite.setPosition(cc.v2(0,0))
		recordSprite.active = true
		return recordSprite
	}

	fucCalculateData(){
		let layoutMode= this.node.getChildByName("lab_Layout")
		let n_data = JSON.parse(JSON.stringify(this.m_SDData))
		let nShowData = [0,0,0,0,0,0,0,0,0]  //0-4红   5-6  单双   7-8  大小
		let element = null
		for (let index = 0; index < n_data.length; index++) {
			element = n_data[index];
			nShowData[element.mValue - 1] +=1
			if (element.Type == 2) {
				nShowData[4] += 1
			}else{
				nShowData[5] += 1
			}
			if (element.nSize == 1) {
				nShowData[6] += 1
			}else{
				nShowData[7] += 1
			}
		}

		let lab = layoutMode.getChildByName("lab_red_0")
		lab.getComponent(cc.Label).string = "" +nShowData[0]

		lab = layoutMode.getChildByName("lab_red_1")
		lab.getComponent(cc.Label).string = "" +nShowData[1]

		lab = layoutMode.getChildByName("lab_red_2")
		lab.getComponent(cc.Label).string = "" +nShowData[2]

		lab = layoutMode.getChildByName("lab_red_3")
		lab.getComponent(cc.Label).string = "" +nShowData[3]

		// //单双
		lab = layoutMode.getChildByName("lab_red_4")
		lab.getComponent(cc.Label).string = "" +nShowData[4]

		lab = layoutMode.getChildByName("lab_red_5")
		lab.getComponent(cc.Label).string = "" +nShowData[5]

		// //大小
		lab = layoutMode.getChildByName("lab_red_6")
		lab.getComponent(cc.Label).string = "" +nShowData[6]

		lab = layoutMode.getChildByName("lab_red_7")
		lab.getComponent(cc.Label).string = "" +nShowData[7]
	}
}
