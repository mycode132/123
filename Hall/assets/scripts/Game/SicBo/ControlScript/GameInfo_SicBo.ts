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

	// 原始位置 point_origin {x: *, y: *}  坐标原点设为(x: 0, y: 0), 
	// 返回旋转后的值 res {x: *, y: *}
	pointAtRotation(point_origin, rotation) {
		let x = point_origin.x
		let y = point_origin.y
		let x_abs = Math.abs(x)
		let y_abs = Math.abs(y)
		let radius = Math.sqrt(x*x + y*y) 
		// 
		let alpha_origin = 0
		if(x > 0 && y >= 0) {
			// 第一象限 + (radius, 0)
			alpha_origin =  Math.atan(y_abs/x_abs)
		}else if(x <= 0 && y > 0) {
			// 第2象限 + (0, radius)
			alpha_origin =  Math.atan(x_abs/y_abs) + Math.PI/2
		}else if(x < 0 && y <= 0) {
			// 第3象限 + (-radius, 0)
			alpha_origin = Math.atan(y_abs/x_abs) + Math.PI
		} else if(x >= 0 && y < 0) {
			// 第4象限 + (0, -radius)
			alpha_origin = Math.atan(x_abs/y_abs) + Math.PI*3/2
		}
		let alpha_2 = alpha_origin + rotation
		let alpha_3 = this.radinWithin2PI(alpha_2)
		return this.pointAtRadian(alpha_3, radius)
	}

	// 弧度 0 <= radian < 2PI，半径 radius
	// 返回弧度 = radian 处的点 {x: *, y: *}
	pointAtRadian(radian, radius) {
		let pi = Math.PI
		let pi_2 = pi/2
		let x = 0
		let y = 0
		
		if(radian >= 0 && radian < pi_2) {
			// 第一象限
			x = Math.cos(radian)*radius
			y = Math.sin(radian)*radius
		}else if(radian >= pi_2 && radian < pi) {
			// 第2象限
			let radian2 = radian - pi_2
			x = -Math.sin(radian2)*radius
			y = Math.cos(radian2)*radius
		}else if(radian >= pi && radian < pi_2*3) {
			// 第3象限
			let radian2 = radian - pi
			x = -Math.cos(radian2)*radius
			y = -Math.sin(radian2)*radius
		} else if(radian >= pi_2*3 && radian < pi*2) {
			// 第4象限
			let radian2 = radian - pi_2*3
			x = Math.sin(radian2)*radius
			y = -Math.cos(radian2)*radius
		}
		return {x: x, y: y}
	}

	// 0 <= radian2 < PI*2
	radinWithin2PI(radian) {
		let radian2 = radian
		while(radian2 < 0) {
			radian2 = radian2 + Math.PI*2
		}
		while(radian2 >=  Math.PI*2) {
			radian2 = radian2 - Math.PI*2
		}
		return radian2
	}
}