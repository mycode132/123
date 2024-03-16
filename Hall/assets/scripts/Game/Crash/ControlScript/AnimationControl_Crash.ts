// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import SoundMgr from "../../../Public/ControlScript/SoundMgr";
import BezierLine from "../../../Public/Module/BezierLine";
import GameInfo from "./GameInfo";

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

	@property({ type:sp.Skeleton ,displayName:"提示" })//
    Tipsspine: sp.Skeleton | null = null;

	@property({ type:sp.Skeleton ,displayName:"爆炸" })//
    Boomspine: sp.Skeleton | null = null;

	@property({ type:sp.Skeleton ,displayName:"下注筹码" })//
    Chippine: sp.Skeleton | null = null;
	
	m_ctx = null
	m_TimeNode = []
	m_DisNode = []
	m_Rocketnose = null

	TimeDot = 0

	startPos = null
	huojianstartPos:cc.Vec2 = null
	dt_time = 0

	m_callbackfuc = null
	m_StartCallback = null
	m_StopDeskScore = null   //停止桌面计分

	m_DotArray = []
	m_DotPath = []

	m_DisLab = 1.0
	m_Disspeep = 1.0 //移速度

	m_qishidianshu = 5  //曲线起始点数
	//移动数据
	m_psidata = {
		TempPosX : 520,
		TempendPosX : 740,
		endPosX : 780,
		endPosY : 100,
		endangle : 170,
		startangle : 90,
		startContol :250,   //控制点起始X坐标
		EndContol :780,		 //控制点结束X坐标
		fieldloca:30,     //线路上的点数         
		startpos:50        //画线起始点
	}

    start () {
		this.Startspine.setCompleteListener(function(){
			this.Startspine.node.active = false
			if (this.m_StartCallback) {
				this.m_StartCallback()
			}
		}.bind(this))
		this.Tipsspine.setCompleteListener(function(){
			this.Tipsspine.node.active = false
		}.bind(this))

		this.Chippine.setCompleteListener(function(){
			this.Chippine.node.active = false
		}.bind(this))

		this.Boomspine.setCompleteListener(function(){
			this.Boomspine.node.active = false
			this.m_Rocketnose.active = false
		
		}.bind(this))
		//隐藏动画
		//this.node.opacity = 0
    }

	//start
	fucPlayStart(is_loop = false){
		this.Startspine.node.active = true
		this.Startspine.setAnimation(0, "animation", is_loop)
	}

	fucPlayChip(is_loop = false){
		this.Chippine.node.active = true
		this.Chippine.setAnimation(0, "animation", is_loop)
	}

	fucPlayBoom(is_loop = false){
		this.Boomspine.node.active = true
		this.Boomspine.setAnimation(0, "animation", is_loop)
		this.m_Rocketnose.getChildByName("CrashNode").active = false
	}

	fucSetCallback(Callback){
		this.m_StartCallback = Callback
	}

	fucPlayTips(skinId,is_loop = false){
		let skins = ["1","2","3","4","5","6"]
		this.Tipsspine.node.active = true
		this.Tipsspine.setAnimation(0, skins[skinId], is_loop)
	}

	fucSetCallBack(callback){
		this.m_callbackfuc = callback
	}

	fucStopDeskScore(callback){
		this.m_StopDeskScore = callback
	}

	fucInit(){
		this.m_Rocketnose = this.node.getChildByName("Map").getChildByName("img_crash_rocket")
		this.huojianstartPos = this.m_Rocketnose.getPosition()
		let line = this.node.getChildByName("Map").getChildByName("line")
		this.startPos =  line.getPosition()
		this.m_ctx = line.getComponent(cc.Graphics);
		//初始化生成30个节点
		line.removeAllChildren()
		this.m_DotArray = []
		for (let index = 0; index < 500; index++) {
			let sp = cc.instantiate(this.ModeDis)
			sp.active = false
			sp.setPosition(cc.v2(0,0))
			line.addChild(sp)
			this.m_DotArray.push(sp)
		}
		this.fucStopAction()
	}
	fucClear(){
		this.TimeRoot.removeAllChildren()

		this.DisRoot.stopAllActions()
		this.DisRoot.removeAllChildren()
		this.m_TimeNode = []
		this.m_DisNode = []
		this.m_qishidianshu = 5

		this.m_TimeId = -1
		this.m_TimeIndex = 0

		for (let index = 0; index < this.m_DotArray.length; index++) {
			let sp = this.m_DotArray[index]
			sp.stopAllActions()
			sp.active = false
			sp.setPosition(cc.v2(0,0))
		}
	}

	//小火箭头开始动作
	fucPlayAction(){
		this.m_Rocketnose.stopAllActions()
		this.m_Rocketnose.setPosition(this.huojianstartPos.x,this.huojianstartPos.y)
		this.m_Rocketnose.runAction(cc.sequence(cc.delayTime(0.0), cc.scaleTo(8.0,1)))
		this.schedule(this.fucUpdata, 2/60, cc.macro.REPEAT_FOREVER, 0)  
		this.fucinitTimeDis()
	}

	fucStopAction(){
		this.unschedule(this.fucUpdata)
		this.fucClear()
		this.m_Rocketnose.setScale(0.6)
		this.schedule(function(){
			this.m_Rocketnose.setPosition(this.huojianstartPos.x,this.huojianstartPos.y)
			this.m_Rocketnose.angle = 90
			this.m_Rocketnose.getChildByName("CrashNode").active = true
			this.m_Rocketnose.active = true
			this.m_Rocketnose.runAction(cc.repeatForever(cc.sequence(cc.moveBy(0.3,cc.v2(0,-10)),cc.moveBy(0.3,cc.v2(0,10)))))
		}, 0.01, cc.macro.ONE, 2)
		//桌面停止倒计时
		this.m_StopDeskScore && this.m_StopDeskScore()
		if (this.m_callbackfuc) {
			this.m_callbackfuc()
		}
	}

	fucUpdata(dt){
		this.dt_time += dt
		let psidata =JSON.parse(JSON.stringify(this.m_psidata)) 
		let abs_x = Math.abs(this.m_Rocketnose.getPosition().x-this.startPos.x)   // 两点横坐标相减绝对值/2
        let abs_y = Math.abs(this.m_Rocketnose.getPosition().y -this.startPos.y)  // 两点横坐标相减绝对值/2
		if (this.m_Rocketnose.x + 40 < psidata.TempPosX) {
			this.m_Rocketnose.x += 40
			this.m_Rocketnose.y += 1
			//这个地方要产生两个
		}else{
			if (this.m_Rocketnose.x + 0.5 < psidata.TempendPosX) {
				this.m_Rocketnose.x += 0.5
			}else if(this.m_Rocketnose.x + 0.3 < psidata.endPosX){
				this.m_Rocketnose.x += 0.2
			}

			if (this.m_Rocketnose.angle + 0.1 < psidata.endangle) {
				this.m_Rocketnose.angle += 0.12
			}
			if (this.m_Rocketnose.y + 1 < 130) {
				this.m_Rocketnose.y += 0.5
			}
			else if (this.m_Rocketnose.y + 1 < psidata.endPosY) {
				this.m_Rocketnose.y += 0.1
			}
			abs_x = Math.abs(psidata.startContol + ((psidata.EndContol - psidata.startContol)/(psidata.endangle - psidata.startangle))*Math.abs(90 - this.m_Rocketnose.angle ))   // 两点横坐标相减绝对值/2    720
        	abs_y = Math.abs(0)  // 两点横坐标相减绝对值/2
		}

		let controlpoint = cc.v2(abs_x,abs_y)
		this.m_ctx.clear();
		this.m_ctx.lineWidth = 10;
		this.m_ctx.strokeColor =  cc.Color.GREEN;
		this.m_ctx.moveTo(psidata.startpos, 0);
		
		let  anchorpoints = [[psidata.startpos, 0],[controlpoint.x,controlpoint.y],[this.m_Rocketnose.getPosition().x-this.startPos.x,this.m_Rocketnose.getPosition().y -this.startPos.y]]
		
		let fieldloca = Math.floor((this.m_Rocketnose.x - 50)/this.m_qishidianshu)
		let path =  BezierLine.CreateBezierPoints(anchorpoints,fieldloca)
		for (let index = 0; index < path.length; index++) {
			this.m_ctx.lineTo(path[index][0], path[index][1])
		}

		fieldloca = Math.floor((this.m_Rocketnose.x + 50)/this.m_qishidianshu)
		
		if (GameInfo.getinstance().m_Currentmultiple/100 > 100) {
			fieldloca = Math.floor((this.m_Rocketnose.x + 50)/2)
		}
		this.m_DotPath =  BezierLine.CreateBezierPoints(anchorpoints,fieldloca)
		this.fucShowTimeAction()

		this.fucCheck(JSON.parse(JSON.stringify(this.m_DotPath)))

		this.m_ctx.stroke();

		if (GameInfo.getinstance().m_Currentmultiple >= 65000) {
			this.fucPlayBoom()  //爆炸
			this.dt_time = 0
			this.m_ctx.clear();
			//
			this.fucStopAction()
		}
	}

	m_TimeId = -1
	fucCheck(path){
		let  self= this
		// &&  Math.floor(this.dt_time)%3 ==0 
		let  bCan = false
		if (Math.floor(this.dt_time) > 0 && Math.floor(this.dt_time)<3) {
			bCan = true
		}else if ( Math.floor(this.dt_time)%3 ==0) {
			bCan = true
		}
		if (this.m_TimeId !=Math.floor(this.dt_time)  && Math.floor(this.dt_time) > 0 && Math.floor(this.dt_time)%3 ==0 && Math.floor(self.dt_time)<this.m_TimeNode.length) {
			if (!this.m_DotArray[Math.floor(this.dt_time)+1]) {
				return
			}
			let n_tartge = this.m_DotArray[Math.floor(this.dt_time)+1]
			n_tartge.active = true
			let pos = cc.v2(this.m_Rocketnose.getPosition().x-this.startPos.x,this.m_Rocketnose.getPosition().y -this.startPos.y)
			n_tartge.setPosition(pos)  //起点位置
			
			let MoveFuc = function(node,index,startPath,start,time,bEnd){
				let pos =  cc.v2(path[startPath][0],path[startPath][1])
				if (bEnd) {
					pos = node.getPosition()
				}
				
				let nAction = (cc.sequence(cc.moveTo(time,pos),cc.callFunc(()=>{
					let PsoX = self.m_TimeNode[index].getPosition().x
					let PosY = self.fucgetPosY(PsoX)
					if (pos.x >= PsoX && startPath-1 > 0) {
						MoveFuc(node,index,startPath-1,start,time + 0.0025,false) 
					}else{
						//矫正
						if (PosY) {
							if (node.getPosition().x < PsoX) {
								PsoX = node.getPosition().x
							}
							node.runAction(cc.sequence(cc.moveTo(0.5,cc.v2(PsoX,PosY)),cc.callFunc(()=>{
								MoveFuc(node,index,startPath,start,0.5,true)
							})))
						}else{
							MoveFuc(node,index,startPath,start,0.5,true)
						} 
					}
				})))
				node.runAction(nAction)
			}
			n_tartge.stopAllActions()
			MoveFuc(n_tartge,Math.floor(self.dt_time)-1,path.length-1,path.length-10,0.01,false)

			if (Math.floor(this.dt_time) %2 != 0) {
				n_tartge.getChildByName("dislab").setPosition(cc.v2(n_tartge.getChildByName("dislab").getPosition().x,-n_tartge.getChildByName("dislab").getPosition().y))
				n_tartge.getChildByName("score").setPosition(cc.v2(n_tartge.getChildByName("score").getPosition().x,-n_tartge.getChildByName("score").getPosition().y))
			}

			n_tartge.getChildByName("dislab").getComponent(cc.Label).string = GameInfo.getinstance().m_Currentmultiple/100 +"x"
			n_tartge.getChildByName("score").getComponent(cc.Label).string = Math.floor(1000+Math.random()*100 * Math.floor(this.dt_time))

			n_tartge.runAction(cc.sequence(cc.delayTime(0.2),cc.callFunc(()=>{
				n_tartge.getChildByName("dislab").active = true
				n_tartge.getChildByName("score").active = true

			}),cc.delayTime(4.0),cc.callFunc(()=>{
				n_tartge.getChildByName("dislab").active = false
				n_tartge.getChildByName("score").active = false
			})))
			

			if (Math.floor(this.dt_time)  > 5) {
				self.m_DotArray[0].active = false
				self.m_DotArray[1].active = false
				self.m_DotArray[2].active = false
				self.m_DotArray[3].active = false
				//从前面开始消失 
				let index = Math.floor(Math.random()*Math.floor(self.dt_time-6))
				while(self.m_DotArray[index].active)
				{
					self.m_DotArray[index].active = false
					index = Math.floor(Math.random()*Math.floor(self.dt_time-5))
				}
			}
			this.m_TimeId = Math.floor(this.dt_time)
		}
	}

	fucgetPosY(x){
		for (let index = 0; index < this.m_DotArray.length; index++) {
			const element = this.m_DotArray[index]
			if (element[0]  < x + 2 && element[0]  > x -2  && element[1]!= undefined) {
				return element[1]
			}
		}
		return 0
	}

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
		for (let index = 0; index < Math.floor(count); index++) {
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

	//待调整
	fucMoveDisLayout(){
		this.m_Disspeep = 0.35 //移速度
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
				
				if ( GameInfo.getinstance().m_Currentmultiple/100 > 2 && index%2 != 0 ) {
					element.stopAllActions()
					element.active = false
				}

				if ( GameInfo.getinstance().m_Currentmultiple/100 > 4 && index%3!= 0  ) {
					element.stopAllActions()
					element.active = false
				}

				if ( GameInfo.getinstance().m_Currentmultiple/100 > 6 && index%4!= 0  ) {
					element.stopAllActions()
					element.active = false
				}

				if ( GameInfo.getinstance().m_Currentmultiple/100 > 20 && index%5!= 0 ) {
					element.stopAllActions()
					element.active = false
				}

				if ( GameInfo.getinstance().m_Currentmultiple/100 > 60 && index%6!= 0  ) {
					element.stopAllActions()
					element.active = false
				}
				if ( GameInfo.getinstance().m_Currentmultiple/100 > 100 && index%8!= 0  ) {
					element.stopAllActions()
					element.active = false
				}
				element.runAction(cc.moveTo(self.m_Disspeep,cc.v2((self.DisRoot.getContentSize().width/self.m_DisNode.length)* index ,0)))
			}
		})

		this.DisRoot.runAction(cc.sequence(n_Action,cc.delayTime(self.m_Disspeep),cc.callFunc(()=>{
			this.DisRoot.stopAllActions()
			this.fucMoveDisLayout()
		})))
	}

	//时间距离按比例移动
	m_TimeIndex = 0
	fucShowTimeAction(){
		if (this.m_TimeIndex!= Math.floor(this.dt_time)) {
			this.m_TimeIndex= Math.floor(this.dt_time)
		}else{
			return
		}

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
			
			if (this.m_TimeNode.length  > 100  && index%10 != 0 ) {
				element.opacity  = 0
			}

			if (this.m_TimeNode.length  > 30  && index%8 != 0 ) {
				element.opacity  = 0
			}
			if (this.m_TimeNode.length  > 20  && index%4 != 0 ) {
				element.opacity  = 0
			}
			if (this.m_TimeNode.length  > 10  && index%2 != 0 ) {
				element.opacity  = 0
			}
		}
		this.TimeDot +=1
	}
}