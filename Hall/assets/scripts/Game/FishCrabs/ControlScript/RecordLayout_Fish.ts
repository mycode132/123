// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import GameInstInfo from "../../../Public/ControlScript/GameInstInfo";



const {ccclass, property} = cc._decorator;

@ccclass
export default class RecordLayout extends cc.Component {
	protected className: string = "底部开奖记录";

	@property({type:cc.Node,displayName:"模版"})
    m_LayoutMode: cc.Node = null;

	@property({type:cc.ScrollView,displayName:"第二视窗"})
    m_ScrollView: cc.ScrollView = null;

	
	@property({type:[cc.SpriteFrame],displayName:"中奖属性"})
    m_SpretrMode:cc.SpriteFrame[] = []
   
	@property({type:cc.Node,displayName:"数据显示层"})
    m_LabLayout: cc.Node = null;
	
	//  1--  6组合
	//1   2   3    4    5    6
	//蟹  鱼  鸡   虾  葫芦  铜板
	m_CountRecord = [0,0,0,0,0,0] 
	m_GameResult = []  //游戏结果

	//scrollview  优化
	itemHeight = 0;//设置每个item的高
    topIndex = 0;//最上面的item索引id
    bottomIndex = 0;//最下面的item索引id
    offsetX = 0;//上下临界坐标补充，
	topExtremeDistance = 0
	bottomExtremeDistance = 0
	itemsArr =[]


	fucWiterData(nData){
        this.itemHeight = this.m_LayoutMode.width;
        this.topIndex = 0;			//最上面的item索引id
        this.bottomIndex = 24;		//最下面的item索引id
        this.offsetX = 80;			//上下临界坐标补充，

        let scrollViewPos = this.m_ScrollView.node.position;
        this.topExtremeDistance = scrollViewPos.x - this.m_ScrollView.node.width / 2 - this.offsetX;
        this.bottomExtremeDistance = scrollViewPos.x + this.m_ScrollView.node.width / 2 + this.offsetX;

	
		this.m_GameResult =[]
		this.m_GameResult = nData.reverse(); 
		this.m_ScrollView.content.removeAllChildren()
		
		this.fucUpLabe()  
        this.itemsArr = [];//item存储arr
        for (let i = 0; i < 25; i ++) {
			let Item = cc.instantiate(this.m_LayoutMode) 
			Item.active = true
            Item.parent = this.m_ScrollView.content
			this.updateItem(Item,this.m_GameResult[i],i)
        }
        this.m_ScrollView.content.width = (this.m_GameResult.length + 2) * this.itemHeight;
		this.m_ScrollView.scrollToPercentHorizontal(1.00,0)
    }


	fucAddResult(nData){
		this.m_GameResult.push(nData)
		this.m_ScrollView.content.width = (this.m_GameResult.length + 2) * this.itemHeight;
		this.m_ScrollView.scrollToPercentHorizontal(1.00,0)
		this.fucUpLabe()  
	}

	
	fucUpLabe(){
		this.m_CountRecord  = [0,0,0,0,0,0] 
		let  n_data = this.m_GameResult[0].LotteryOpen;
		for (let index = 0; index < this.m_GameResult.length; index++) {
			n_data = this.m_GameResult[index].LotteryOpen;
			let vars = n_data.split(",");
			for (let z = 0; z < vars.length; z++) {
				let element = Number(vars[z]) -1;
				this.m_CountRecord[element] +=1
			}
		}

		for (let index = 0; index < this.m_CountRecord.length; index++) {
			this.m_LabLayout.getChildByName("lab_red_"+(index+1)).getComponent(cc.Label).string  = ""+  this.m_CountRecord[index]
		}
	}

	//实时刷新数据
    updateItem (listItem, data, i) {
        listItem.x = i * this.itemHeight + this.itemHeight / 2;
		this.fucUpItemInfo(listItem,data.LotteryOpen)
        this.itemsArr[i] = listItem;
    }

    updateItemsPos (dt) {
        if (!!this.itemsArr && !!this.itemsArr[this.bottomIndex]) {
            //获取上下item当前的坐标
            let topPos = this.itemsArr[this.topIndex].convertToWorldSpaceAR(cc.v2(0, 0)).sub(cc.v2(cc.winSize.width / 2, cc.winSize.height / 2));
            let bottomPos = this.itemsArr[this.bottomIndex].convertToWorldSpaceAR(cc.v2(0, 0)).sub(cc.v2(cc.winSize.width / 2, cc.winSize.height / 2));
            //检测上item是否超过边界
            if (topPos.x < this.topExtremeDistance) {
                if (this.bottomIndex >= this.m_GameResult.length - 1) {
                    return;
                }
                this.updateItem(this.itemsArr[this.topIndex], this.m_GameResult[this.bottomIndex + 1], this.bottomIndex + 1);
                this.topIndex ++;
                this.bottomIndex ++;
            //检测下item是否超过边界
            } else if (bottomPos.x > this.bottomExtremeDistance) {
                if (this.topIndex < 1) {
                    return;
                }
                this.updateItem(this.itemsArr[this.bottomIndex], this.m_GameResult[this.topIndex - 1], this.topIndex - 1);
                this.topIndex --;
                this.bottomIndex --;
            }
        }
    }

	update (dt) {
        this.updateItemsPos(dt);
    }

	//动态数据
	fucUpItemInfo(Item,nValue){
		let vars = nValue.split(",");
		//三个奖项
		Item.getChildByName("desk0").getComponent(cc.Sprite).spriteFrame = this.m_SpretrMode[Number(vars[0])-1]
		Item.getChildByName("desk1").getComponent(cc.Sprite).spriteFrame = this.m_SpretrMode[Number(vars[1])-1]
		Item.getChildByName("desk2").getComponent(cc.Sprite).spriteFrame = this.m_SpretrMode[Number(vars[2])-1]
		Item.active = true
	}
}