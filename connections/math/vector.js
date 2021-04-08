export default class Vector {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    get x() { return this._x; }
    set x(v) {
        if (this._x != v) {
            this._x = v;
            this._length = null;
        }
    }
    get y() { return this._y; }
    set y(v) {
        if (this._y != v) {
            this._y = v;
            this._length = null;
        }
    }

    get length() {
        if (this._length == null) {
            this._length = Math.sqrt(this.x * this.x + this.y * this.y);
        }
        return this._length;
    }

    normalize() {
        let l = this.length;
        this.x = this.x / l;
        this.y = this.y / l;
    }

    multiply(value) {
        this.x *= value;
        this.y *= value;
    }

    plus(vector) {
        this.x += vector.x;
        this.y += vector.y;
    }

    clone() {
        return new Vector(this.x, this.y);
    }

}