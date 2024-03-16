// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import { manager } from "../../control/engines/GameEngine";
import GameInstInfo from "./GameInstInfo";

const {ccclass, property} = cc._decorator;

@ccclass
export default class ChipNode extends cc.Component {
	protected className: string = "筹码模版";

    @property({type:cc.Sprite,displayName:"BG_1"})
    m_BG_1:cc.Sprite = null

    @property({type:cc.Sprite,displayName:"BG_2"})
    m_BG_2:cc.Sprite = null

	@property({type:cc.Node,displayName:"禁点遮罩"})
    m_Back:cc.Node = null

	@property({type:cc.Node,displayName:"文字说明"})
    m_labLayout:cc.Node = null

	@property({type:cc.Label,displayName:"系统文字说明"})
    m_lab:cc.Label = null

	n_ChipNumber = [1,10,50,100,500,1000,5000,10000]   //筹码面额

	m_district = -1   //所在下注区域

	m_Name= ["ci_chip1","ci_chip3","ci_chip4","ci_chip5","ci_chip6","ci_chip7","ci_chip8","ci_chip9"] 


	//内存池回收  避免重复创建
	m_enemyPool = null
	start(){
		if (!this.m_enemyPool) {
			this.fucInit();
		}
	}

	//筹码上显示额度用内存池管理 避免重复创建
	fucInit(){
		this.m_enemyPool = new cc.NodePool();
		this.m_enemyPool.clear()
		for (let i = 0; i < 5; ++i) {
			let enemy = new cc.Node('myNode')  
			enemy.addComponent(cc.Sprite)  
			this.m_enemyPool.put(enemy); 
		}
	}

	createEnemy() {
		let enemy = null;
		if (!this.m_enemyPool) {
			this.fucInit();
		}
		if (this.m_enemyPool.size() > 0) { 
			enemy = this.m_enemyPool.get();
		} 
		else { 
			enemy = new cc.Node('myNode')  
			enemy.addComponent(cc.Sprite)  
		}
		return enemy
	}

	onEnemyKilled (enemy) {
		this.m_enemyPool.put(enemy); 
	}

	fucSetNumber(_number){
		let index = this.n_ChipNumber.indexOf(_number)
		let path = 'Public/resources/coin/Chip_List';   //使用合图
		let Imagename = this.m_Name[index]

		//对应额度所用背景
		manager().resourceMgr.loadPlistImage(this.m_BG_1,path,Imagename);
		manager().resourceMgr.loadPlistImage(this.m_BG_2,path,Imagename);
		
		//使用系统字体  筹码选择滑动列表
		if (this.m_lab) {
			this.m_lab.node.active = true
			this.m_lab.string = ""+_number
			if (_number>=1000) {
				this.m_lab.string = _number/1000 + "K"
			}
			if (GameInstInfo.getinstance().m_curr == "VND" ) {
				this.m_lab.string = this.m_lab.string + "K"
				if (_number>=1000) {
					this.m_lab.string = _number/1000 + "tr"
				}
			}
		}
		//投注筹码使用合图BMfont 降低渲染批次
		else{
			for (let index = 0; index < this.m_labLayout.children.length; index++) {
				this.onEnemyKilled( this.m_labLayout.children[index])
			}
			this.m_labLayout.removeAllChildren()
			//越南地区显示
			if (GameInstInfo.getinstance().m_curr == "VND" ) {
				if (_number>=1000) {
					let n_Number = this.splitNumber(_number/1000)
					let element = n_Number[0];
					for (let index = 0; index < n_Number.length; index++) {
						let node=this.createEnemy()  
						this.m_labLayout.addChild(node)
						element = n_Number[index];
						Imagename = `ci_chip_${element}`
						manager().resourceMgr.loadPlistImage(node,path,Imagename);
					}
					let n_node=this.createEnemy()   
					this.m_labLayout.addChild(n_node)
					Imagename = `ci_chip_tr`
					manager().resourceMgr.loadPlistImage(n_node,path,Imagename);
				}else{
					let n_Number = this.splitNumber(_number)
					let element = n_Number[0];
					for (let index = 0; index < n_Number.length; index++) {
						let node=this.createEnemy()   
						this.m_labLayout.addChild(node)
						element = n_Number[index];
						Imagename = `ci_chip_${element}`
						manager().resourceMgr.loadPlistImage(node,path,Imagename);
					}
					let n_node=this.createEnemy()   
					this.m_labLayout.addChild(n_node)
					Imagename = `ci_chip_k`
					manager().resourceMgr.loadPlistImage(n_node,path,Imagename);
				}
			}else{
				if (_number>=1000) {
					let n_Number = this.splitNumber(_number/1000)
					let element = n_Number[0];
					for (let index = 0; index < n_Number.length; index++) {
						let  node=this.createEnemy()   
						this.m_labLayout.addChild(node)
						element = n_Number[index];
						Imagename = `ci_chip_${element}`
						manager().resourceMgr.loadPlistImage(node,path,Imagename);
					}
					let n_node=this.createEnemy() 
					this.m_labLayout.addChild(n_node)
					Imagename = `ci_chip_k`
					manager().resourceMgr.loadPlistImage(n_node,path,Imagename);
				}else{
					let n_Number = this.splitNumber(_number)
					let element = n_Number[0];
					for (let index = 0; index < n_Number.length; index++) {
						let node=this.createEnemy()   
						this.m_labLayout.addChild(node)
						element = n_Number[index];
						Imagename = `ci_chip_${element}`
						manager().resourceMgr.loadPlistImage(node,path,Imagename);
					}
				}
			}
		}
	}

	//筹码最后所在区域
	fucBetArea(index){
		this.m_district = index
	}

	splitNumber(num) {
		const str = num.toString();
		let n_Number = []
		for(let i = 0; i < str.length; i++) {
			const digit = str.charCodeAt(i) - '0'.charCodeAt(0);
			n_Number.push(digit)
		}
		return n_Number
	}
	 
	//刷新筹码状态  
	//@param 是否可以点击
	fucUpChipType(bCanClick){
		if (bCanClick) {
			this.m_Back.opacity = 0
		}else{
			this.m_Back.runAction(cc.repeat(cc.sequence(cc.delayTime(0.01),cc.callFunc(()=>{
				this.m_Back.opacity = this.m_Back.opacity+2 <255 ? this.m_Back.opacity+2 :255
			})),40))
		}
	}
}