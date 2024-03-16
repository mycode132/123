// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import GameEngine from "../../control/engines/GameEngine"


export default class SoundMgr  {

	//所有国际共用部分
	//背景音
	public static async  PlayBgMusic(){
		GameEngine.m_managers.soundMgr.playMusic("background")
	}

	public static async  PlayStopBgMusic(){
		GameEngine.m_managers.soundMgr.stopMusic()
	}

	//按钮
	public static async palyButSound(){
		GameEngine.m_managers.soundMgr.playSound("button")
	}

	//筹码
	public static async palyChipSound(){
		GameEngine.m_managers.soundMgr.playSound("bet")
	}

	//龙win
	public static async palyDagSound(){
		GameEngine.m_managers.soundMgr.playSound("game_0")
	}

	public static async palyTigSound(){
		GameEngine.m_managers.soundMgr.playSound("game_1")
	}

	//倒计时
	public static async palycountdownSound(){
		GameEngine.m_managers.soundMgr.playSound("countdown")
	}

	//结束
	public static async palygame_vsSound(){
		GameEngine.m_managers.soundMgr.playSound("game_vs")
	}

	//移动牌音效
	public static async palyMoveCardSound(){
		GameEngine.m_managers.soundMgr.playSound("game_flipcard")
	}

	//移动筹码音效
	public static async palyMoveChipSound(){
		GameEngine.m_managers.soundMgr.playSound("playerloss")
	}

	//选择筹码
	public static async palySelectChipSound(){
		GameEngine.m_managers.soundMgr.playSound("betdown")
	}

	//所有国际区分部分
	//点数
	public static async palyCardsSound(_count){
		GameEngine.m_managers.soundMgr.playi18Sound("poker"+_count)
	}

	//龙win
	public static async palyDWinSound(){
		GameEngine.m_managers.soundMgr.playi18Sound("dwin")
	}

	//虎win
	public static async palyTWinSound(){
		GameEngine.m_managers.soundMgr.playi18Sound("twin")
	}
	
	//和局
	public static async palyTieWinSound(){
		GameEngine.m_managers.soundMgr.playi18Sound("tie")
	}

	//开始下注
	public static async palystartSound(){
		GameEngine.m_managers.soundMgr.playi18Sound("start")
	}

	//停止下注stop
	public static async palystopSound(){
		GameEngine.m_managers.soundMgr.playi18Sound("stop")
	}

	//盖碗
	public static async palyGaiWanSound(){
		GameEngine.m_managers.soundMgr.playSound("gaiwan-1")
	}


	//摇骰子
	public static async palyTouziSound(){
		GameEngine.m_managers.soundMgr.playSound("roll_the_dice")
	}


	//放碗
	public static async palyFangWanSound(){
		GameEngine.m_managers.soundMgr.playSound("put_on_the_table")
	}

	//开碗
	public static async palyOpenWanSound(){
		GameEngine.m_managers.soundMgr.playSound("friction")
	}

	//动态修改路径
	//点数
	public static async palyPoitSound(_count){
		GameEngine.m_managers.soundMgr.playi18Sound("red_"+_count)
	}

	//Crash
	public static async palyCrashSound(_count){
		GameEngine.m_managers.soundMgr.playSound("x"+_count)
	}

	public static async palyCrashBoom(){
		GameEngine.m_managers.soundMgr.playSound("payoutcrash")
	}


	public static async palyCrashChip(){
		GameEngine.m_managers.soundMgr.playSound("bet")
	}
	
	public static async palyCrashenter(){
		GameEngine.m_managers.soundMgr.playSound("enter")
	}

	//FishCrabs
	public static async palyFishCrabsopen(){
		GameEngine.m_managers.soundMgr.playSound("open")
	}
	public static async palyFishCrabsbowl(){
		GameEngine.m_managers.soundMgr.playSound("bowl")
	}

	//子游戏公共音效
	public static async palyGamePublicSound(name){
		GameEngine.m_managers.soundMgr.playGamei18Sound(name)
	}

	//动态修改路径
	//点数
	public static async palyFishCrabsSound(name){
		GameEngine.m_managers.soundMgr.playi18Sound(name)
	}

	//百家乐 发牌
	public static async palySendCards(){
		GameEngine.m_managers.soundMgr.playSound("flipcard")
	}
	//洗牌
	public static async palyXiCards(){
		GameEngine.m_managers.soundMgr.playSound("lisingcard")
	}

	//红黑大战
	public static async palyRedPrincessWins(){
		GameEngine.m_managers.soundMgr.playSound("open")
	}
	public static async palyRedPwins(){
		GameEngine.m_managers.soundMgr.playSound("bowl")
	}
	

}