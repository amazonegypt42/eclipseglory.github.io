/**
 * 该算法是将多个顺序连接的点进行简化的算法，更多详情请查阅：
 * https://en.wikipedia.org/wiki/Ramer%E2%80%93Douglas%E2%80%93Peucker_algorithm
 * @param {Array} points 
 * @param {Number} epsilon 
 * @param {Number} start
 * @param {Number} end
 */
 function douglasPeucker(points, epsilon = 10, start, end) {
    if (!points || points.length == 0) return;
    if (points.length < 3) {
        return points.map((v) => [v[0], v[1]]);
    }
    start = start == null ? 0 : start;
    end = end == null ? points.length - 1 : end;
    let dmax = -Infinity;
    let index = -1;
    let v = new _Vector(points[end][0] - points[start][0], points[end][1] - points[start][1]);
    v.normalize();
    for (let i = start + 1; i < end; i++) {
        let dis = _perpendicularDistanceSquare(points[i], points[start], v);
        if (dis > dmax) {
            dmax = dis;
            index = i;
        }
    }

    if (dmax > epsilon * epsilon) {
        let r1 = douglasPeucker(points, epsilon, start, index);
        let r2 = douglasPeucker(points, epsilon, index, end);
        r1.pop();
        return r1.concat(r2);
    } else {
        let r = [[points[start][0], points[start][1]], [points[end][0], points[end][1]]];
        return r;
    }
}

/**
 * 计算投影点到某线段的距离的平方
 * @param {Array} p 投影点
 * @param {Array} p1 线段起点
 * @param {Array} v 线段单位向量
 */
function _perpendicularDistanceSquare(p, p1, v) {
    let v2 = new _Vector(p[0] - p1[0], p[1] - p1[1]);
    let d = v2.dot(v.x, v.y);
    let x = p1[0] + v.x * d;
    let y = p1[1] + v.y * d;
    let dx = x - p[0];
    let dy = y - p[1];
    return dx * dx + dy * dy;
}

/**
 * 方便计算创建的一个向量类。内部类
 */
class _Vector {
    constructor(x, y) {
        this.x = x, this.y = y
    }

    _length() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    normalize() {
        let l = this._length();
        this.x = this.x / l;
        this.y = this.y / l;
    }

    dot(x, y) {
        return this.x * x + this.y * y;
    }
}
export {
    douglasPeucker
}