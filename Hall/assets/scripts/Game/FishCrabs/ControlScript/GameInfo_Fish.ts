// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html
export default class GameInfo  {

	protected className: string = "GameInfo";

	private static m_instance: GameInfo = null;


	//  1--  6组合
	//1   2   3    4    5    6
	//蟹  鱼  鸡   虾  葫芦  铜板

	//22哥中奖区域
	public m_GameData = [
		[0],     
		[1],
		[2],
		[3],
		[4],
		[5],
		[6],

		[2,4],
		[2,5],
		[2,6],
		[2,1],
		[2,3],

		[4,5],
		[4,6],
		[4,1],
		[4,3],

		[5,6],
		[5,1],
		[5,3],

		[6,1],
		[6,3],

		[1,3],
	]


	static getinstance(){
		if (!this.m_instance) {
			this.m_instance = new GameInfo()
		}
		return this.m_instance
	}

	fucGetWinArea(data){
		let n_WinArea = []
		let b_Have= true
		let temp = this.m_GameData[0];
		for (let index = 0; index < this.m_GameData.length; index++) {
			temp = this.m_GameData[index];
			b_Have= true
			for (let z = 0;  z < temp.length; z++) {
				if (data.indexOf(temp[z]) == -1) {
					b_Have = false
					break
				}
			}
			if (b_Have) {
				n_WinArea.push(index)
			}
		}
		if (data[0] ==  data[1] && data[1] ==data[2] ) {
			n_WinArea.push(0)
		}
		return n_WinArea
	}
}