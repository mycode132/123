export default class SubgameConfig {
	// 子游戏注册模块
	/**
	 * 游戏唯一标志
	 */
   	private _gameID: number;
	public get gameID(): number {
		return this._gameID;
	}
	public set gameID(value: number) {
		this._gameID = value;
	}

	/**
	 * 游戏LotteryType
	 */
	private _LotteryType: string;
	public get gameLotteryType(): string {
		return this._LotteryType;
	}
	public set gameLotteryType(value: string) {
		this._LotteryType = value;
	}

	/**
	 * 游戏下注区域定义
	 */
	private _gameArea = new Array()
	public get gameArea(): any{
		return this._gameArea;
	}
	public set gameArea(value: any) {
		this._gameArea = value;
	}

	/**
	 * 游戏开奖时间
	 */
	private _gameTime: number;
	public get gameTime(): number {
		return this._gameTime;
	}
	public set gameTime(value: number) {
		this._gameTime = value;
	}


	
	/**
	 * 游戏名称
	 */
	private _gameName: string;
	public get gameName(): string {
		return this._gameName;
	}
	public set gameName(value: string) {
		this._gameName = value;
	}

	/**
	 * 游戏场景名称  待用
	 */
	private _sceneName: string;
	public get sceneName(): string {
		return this._sceneName;
	}
	public set sceneName(value: string) {
		this._sceneName = value;
	}

	/**
	 * 游戏预制体路径
	 */
	private _pathOfGamePrefab: string;
	public get pathOfGamePrefab(): string {
		return this._pathOfGamePrefab;
	}
	public set pathOfGamePrefab(value: string) {
		this._pathOfGamePrefab = value;
	}


	/**
	 * 游戏说明预制体路径
	 */
	 private _pathOfGameExplainPrefab: string;
	 public get pathOfGameExplainPrefab(): string {
		 return this._pathOfGameExplainPrefab;
	 }
	 public set pathOfGameExplainPrefab(value: string) {
		 this._pathOfGameExplainPrefab = value;
	 }

	/**
	 * 游戏预制体脚本类名
	 */
	private _classNameOfGamePrefab: string;
	public get classNameOfGamePrefab(): string {
		return this._classNameOfGamePrefab;
	}
	public set classNameOfGamePrefab(value: string) {
		this._classNameOfGamePrefab = value;
	}


	/**
	 *是否需要添加公共资源（影响加载速度）
	 */
	 private _bAddPublicSrc: boolean  = true;
	 public get AddPublicSrc(): boolean {
		 return this._bAddPublicSrc;
	 }
	 public set AddPublicSrc(value: boolean) {
		 this._bAddPublicSrc = value;
	 }
}