// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import GameEngine from "../../../control/engines/GameEngine";
import GameInstInfo from "../../../Public/ControlScript/GameInstInfo";
import SoundMgr from "../../../Public/ControlScript/SoundMgr";

const {ccclass, property} = cc._decorator;

@ccclass
export default class GameExplain extends cc.Component {
	protected className: string = "游戏说明";
   
	@property({type:cc.ScrollView,displayName:"视窗"})
    m_ScrollView: cc.ScrollView = null;

	@property({type:cc.Button,displayName:"关闭"})
    m_ButClose: cc.Button = null;

	m_bInit = false

    init () {
		let self= this
		this.node.getChildByName("sheet_15").setScale(0)
		this.node.active = false
		this.m_ButClose.node.off(cc.Node.EventType.TOUCH_END)
		this.m_ButClose.node.on(cc.Node.EventType.TOUCH_END,function(){
			SoundMgr.palyButSound()
			this.node.getChildByName("sheet_15").runAction(cc.sequence(cc.scaleTo(0,0.1),cc.callFunc(()=>{
				self.node.active = false
			})) )
		}.bind(this),this)

		this.node.off(cc.Node.EventType.TOUCH_END)
		this.node.on(cc.Node.EventType.TOUCH_END,function(){
			this.node.getChildByName("sheet_15").runAction(cc.sequence(cc.scaleTo(0,0.1),cc.callFunc(()=>{
				self.node.active = false
			})) )
		}.bind(this),this)

		let n_Recordst =  this.node.getChildByName("sheet_15").getChildByName("sheet_31")
		GameInstInfo.getinstance().fucPublicImage(n_Recordst)
		let Language = GameEngine.m_services.i18nSrv.getI18nSetting()
		if (this.m_ScrollView.content.getChildByName("Layout_"+Language)) {
			this.m_ScrollView.content.getChildByName("Layout_"+Language).active = true
		}else{
			this.m_ScrollView.content.getChildByName("Layout_0").active = true
		}

		self.m_bInit = true
	}

	fucUpView(){
		if (!this.m_bInit) {
			this.init()
		}
		this.node.active = true
		this.node.getChildByName("sheet_15").runAction(cc.scaleTo(0.3,1.0))
	}
}
