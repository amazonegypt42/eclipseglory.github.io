import ColorSchema from "./color-schema.js";
import Vector from "./math/vector.js";
import TreeNode from "./tree-node.js";

export default class DrawableNode extends TreeNode {
    constructor(id, radius = 20, value, black = false, xPadding = 20, yPadding = 20) {
        super(id, value, black);
        this.xPadding = xPadding;
        this.yPadding = yPadding;
        this._radius = radius;
        this.x = 0;
        this.y = 0;
        this._red = 255;
        this._green = 255;
        this._blue = 255;
        this.shadowBlur = 3;
        this.shadowOffset = 2;
        this._connectionsParams = new Array(2);
        this.scale = 1;
        this.innerPercent = 1;
    }

    get innerPercent() {
        return this._innerPercent;
    }

    set innerPercent(v) {
        if (v >= 0 || v <= 1) {
            if (this._innerPercent != v) {
                this._innerPercent = v;
                this._path = null;
            }
        }
    }

    get isLeftLeaf() {
        if (this.parent == null) return true;
        return this.parent.left == this;
    }

    get red() {
        return this._red;
    }

    set red(r) {
        if (r != this._red) {
            this._red = r;
            this._colorStr = null;
        }
    }

    get green() {
        return this._green;
    }

    set green(r) {
        if (r != this._green) {
            this._green = r;
            this._colorStr = null;
        }
    }

    get blue() {
        return this._blue;
    }

    set blue(r) {
        if (r != this._blue) {
            this._blue = r;
            this._colorStr = null;
        }
    }

    get radius() {
        return this._radius;
    }

    set radius(r) {
        if (r != this._radius) {
            this._radius = r;
            this._path = null;
        }
    }

    _getColorString() {
        if (this._colorStr == null) {
            this._colorStr = `rgb(${this.red},${this.green},${this.blue})`;
        }
        return this._colorStr;
    }

    _getPath() {
        if (this._path == null) {
            this._path = new Path2D();
            let ctx = this._path;
            let sr = this.radius * this.innerPercent
            if (this.innerPercent <= 0) {
                this._path.rect(-this.radius, -this.radius, this.radius * 2, this.radius * 2);
            } else {
                if (this.innerPercent >= 1) {
                    this._path.arc(0, 0, this.radius, 0, Math.PI * 2);
                } else {
                    let offsetX = -this.radius, offsetY = offsetX;
                    ctx.arc(sr + offsetX, sr + offsetY, sr, Math.PI, Math.PI + Math.PI / 2);
                    let nx = this.radius * 2 - sr + offsetX;
                    let ny = offsetY;
                    ctx.lineTo(nx, ny);
                    ctx.arc(nx, ny + sr, sr, -Math.PI / 2, 0);
                    nx = this.radius * 2 + offsetX;
                    ny = this.radius * 2 - sr + offsetY;
                    ctx.lineTo(nx, ny);
                    ctx.arc(nx - sr, ny, sr, 0, Math.PI / 2);
                    nx = sr + offsetX;
                    ny = offsetY + this.radius * 2;
                    ctx.lineTo(nx, ny);
                    ctx.arc(nx, ny - sr, sr, Math.PI / 2, Math.PI);
                    ctx.closePath();
                }
            }
        }
        return this._path;
    }

    calculateWidth() {
        let lw = 0, lh = 0;
        if (this.left != null) {
            var lr = this.left.calculateWidth();
            lw = lr['width'];
            lh = lr['height'];
        }
        let rw = 0, rh = 0;
        if (this.right != null) {
            var rr = this.right.calculateWidth();
            rw = rr['width'];
            rh = rr['height'];
        }
        let mywidth = Math.max(lw + rw, this.radius * 2 + this.xPadding);
        let myheight = Math.max(lh, rh) + this.radius * 2 + this.yPadding;
        this.dimension = { 'left': lw, 'right': rw, 'width': mywidth, 'height': myheight };
        return this.dimension;
    }

    layout(position = { x: 0, y: 0 }, dirtyNodes = []) {
        let leftx, rightx;
        if (this.left != null) {
            leftx = this.left.layout({ x: position.x, y: position.y + this.radius * 2 + this.yPadding },
                dirtyNodes);
        }
        if (this.right != null) {
            rightx = this.right.layout({ x: position.x + this.dimension.left, y: position.y + this.radius * 2 + this.yPadding },
                dirtyNodes);
        }
        this.oldX = this.x;
        this.oldY = this.y;

        if (leftx != null && rightx != null) {
            this.x = (leftx + rightx) / 2;
        } else {
            var width = this.dimension.width;
            this.x = position.x + width / 2;
        }
        this.y = position.y + this.radius;
        if (this.oldX != this.x || this.oldY != this.y) dirtyNodes.push(this);
        return this.x;
    }

    _getConnectionParams(x, y, isleft = true) {
        let index = isleft ? 0 : 1;
        let params = this._connectionsParams[index];
        if (params == null) {
            params = {
                'sourceX': this.x,
                'sourceY': this.y,
                'targetX': x,
                'targetY': y
            };
            this._connectionsParams[index] = params;
            let vector = new Vector(x - this.x, y - this.y);
            params['radian'] = Math.atan2(vector.y, vector.x);
            vector.normalize();
            vector.multiply(this.radius + this.shadowOffset);
            let s = new Vector(this.x, this.y);
            s.plus(vector);

            vector.multiply(-1);
            let e = new Vector(x, y);
            e.plus(vector);

            params['sx'] = s.x;
            params['sy'] = s.y;

            params['ex'] = e.x;
            params['ey'] = e.y;
        } else {
            let oldSX = params.sourceX;
            let oldSY = params.sourceY;
            let oldTX = params.targetX;
            let oldTY = params.targetY;
            if (oldSX != this.x || oldSY != this.y || oldTX != x || oldTY != y) {
                this._connectionsParams[index] = null;
                return this._getConnectionParams(x, y, isleft);
            }
        }
        return params;
    }

    _getLeftConnectionParam(x, y) {
        return this._getConnectionParams(x, y);
    }

    _getRightConnectionParam(x, y) {
        return this._getConnectionParams(x, y, false);
    }

    draw(ctx) {
        // 最先绘制连线，让连线显示在节点下方
        if (this.left) this._drawConnection(ctx, this._getConnectionParams(this.left.x, this.left.y), this.left.scale);
        if (this.right) this._drawConnection(ctx, this._getConnectionParams(this.right.x, this.right.y, false), this.right.scale);

        if (this.scale > 0) {
            ctx.save();
            ctx.translate(this.x, this.y);

            ctx.scale(this.scale, this.scale);
            ctx.fillStyle = this._getColorString();
            ctx.save();
            ctx.shadowBlur = this.shadowBlur;
            ctx.shadowOffsetX = this.shadowOffset;
            ctx.shadowOffsetY = this.shadowOffset;
            ctx.shadowColor = "#433d3c";
            ctx.fill(this._getPath());

            ctx.restore();
            ctx.fillStyle = ColorSchema.getBackGroundColor();
            ctx.textBaseline = 'middle';
            ctx.textAlign = 'center';
            ctx.font = `${Math.floor(this.radius * 0.9)}px Arial`;
            ctx.fillText(`${this.id}`, 0, 0, this.radius * 2);
            ctx.restore();
        }

        if (this.left) {
            this.left.draw(ctx);
        }
        if (this.right) {
            this.right.draw(ctx);
        }
    }

    _drawConnection(ctx, params, scale = 1) {
        if (scale <= 0) return;
        ctx.save();
        ctx.globalAlpha *= scale;
        // ctx.scale(scale, scale);
        ctx.beginPath();
        ctx.moveTo(params.sx, params.sy);
        ctx.lineTo(params.ex, params.ey);
        let lineColor = ColorSchema.getLineColor();
        ctx.strokeStyle = lineColor;
        ctx.fillStyle = lineColor;
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.translate(params.ex, params.ey);
        ctx.rotate(params.radian - Math.PI);
        ctx.fill(DrawableNode._getArrowPath(this.radius / 2));
        ctx.restore();
    }

    static _arrowPath;

    static _getArrowPath(width) {
        if (this._arrowPath == null) {
            this._arrowPath = new Path2D();
            let ctx = this._arrowPath;
            ctx.moveTo(0, 0);
            let l = width;
            let x = Math.floor(Math.cos(30 / 180 * Math.PI) * l);
            let y = Math.floor(Math.sin(30 / 180 * Math.PI) * l);
            ctx.lineTo(x, y);
            ctx.lineTo(x, Math.floor(y - l));
            ctx.closePath();
        }
        return this._arrowPath;
    }

    changeToBlack() {
        this.recordOldColor();
        let color = ColorSchema.getBlackColor();
        this.red = color.red;
        this.green = color.green;
        this.blue = color.blue;
        super.changeToBlack();
    }

    changeToRed() {
        this.recordOldColor();
        let color = ColorSchema.getRedColor();
        this.red = color.red;
        this.green = color.green;
        this.blue = color.blue;
        super.changeToRed();
    }

    recordOldColor() {
        this.oldRed = this.red;
        this.oldGreen = this.green;
        this.oldBlue = this.blue;
    }

    reverseColor() {
        let c = this.red;
        this.red = this.oldRed;
        this.oldRed = c;

        c = this.blue;
        this.blue = this.oldBlue;
        this.oldBlue = c;

        c = this.green;
        this.green = this.oldGreen;
        this.oldGreen = c;
    }
}