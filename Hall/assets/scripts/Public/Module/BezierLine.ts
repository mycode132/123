/**
 * @desc 贝塞尔曲线  与cocos creator 有点差异
 */
 class Bezier {
    /**
       * 多阶贝塞尔曲线的生成
       * @param {*} anchorpoints 贝塞尔基点数组
       * @param {*} pointsAmount 生成的点数
       * @returns 路径点的Array
       */
    CreateBezierPoints(anchorpoints, pointsAmount) {
        let points = [];
        for (let i = 0; i < pointsAmount; i++) {
            let point = this.MultiPointBezier(anchorpoints, i / pointsAmount);
            points.push(point);
        }
        return points;
    }

    MultiPointBezier(points, t) {
        let len = points.length;
        let x = 0; let y = 0;
        let erxiangshi = function (start, end) {
            let cs = 1; let bcs = 1;
            while (end > 0) {
                cs *= start;
                bcs *= end;
                start--;
                end--;
            }
            return (cs / bcs);
        };
        for (let i = 0; i < len; i++) {
            let point = points[i];
            x += point[0] * Math.pow((1 - t), (len - 1 - i)) * Math.pow(t, i) * (erxiangshi(len - 1, i));
            y += point[1] * Math.pow((1 - t), (len - 1 - i)) * Math.pow(t, i) * (erxiangshi(len - 1, i));
        }
        return [x, y];
    }
}

export default new Bezier();