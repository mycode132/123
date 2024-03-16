// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class CardsMode extends cc.Component {
	protected className: string = "点牌模型";

	@property({type:cc.Label,displayName:"牌值1"})
    m_Value_1:cc.Label = null

    @property({type:cc.Label,displayName:"牌值2"})
    m_Value_2:cc.Label = null

	@property({type:cc.Sprite,displayName:"花1"})
    m_Color_1:cc.Sprite = null

    @property({type:cc.Sprite,displayName:"花2"})
    m_Color_2:cc.Sprite = null

	@property({type:cc.Sprite,displayName:"遮罩"})
    m_Black:cc.Sprite = null

	//黑 红 梅 方
    @property({type:[cc.SpriteFrame],displayName:"花色"})   
	n_CardsColorSpriteFrame:cc.SpriteFrame[] = []

	//#9A0505  深红色
	//#000000   黑色
	CardsColorBlack: 	number = 1; //黑
	CardsColorRed: 		number = 2;	//红	
	CardsColorPlum: 	number = 3;	//梅
	CardsColorBlock: 	number = 4;	//方

	mCardsValue = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"]

    start () {
		this.fucClear()
    }

	fucShowData(_number,_color){
		this.m_Color_1.getComponent(cc.Sprite).spriteFrame = this.n_CardsColorSpriteFrame[_color-1]
		this.m_Color_2.getComponent(cc.Sprite).spriteFrame = this.n_CardsColorSpriteFrame[_color-1]

		this.m_Value_1.getComponent(cc.Label).string  = this.mCardsValue[_number-1]
		this.m_Value_2.getComponent(cc.Label).string  = this.mCardsValue[_number-1]

		if (_color == this.CardsColorBlack || _color == this.CardsColorPlum) {
			this.m_Value_1.node.color = cc.color(0,0,0)
			this.m_Value_2.node.color = cc.color(0,0,0)
		}else{
			this.m_Value_1.node.color = cc.color(150,5,5)
			this.m_Value_2.node.color = cc.color(150,5,5)
		}
	}

	fucShowBlack(){
		this.fucClear()
		this.m_Black.node.active = true
	}

	showPoker(_number:number= 1,_color:number= 1, callBack?:any):void
    {
        let self = this
        let action = cc.sequence(
            cc.delayTime(0.1),
            cc.scaleTo(0.3,2.0,0.05),
            cc.callFunc(function(){
                //在这里切换扑克纹理
                self.m_Black.node.active = false
				self.fucShowData(_number,_color)  //修改点数
				self.fucClear()
            }),
            cc.scaleTo(0.3,2.0,2.0),
            cc.callFunc(function(){
                if(callBack !=null)
                {
                    callBack()
                }
            })
        )
        this.node.runAction(action);
    }

	fucPlayFlame(){
		let flame000 = this.node.getChildByName("flame000")
		flame000.active = true
		flame000.getComponent(cc.Animation).play()
	}

	fucPlayBrim(){
		let brim_0 = this.node.getChildByName("brim_0")
		brim_0.active = true
		brim_0.getComponent(cc.Animation).play()
	}

	fucClear(){
		let brim_0 = this.node.getChildByName("brim_0")
		brim_0.active = false
		if (brim_0.getComponent(cc.Animation)) {
			brim_0.getComponent(cc.Animation).pause()
		}
		let flame000 = this.node.getChildByName("flame000")
		flame000.active = false
		if (flame000.getComponent(cc.Animation)) {
			flame000.getComponent(cc.Animation).pause()
		}
	}
}