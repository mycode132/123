// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import SoundMgr from "../../../Public/ControlScript/SoundMgr";
import BezierLine from "../../../Public/Module/BezierLine";
import GameInfo from "./GameInfoAuiator";

const {ccclass, property} = cc._decorator;

@ccclass
export default class AnimationControl extends cc.Component {
	protected className: string = "动画控制器";

	@property({type: cc.Node, displayName: '时间节点'})
	TimeRoot: cc.Node = null;

	@property({type: cc.Node, displayName: '距离节点'})
	DisRoot: cc.Node = null;

	@property({type: cc.Node, displayName: '距离模版长节点'})
	ModeDisC: cc.Node = null;
	@property({type: cc.Node, displayName: '距离模版短节点'})
	ModeDisD: cc.Node = null;

	@property({type: cc.Node, displayName: '模版节点'})
	ModeRoot: cc.Node = null;

	@property({type: cc.Node, displayName: '线上模版'})
	ModeDis: cc.Node = null;

	@property({ type:sp.Skeleton ,displayName:"开始" })//开始下注  停止下注 倒计时
    Startspine: sp.Skeleton | null = null;




	m_ctx = null

	m_TimeNode = []
	m_DisNode = []
	m_Rocketnose

	TimeDot = 0

	startPos = null
	huojianstartPos:cc.Vec2 = null
	dt_time = 0


	m_CallBcak = null
	m_callbackfuc = null
	m_StartCallback = null
	m_StopDeskScore = null   //停止桌面计分

	m_DotPath = []

	m_startId = 40

	m_DisLab = 1.0
	m_Disspeep = 1.0 //移速度

	m_qishidianshu = 20  //曲线起始点数
	//移动数据
	m_psidata = {
		pos1:cc.v2(310,340),
		pos2:cc.v2(410,170),
		pos3:cc.v2(650,130),

	
		fieldloca:30,     //线路上的点数         
		startpos:0        //画线起始点
	}

    start () {
		this.Startspine.setCompleteListener(function(){
			if (this.m_StartCallback && this.Startspine.node.active) {
				this.m_StartCallback()
			}
			this.Startspine.node.active = false
		}.bind(this))
    }

	//start
	fucPlayStart(is_loop = false){
		this.Startspine.node.active = true
		this.Startspine.setAnimation(0, "animation", is_loop)
	}

	
	fucSetCallback(Callback){
		this.m_StartCallback = Callback
	}

	
	fucSetCallBack(callback){
		this.m_callbackfuc = callback
	}

	fucStopDeskScore(callback){
		this.m_StopDeskScore = callback
	}

	fucInit(){
		
		this.m_Rocketnose = this.node.getChildByName("aircraft")
		this.huojianstartPos = this.m_Rocketnose.getPosition()
		let line = this.node.getChildByName("line")
		this.startPos =  line.getPosition()
		this.m_ctx = line.getComponent(cc.Graphics);
		//初始化生成30个节点
		line.removeAllChildren()
		
		this.fucStopAction()
	}
	fucClear(){
		this.TimeRoot.removeAllChildren()

		this.DisRoot.stopAllActions()
		this.DisRoot.removeAllChildren()
		this.m_TimeNode = []
		this.m_DisNode = []

		this.m_startId = 40
		this.m_qishidianshu = 5

	}

	//小火箭头开始动作
	fucPlayAction(){
		this.m_Rocketnose.stopAllActions()
		this.m_Rocketnose.setPosition(this.huojianstartPos.x,this.huojianstartPos.y)
		
		this.fucAirplaneAin()

		//this.schedule(this.fucMapAction, 3, cc.macro.REPEAT_FOREVER, 2)

		//this.schedule(this.fucShowTimeAction, 1, cc.macro.REPEAT_FOREVER, 1)

		//this.fucinitTimeDis()
	}

	//三个点 
	fucAirplaneAin(){

		this.schedule(this.fucUpdata, 1/60, cc.macro.REPEAT_FOREVER, 0)

		let n_psidata = JSON.parse(JSON.stringify(this.m_psidata))
		this.m_Rocketnose.runAction(cc.repeatForever(cc.spawn(cc.callFunc(()=>{
			//实时检测
			
		}),cc.sequence( cc.moveTo(3.0,n_psidata.pos1).easing(cc.easeInOut(3.0)),
						cc.moveTo(3.0,n_psidata.pos2).easing(cc.easeInOut(3.0)),
						cc.moveTo(3.0,n_psidata.pos1).easing(cc.easeInOut(3.0)),
						cc.moveTo(3.0,n_psidata.pos3).easing(cc.easeInOut(3.0))
						))))

	}

	fucStopAction(){
		this.unschedule(this.fucUpdata)
		this.unschedule(this.fucShowTimeAction)

		this.fucClear()

		this.m_Rocketnose.stopAllActions()
		this.m_Rocketnose.setScale(0.35)
		
		this.schedule(function(){
			this.m_Rocketnose.setPosition(this.huojianstartPos.x,this.huojianstartPos.y)
			this.m_Rocketnose.active = true
			this.m_Rocketnose.runAction(cc.repeatForever(cc.sequence(cc.moveBy(0.3,cc.v2(0,-10)),cc.moveBy(0.3,cc.v2(0,10)))))
		}, 0.01, cc.macro.ONE, 2)

		//桌面停止倒计时
		this.m_StopDeskScore && this.m_StopDeskScore()

		if (this.m_callbackfuc) {
			this.m_callbackfuc()
		}
		
	}


	//待改   两点运动   
	fucUpdata(dt){
		let psidata =JSON.parse(JSON.stringify(this.m_psidata)) 
	
		let abs_x = Math.abs(this.m_Rocketnose.getPosition().x-this.startPos.x)/3*2   // 两点横坐标相减绝对值/2
        let abs_y = Math.abs(0)  // 两点横坐标相减绝对值/2

		let controlpoint = cc.v2(abs_x,abs_y)
		this.m_ctx.clear();
		this.m_ctx.lineWidth = 10;
		this.m_ctx.strokeColor =  cc.Color.RED;
		this.m_ctx.moveTo(psidata.startpos, 0);

		let n_EndPos =[this.m_Rocketnose.getPosition().x-this.startPos.x,
						this.m_Rocketnose.getPosition().y -this.startPos.y]

		let  anchorpoints = [[psidata.startpos, 0],[controlpoint.x,controlpoint.y],n_EndPos]
		
		let fieldloca = (this.m_Rocketnose.x - 50)/5//psidata.fieldloca
		let path =  BezierLine.CreateBezierPoints(anchorpoints,fieldloca)
		for (let index = 0; index < path.length; index++) {
			this.m_ctx.lineTo(path[index][0], path[index][1])
		}
		this.m_ctx.stroke();
		
		//填充区域
		this.m_ctx.lineWidth = 6;
		this.m_ctx.strokeColor =  new cc.Color(255, 100, 100,125);
		for (let index = 0; index < path.length; index++) {
			this.m_ctx.rect(path[index][0], 0,1,path[index][1]-2)
		}

		
		this.m_ctx.stroke();

		if (GameInfo.getinstance().m_Currentmultiple >= 200) {
		
			this.dt_time = 0
			this.m_ctx.clear();
			//
			this.fucStopAction()
		}
	}

	//地图块缩放动作  隔一定时间插入最大值

	fucinitTimeDis(){
		this.TimeDot  =0
		for (let index = 0; index < 2; index++) {
			let Time = cc.instantiate(this.ModeRoot) 
			Time.active = true
			Time.getChildByName("ExpLab").getComponent(cc.Label).string = `${index}s`
			Time.setPosition(cc.v2(this.TimeRoot.getContentSize().width/2 *index,0))
			this.TimeRoot.addChild(Time)
			this.m_TimeNode.push(Time)
			this.TimeDot  +=1
		}


		this.m_DisLab = 1.00   //
		let Spacx = 60
		let count = this.DisRoot.getContentSize().width /Spacx
		for (let index = 0; index < Math.round(count); index++) {
			let DisItem = cc.instantiate(this.ModeDisD) 
			if (index%2 == 0) {
				DisItem = cc.instantiate(this.ModeDisC) 
			}
			DisItem.active = true
			DisItem.getChildByName("ExpLab").getComponent(cc.Label).string = this.m_DisLab.toFixed(2)
			DisItem.setPosition(cc.v2(index * Spacx,0))
			this.DisRoot.addChild(DisItem)
			this.m_DisNode.push(DisItem)
			this.m_DisLab += 0.20
		}
	}


	fucMoveDisLayout(){
		this.m_Disspeep = 1.7 //移速度
		let self = this

		let n_Action = cc.callFunc(()=>{
			let DisItem = cc.instantiate(self.ModeDisD) 
			if (self.m_DisNode.length %2 == 0) {
				DisItem = cc.instantiate(self.ModeDisC) 
			}

			DisItem.active = true
			DisItem.getChildByName("ExpLab").getComponent(cc.Label).string = self.m_DisLab.toFixed(2)
			DisItem.setPosition(cc.v2(650,0))
			self.m_DisLab += 0.20
			self.DisRoot.addChild(DisItem)
			self.m_DisNode.push(DisItem)
			for (let index = 1; index < self.m_DisNode.length; index++) {
				const element = self.m_DisNode[index];
				
				element.runAction(cc.moveTo(self.m_Disspeep,cc.v2((self.DisRoot.getContentSize().width/self.m_DisNode.length)* index ,0)))
				if ( GameInfo.getinstance().m_Currentmultiple/100 > 2 && index%2 != 0   && index  < self.m_DisNode.length - 1) {
					element.stopAllActions()
					element.active = false
				}

				if ( GameInfo.getinstance().m_Currentmultiple/100 > 4 && index%3!= 0   && index  < self.m_DisNode.length - 1) {
					element.stopAllActions()
					element.active = false
				}

				if ( GameInfo.getinstance().m_Currentmultiple/100 > 6 && index%4!= 0   && index  < self.m_DisNode.length - 1) {
					element.stopAllActions()
					element.active = false
				}
			}
		})

		this.DisRoot.runAction(cc.sequence(n_Action,cc.delayTime(self.m_Disspeep),cc.callFunc(()=>{
			this.DisRoot.stopAllActions()
			//this.fucMoveDisLayout()
		})))
	}

	//时间距离按比例移动
	fucShowTimeAction(){
		let Time = cc.instantiate(this.ModeRoot) 
		Time.active = true
		Time.getChildByName("ExpLab").getComponent(cc.Label).string = `${this.TimeDot }s`
		Time.setPosition(cc.v2(this.TimeRoot.getContentSize().width,0))

		this.TimeRoot.addChild(Time)
		this.m_TimeNode.push(Time)
		for (let index = 0; index < this.m_TimeNode.length; index++) {
			let  element = this.m_TimeNode[index];
			element.stopAllActions()
			
			element.runAction(cc.moveTo(1.0,cc.v2((this.TimeRoot.getContentSize().width/(this.m_TimeNode.length + 1))* index ,0)))
		
			if (this.m_TimeNode.length  > 30  && index%8 != 0 ) {
				element.active = false
			}
			if (this.m_TimeNode.length  > 20  && index%4 != 0 ) {
				element.active = false
			}
			if (this.m_TimeNode.length  > 10  && index%2 != 0 ) {
				element.active = false
			}
		}
		this.TimeDot +=1
	}
}