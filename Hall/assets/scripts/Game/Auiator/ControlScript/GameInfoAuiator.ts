// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html
export default class GameInfo  {

	protected className: string = "GameInfo";

	private static m_instance: GameInfo = null;

	public m_GameData = {
		m_Gameinning:0,   //局数
		m_Basicscore:0,    //底分
		m_multiple:1,		//倍数
		m_stopLi:150000,	//停利
		m_stopSun:150000,	//停损
		m_bWinDouble:false, //赢  加倍
		m_LoseDouble:false,  //输  加倍
	}

	m_stopLi =  [100,200,500,1000,2000,5000,10000,20000,50000,150000]   //停利
	m_stopSun = [100,200,500,1000,2000,5000,10000,20000,50000,150000]	//停损
	m_multiple = [1,2,5,10,20,50,100,200,500,1000]				//倍数
	m_Basicscore = [1000,2000,5000,10000,20000,50000,100000,200000,500000,1000000]			//底分

	m_Gameinning = [5,10,20,50,100,200]  //游戏自动局数控制

	//桌面当前倍数
	m_Currentmultiple  = 1.00

	static getinstance(){
		if (!this.m_instance) {
			this.m_instance = new GameInfo()
		}
		return this.m_instance
	}
}