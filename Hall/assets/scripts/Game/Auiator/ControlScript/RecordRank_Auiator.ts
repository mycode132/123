// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import { manager } from "../../../control/engines/GameEngine";
import GameInstInfo from "../../../Public/ControlScript/GameInstInfo";
import SoundMgr from "../../../Public/ControlScript/SoundMgr";


const {ccclass, property} = cc._decorator;

@ccclass
export default class RecordRank extends cc.Component {
	protected className: string = "顶部开奖记录";

	@property({type:cc.PageView,displayName:"视窗"})
    m_PageView: cc.PageView = null;

	@property({type:cc.Node,displayName:"Layout模版"})
    m_LayoutMode: cc.Node = null;

	@property({type:cc.Node,displayName:"Node模版"})
    m_NodeMode: cc.Node = null;

	@property({type:cc.Label,displayName:"提示"})
    m_TipsLab: cc.Label = null;

	@property({type:cc.Node,displayName:"信息层"})
    m_InfoLayer: cc.Node = null;

	//红白模版
	@property({type:[cc.SpriteFrame],displayName:"背景色"})
    m_SpriteMode:cc.SpriteFrame[] = []

	
	m_parent = null
	m_GameResult = []

	onLoad(){
		let self= this
		this.node.getChildByName("sheet_15").setScale(0)
		this.node.getChildByName("BackLayout").off(cc.Node.EventType.TOUCH_END)
		this.node.getChildByName("BackLayout").on(cc.Node.EventType.TOUCH_END,function(){
			this.node.getChildByName("sheet_15").runAction(cc.sequence(cc.scaleTo(0,0.1),cc.callFunc(()=>{
				self.node.active = false
			})) )
		}.bind(this),this)

		this.node.getChildByName("sheet_15").getChildByName("close_but").on(cc.Node.EventType.TOUCH_END,function(){
			SoundMgr.palyButSound()
			this.node.getChildByName("sheet_15").runAction(cc.sequence(cc.scaleTo(0,0.1),cc.callFunc(()=>{
				self.node.active = false
			})) )
		}.bind(this),this)

		this.m_InfoLayer.on(cc.Node.EventType.TOUCH_END,function(){
			self.m_InfoLayer.active = false
		}.bind(this),this)

		//具体信息层
		this.m_InfoLayer.on(cc.Node.EventType.TOUCH_END,function(){
			self.m_InfoLayer.active = false
		}.bind(this),this)

		this.m_InfoLayer.getChildByName("close_but").on(cc.Node.EventType.TOUCH_END,function(){
			SoundMgr.palyButSound()
			self.m_InfoLayer.active = false
		}.bind(this),this)

		this.initChangeImage()

		this.m_PageView.node.on('page-turning', this.callback, this);
	}


 
	 callback() {
		let PagLabel = this.node.getChildByName("sheet_15").getChildByName("PagLabel")
		PagLabel.getComponent(cc.Label).string = `${this.m_PageView.getCurrentPageIndex()+1}/${this.m_PageView.getPages().length}`
	 }

	
	
	//多国语言适配Image
	initChangeImage(){
		//标签
		let n_Recordst =  this.node.getChildByName("sheet_15").getChildByName("sheet_31")
		GameInstInfo.getinstance().fucChangeImage(n_Recordst)
	}

	fucwritedata(){
		if (!this.m_GameResult.length) {
			for (let index = 0; index < 60; index++) {

				//数据待定
				this.m_GameResult.push(5)

			}
		}
	}

	fucUpView(data = []){
		let  val = data.reverse(); 
		this.m_GameResult =JSON.parse(JSON.stringify(val))
		this.fucwritedata()
		this.node.active = true
		this.node.getChildByName("sheet_15").runAction(cc.scaleTo(0.2,1.0))
		this.m_PageView.removeAllPages()
		this.fucAddItem()
		this.m_PageView.scrollToPage(0,0)
		
		let PagLabel = this.node.getChildByName("sheet_15").getChildByName("PagLabel")
		PagLabel.getComponent(cc.Label).string = `${this.m_PageView.getCurrentPageIndex()+1}/${this.m_PageView.getPages().length}`

	}

	fucAddItem(){
		//一页最多32个
		let n_count = Math.round(this.m_GameResult.length/32)
		for (let index = 0; index <n_count; index++) {
			let dataID  = 0
			let layout = cc.instantiate(this.m_LayoutMode)
			for (let z = 0; z < this.m_GameResult.length; z++) {
				const element = this.m_GameResult[dataID];
				let item = this.fucGetItem(element)
				layout.addChild(item)

				dataID +=1
				if (z == 31)break
			}
			this.m_GameResult.splice(0,32)

			layout.active =true
			this.m_PageView.addPage(layout)
		}
	}

	

	fucGetItem(data){
		let Item = cc.instantiate(this.m_NodeMode)
		//Item.getChildByName("Ju_num").getComponent(cc.Label).string = ""+data.gamesnumber
		Item.getChildByName("but_info").on(cc.Node.EventType.TOUCH_END,function(){
			SoundMgr.palyButSound()
			this.fucShowInfo(data)
		}.bind(this),this)
		Item.active = true
		return Item
	}
	
}