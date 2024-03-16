// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import GameEngine, { manager } from "../../control/engines/GameEngine";
import GameInstInfo from "./GameInstInfo";
import SoundMgr from "./SoundMgr";


const {ccclass, property} = cc._decorator;

@ccclass
export default class OnlinePlayerRank extends cc.Component {
	protected className: string = "在线玩家排行榜";

	@property({type:cc.ScrollView,displayName:"视窗"})
    m_ScrollView: cc.ScrollView = null;

	@property({type:cc.Node,displayName:"模版"})
    m_LayoutMode: cc.Node = null;

	@property({type:cc.Button,displayName:"关闭"})
    m_ButClose: cc.Button = null;

	@property({type:[cc.SpriteFrame],displayName:"榜1榜2"})
	n_SpriteFrame:cc.SpriteFrame[] = []

	@property({type:[cc.SpriteFrame],displayName:"VIP等级"})
	n_VIPFrame:cc.SpriteFrame[] = []

	m_Data = []

	m_HeadId = 0

	//玩家信息
	m_playerInfo = {
		m_Name :"",
		m_Money :0,
		m_VipLevel :1,
		m_HandUrl:"",
		m_win:0,
		m_AllDown:0,
		m_Rank:0,
		m_DownmMoney:0,
	}

	m_enemyPool = null

    onLoad () {
		let self= this
		this.node.getChildByName("sheet_15").setScale(0)
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

		this.m_enemyPool = new cc.NodePool();
		let initCount = 30;
		this.m_enemyPool.clear()
		for (let i = 0; i < initCount; ++i) {
			let enemy =   cc.instantiate(this.m_LayoutMode); // 创建节点
			this.m_enemyPool.put(enemy); 
		}

		this.fucChangeImage()
	}

	createEnemy() {
		let enemy = null;
		if (this.m_enemyPool.size() > 0) { 
			enemy = this.m_enemyPool.get();
		} 
		else { 
			enemy = cc.instantiate(this.m_LayoutMode);
		}
		return enemy
	}

	onEnemyKilled (enemy) {
		this.m_enemyPool.put(enemy,'ChipNode'); // 将节点放进对象池，这个方法会同时调用节点的 removeFromParent();
	}

	fucChangeImage(){
		//标签
		let n_Recordst =  this.node.getChildByName("sheet_15").getChildByName("sheet_31")
		GameInstInfo.getinstance().fucPublicImage(n_Recordst)

		n_Recordst =  this.node.getChildByName("sheet_15").getChildByName("ci_mb_tx_rank")
		GameInstInfo.getinstance().fucPublicImage(n_Recordst)
		n_Recordst =  this.node.getChildByName("sheet_15").getChildByName("ci_mb_tx_player")
		GameInstInfo.getinstance().fucPublicImage(n_Recordst)
		n_Recordst =  this.node.getChildByName("sheet_15").getChildByName("ci_mb_tx_recent20rounds")
		GameInstInfo.getinstance().fucPublicImage(n_Recordst)

		GameInstInfo.getinstance().fucPublicSpriteFrame(this.n_SpriteFrame[0])
		GameInstInfo.getinstance().fucPublicSpriteFrame(this.n_SpriteFrame[1])
	}

	//伪随机同时段排行榜一样
	fucCreatPlay(){
		//创建100个玩家
		let Money = []
		let VipLevel= []
		let win= []
		let AllDown= []
		let DownmMoney= []
		let Name= []

		GameInstInfo.getinstance().fucRandom()
		let max = 900000+ GameInstInfo.getinstance().next(900000)
		for (let index = 0; index < 100; index++) {
			Money[index] = (max -= GameInstInfo.getinstance().next(9000))
		}

		GameInstInfo.getinstance().fucRandom()
		for (let index = 0; index < 100; index++) {
			VipLevel[index] = GameInstInfo.getinstance().next(9)
		}

		GameInstInfo.getinstance().fucRandom()
		for (let index = 0; index < 100; index++) {
			win[index] = GameInstInfo.getinstance().next(700)
		}

		GameInstInfo.getinstance().fucRandom()
		for (let index = 0; index < 100; index++) {
			AllDown[index] = GameInstInfo.getinstance().next(900)
		}

		GameInstInfo.getinstance().fucRandom()
		for (let index = 0; index < 100; index++) {
			DownmMoney[index] = GameInstInfo.getinstance().next(90000)
		}

		GameInstInfo.getinstance().fucRandom()
		for (let index = 0; index < 100; index++) {
			Name[index] = GameInstInfo.getinstance().randomName()
		}

		this.m_Data = []
		for (let index = 0; index < 100; index++) {
			let info = JSON.parse(JSON.stringify(this.m_playerInfo))
			info.m_Rank = index+1
			info.m_Name = Name[index]
			info.m_Money = Money[index]
			info.m_VipLevel =  VipLevel[index]
			info.m_win=  win[index] 
			info.m_AllDown=  AllDown[index]
			info.m_DownmMoney=  DownmMoney[index]
			this.m_Data.push(info)
		}

		GameInstInfo.getinstance().fucRandom()
		this.m_HeadId = GameInstInfo.getinstance().next(45)
	}

	fucUpView(){
		this.node.active = true
		this.fucCreatPlay() //同时间（分）创建同样排行榜  一分钟刷新一次
		this.node.getChildByName("sheet_15").runAction(cc.scaleTo(0.2,1.0))
		this.m_ScrollView.content.removeAllChildren()
		this.createList()
	}

	//scrollview  优化
	itemHeight = 0;//设置每个item的高
    topIndex = 0;//最上面的item索引id
    bottomIndex = 0;//最下面的item索引id
    offsetY = 0;//上下临界坐标补充，
	topExtremeDistance = 0
	bottomExtremeDistance = 0
	itemsArr =[]

	createList () {
        this.itemHeight = this.m_LayoutMode.height;//设置每个item的高
        this.topIndex = 0;			//最上面的item索引id
        this.bottomIndex = 10;		//最下面的item索引id
        this.offsetY = 80;			//上下临界坐标补充，

        let scrollViewPos = this.m_ScrollView.node.position;
        this.topExtremeDistance = scrollViewPos.y + this.m_ScrollView.node.height / 2 + this.offsetY;//获取item能到达的屏幕上边界y坐标
        this.bottomExtremeDistance = scrollViewPos.y - this.m_ScrollView.node.height / 2 - this.offsetY;//获取item能到达的屏幕下边界y坐标

        this.itemsArr = [];
        for (let i = 0; i < 11; i ++) {
			let Item = this.createEnemy() 
			Item.active = true
			//this.fucUpItemInfo(Item,this.m_Data[i])
            Item.parent = this.m_ScrollView.content;
            this.updateItem(Item, this.m_Data[i], i);
        }
        this.m_ScrollView.content.height = (this.m_Data.length + 1) * this.itemHeight + 20;
    }

	//实时刷新数据
    updateItem (listItem, data, i) {
        listItem.y = -i * this.itemHeight - this.itemHeight / 2;
		this.fucUpItemInfo(listItem,data)
        this.itemsArr[i] = listItem;
    }

    updateItemsPos (dt) {
        if (!!this.itemsArr && !!this.itemsArr[this.bottomIndex]) {
            //获取上下item当前的坐标
            let topPos = this.itemsArr[this.topIndex].convertToWorldSpaceAR(cc.v2(0, 0)).sub(cc.v2(cc.winSize.width / 2, cc.winSize.height / 2));
            let bottomPos = this.itemsArr[this.bottomIndex].convertToWorldSpaceAR(cc.v2(0, 0)).sub(cc.v2(cc.winSize.width / 2, cc.winSize.height / 2));
            //检测上item是否超过边界
            if (topPos.y > this.topExtremeDistance) {
                if (this.bottomIndex >= this.m_Data.length - 1) {
                    return;
                }
                this.updateItem(this.itemsArr[this.topIndex], this.m_Data[this.bottomIndex + 1], this.bottomIndex + 1);
                this.topIndex ++;
                this.bottomIndex ++;
            //检测下item是否超过边界
            } else if (bottomPos.y < this.bottomExtremeDistance) {
                if (this.topIndex < 1) {
                    return;
                }
                this.updateItem(this.itemsArr[this.bottomIndex], this.m_Data[this.topIndex - 1], this.topIndex - 1);
                this.topIndex --;
                this.bottomIndex --;
            }
        }
    }

	update (dt) {
        this.updateItemsPos(dt);
    }

	//动态数据
	fucUpItemInfo(Item,data){
		let vip_level = Item.getChildByName('vip_level');
		vip_level.getComponent(cc.Sprite).spriteFrame = this.n_VIPFrame[data.m_VipLevel]

		let rankLab = Item.getChildByName('rank');
		rankLab.active = false
		let RankSprite = Item.getChildByName('bang_sp');
		RankSprite.active = true

		//头像
		let headSp = Item.getChildByName('head').getChildByName('headSprite');
		
		const path = 'Public/resources/Plist/Hander';
		let Imagename = ` (${data.m_Rank + this.m_HeadId})`
		manager().resourceMgr.loadPlistImage(headSp,path,Imagename);
		
		if (data.m_Rank == 1) {
			RankSprite.getComponent(cc.Sprite).spriteFrame = this.n_SpriteFrame[0]
			GameInstInfo.getinstance().fucPublicImage(RankSprite)
			
		}else if (data.m_Rank == 2) {
			RankSprite.getComponent(cc.Sprite).spriteFrame = this.n_SpriteFrame[1]
			GameInstInfo.getinstance().fucPublicImage(RankSprite)
		}else{
			RankSprite.active = false
			rankLab.active = true
			rankLab.getComponent(cc.Label).string = `NO.${data.m_Rank}`
		}
		// name
		let name = Item.getChildByName('name');
		name.getComponent(cc.Label).string = data.m_Name

		// dowmoney 下注：444K
		let dowmoney = Item.getChildByName('dowmoney');
		dowmoney.getComponent(cc.Label).string = GameEngine.m_services.i18nSrv.getI18nString("下注") + data.m_DownmMoney

		// win 胜7局
		dowmoney = Item.getChildByName('win');
		dowmoney.getComponent(cc.Label).string = GameEngine.m_services.i18nSrv.getI18nString("胜")+ data.m_win
		// money
		dowmoney = Item.getChildByName('money');
		dowmoney.getComponent(cc.Label).string = `${data.m_Money}`

		dowmoney = Item.getChildByName('alldown');
		dowmoney.getComponent(cc.Label).string =  GameEngine.m_services.i18nSrv.getI18nString("下注") + data.m_AllDown
	}

}