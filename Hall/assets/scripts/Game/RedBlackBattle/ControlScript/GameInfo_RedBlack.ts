// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html
export default class GameInfo  {

	protected className: string = "GameInfo";

	private static m_instance: GameInfo = null;




	static getinstance(){
		if (!this.m_instance) {
			this.m_instance = new GameInfo()
		}
		return this.m_instance
	}


	//扑克算法
	fucGetWinArea(data){
	
	}
}