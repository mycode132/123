// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class RockMode extends cc.Component {
	protected className: string = "石块模型";

	@property({type:cc.Sprite,displayName:"钻石"})
    m_Color_1:cc.Sprite = null

    @property({type:cc.Sprite,displayName:"炸弹"})
    m_Color_2:cc.Sprite = null

	@property({type:cc.Sprite,displayName:"蒙版"})
    m_Color_3:cc.Sprite = null

	@property({type:cc.Sprite,displayName:"背景"})
    m_Black:cc.Sprite = null


	@property({type:cc.Sprite,displayName:"雷底框"})
    m_Boom_1:cc.Sprite = null

    @property({type:cc.Sprite,displayName:"雷背景"})
    m_Boom_2:cc.Sprite = null



	m_ID : number = 0
	m_bOpen:boolean = false

    start () {
		
    }

	//设置ID
	fucSetID(_nid){
 		this.m_ID = _nid
	}

	fucShowBlack(){
		this.m_Black.node.active = true
	}


	//需要做区别对待   游戏结束后开奖需要蒙层
	showPoker(_number:number= 1,_time = 0.2,_bover = false,callBack?:any):void
    {
		if (_number <= 0 ) {
			if(callBack !=null)
			{
				callBack()
			}
			return
		}
        let self = this
        let action = cc.sequence(
            cc.scaleTo(_time,0.01,1.0),
            cc.callFunc(function(){
                self.m_Black.node.active = false

				if (_number == 1) {
					self.m_Color_1.node.active = true
				}else{
					self.m_Color_2.node.active = true
					self.m_Color_2.node.scale = 0.6

					self.m_Boom_1.node.active = true

					self.m_Boom_2.node.active = true
				}
				if (_bover) {
					self.m_Color_3.node.active = true
				}
				
            }),
            cc.scaleTo(_time,1.0,1.0),
            cc.callFunc(function(){
				if (_number != 1) {
					self.fucMinesAction()
				}

				if(callBack !=null)
                {
                    callBack()
                }
            })
        )
		this.m_bOpen = true
		this.node.active = true
		this.m_Black.node.active = true
        this.node.runAction(action);
    }

	//雷的放大动作
	fucMinesAction(){
		let self = this
		self.m_Color_2.node.runAction(cc.sequence(cc.scaleTo(0.2,1.0),cc.scaleTo(0.2,0.8)))

	}

	//还原   
	fucRestHide(){
		let self = this
        let action = cc.sequence(
            cc.delayTime(0.1),
            cc.scaleTo(0.2,0.05,1.0),
            cc.callFunc(function(){
                self.m_Black.node.active = true
				self.m_Color_1.node.active = false
				self.m_Color_2.node.active = false
				self.m_Color_3.node.active = false

				self.m_Boom_1.node.active = false
				self.m_Boom_2.node.active = false

				self.m_bOpen = false
            }),
            cc.scaleTo(0.2,1.0,1.0)
            
        )
        this.node.runAction(action);
	}

	//无动作显示
	showPoker1(_number:number= 1, callBack?:any):void
    {
        let self = this
		//在这里切换扑克纹理
		self.m_Black.node.active = false
		this.node.active = true
		this.m_bOpen = true
    }
}