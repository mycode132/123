// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {
	//扫雷键盘功能
	@property({type: cc.Label, displayName: '显示数字'})
	m_ShowLabel: cc.Label = null;

	@property({type: cc.Button, displayName: '重新输入'})
	m_Clear: cc.Button = null;

	@property({type: cc.Button, displayName: '完成'})
	m_wancheng: cc.Button = null;

	@property({type: cc.Button, displayName: '删除'})
	m_Del: cc.Button = null;


	m_callbcak = null
	m_parent = null
	m_node = null

	m_lab = ""

    start () {
		let self = this
		for (let index = 0; index < 10; index++) {
			const element = this.node.getChildByName("But_"+index)
			element.on(cc.Node.EventType.TOUCH_END,function() {
				self.m_lab  = self.m_lab + ""+index
				self.m_ShowLabel.string = self.m_lab
			},self)
		}

		self.m_Clear.node.on(cc.Node.EventType.TOUCH_END,function() {
			self.fucClear()
		},self)

		self.m_wancheng.node.on(cc.Node.EventType.TOUCH_END,function() {
			self.fucfinish()
		},self)

		self.m_Del.node.on(cc.Node.EventType.TOUCH_END,function() {
			self.fucDel()
		},self)
		self.fucClear()
    }	


	fucShowNode(callbcak,parent,_node,_lab){
		this.node.active = true
		this.m_parent = parent
		this.m_node = _node
		this.m_callbcak = callbcak
		this.m_lab  = _lab
		if (this.m_lab == "0") {
			this.m_lab = ""
		}
		this.m_ShowLabel.string = this.m_lab
	}

	fucClear(){
		let self = this
		self.m_lab  = ""
		self.m_ShowLabel.string = self.m_lab
	}

	fucDel(){
		let self = this
		self.m_lab  = self.m_lab.slice(0,self.m_lab.length-1)
		self.m_ShowLabel.string = self.m_lab
	}

	fucfinish(){
		const regex =  /^[1-9][0-9]*/
		if (this.m_lab.match(regex)) {
			if (this.m_callbcak) {
				this.m_callbcak(this.m_lab,this.m_node)
			}
			this.fucClear()
		}
		this.node.active = false
	}
}
