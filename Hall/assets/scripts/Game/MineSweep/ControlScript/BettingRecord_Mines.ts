// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import GameInstInfo from "../../../Public/ControlScript/GameInstInfo";

const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {
  
    @property({type:cc.ScrollView,displayName:"视窗"})
    m_ScrollView: cc.ScrollView = null;

	@property({type:cc.Node,displayName:"模版"})
    m_LayoutMode: cc.Node = null;

	@property({type:cc.Node,displayName:"信息层"})
    m_InfoLayer: cc.Node = null;

	m_loagIndex = 0
	m_RecordData = []
	m_GameResult = []

    start () {

		let self= this

		this.node.getChildByName("sheet_15").getChildByName("close_but").on(cc.Node.EventType.TOUCH_END,function(){
			
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
			
			self.m_InfoLayer.active = false
		}.bind(this),this)

		this.m_ScrollView.node.on('scrolling', this.onScrolling, this);

    }

	fucUpView(data){
		//手动排序
		data.sort(function(a,b){
			return ( Number(b.IssueNo)  - Number(a.IssueNo) );
		});

		this.m_GameResult = data
		this.fucwritedata()
		this.fucAddItem()
		this.m_ScrollView.scrollToTop()

	}

	fucwritedata(){
		// this.m_RecordData = []
		// for (let index = 0; index < this.m_GameResult.length; index++) {
		// 	let n_data = JSON.parse(JSON.stringify(this.m_data))
		// 	n_data.gamesnumber = this.m_GameResult[index].IssueNo

		// 	let n_result =  this.fucGameresult(this.m_GameResult[index])
		// 	n_data.Card=n_result[0]
		// 	n_data.type =n_result[1]
		// 	this.m_RecordData.push(n_data)	
		// } 
	}

	onScrolling() {
        let offset = this.m_ScrollView.getScrollOffset();
        let maxOffset = this.m_ScrollView.getMaxScrollOffset();
        let percentY = offset.y / maxOffset.y;

		//动态加载
		if (percentY >= 0.95  && this.m_loagIndex < this.m_RecordData.length) {
			this.fucAddItem()
		}
    }



	fucAddItem(){
		for (let index = this.m_loagIndex; index < (this.m_loagIndex+10); index++) {
			if (this.m_RecordData[index]) {
				let  n_data = this.m_RecordData[index]
				let  item = this.fucSetItemInfo(n_data)
				this.m_ScrollView.content.addChild(item)
			}
		}
		this.m_loagIndex += 10
		if (this.m_RecordData.length > 8) {
			this.m_ScrollView.content.setContentSize(cc.size(this.m_LayoutMode.getContentSize().width,this.m_LayoutMode.getContentSize().height*this.m_loagIndex))
		}
	}

	fucSetItemInfo(data){
		
		let Item = cc.instantiate(this.m_LayoutMode)
		let pair = data.gamesnumber.slice(4);

		Item.getChildByName("Ju_num").getComponent(cc.Label).string = Number(pair) +""

		let self = this
		Item.getChildByName("but_info").on(cc.Node.EventType.TOUCH_END,function(){
			
			//self.fucShowInfo(data,n_result)
		}.bind(this),this)
		Item.active = true
		return Item
	}

	fucShowInfo(data,result){
		this.m_InfoLayer.active = true
		this.m_InfoLayer.opacity = 0
		
		this.m_InfoLayer.runAction(cc.repeat(cc.sequence(cc.delayTime(0.01),cc.callFunc(()=>{
			this.m_InfoLayer.opacity = this.m_InfoLayer.opacity+2 <= 255 ? this.m_InfoLayer.opacity+2 :255
		})),127))
	}
}
