export default class GameInfo  {

	protected className: string = "GameInfo";

	private static m_instance: GameInfo = null;


	
	//游戏是否已经开始
	m_GameIsStart:boolean = false
	//游戏是否开启随机开奖
	m_GameRandomDraw:boolean = false

	//开启背景音效
	m_MusicBopen = true

	//自动开始配置
	m_GameAutoConfig = {
		//局数
		m_inningCount: 0,
		//止
		m_WinCount: 0,
		//止损
		m_LossCount:0,

		//游戏是否自动投注开始
		m_GameIsAutoStart:false,

		//选择炸弹数
		m_GameMinesCount:1,   //最低1

		//投注金额
		m_DownScore:1,

		//当局开起数目
		m_OpenCount:0,

		//游戏地图 5行5列
		GameMap : [ 0,0,0,0,0,
					0,0,0,0,0,
					0,0,0,0,0,
					0,0,0,0,0,
					0,0,0,0,0],

		//游戏倍率保存
		m_Mulpty:[],

	}
		


	static getinstance(){
		if (!this.m_instance) {
			this.m_instance = new GameInfo()
		}
		return this.m_instance
	}


	//游戏翻译


	
}