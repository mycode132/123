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


	//扑克排序  3-3
	fucPkSort(cardsArr){
		let cards = []
		for (let index = 0; index < cardsArr.length; index++) {
			let obj = {point:0,value:0,group:0}
			obj.value = cardsArr[index]
			obj.group = index < 3? 1  :2;
			obj.point = cardsArr[index]%13 != 0 ? cardsArr[index]%13 :13  //
			if (obj.point == 1) {  //  1-A
				obj.point = 14
			}
			cards.push(obj)
		}
		cards.sort( (c1, c2)=> {
			if( c1.group == c2.group){
				return c1.point - c2.point
			}
			return c1.group - c2.group;
		});

		for (let index = 0; index < cards.length; index++) {
			let obj   = cards[index];
			cardsArr[index] = obj.value
		}
	}
}