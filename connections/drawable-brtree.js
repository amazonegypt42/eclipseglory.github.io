import BlackRedTree from "./black-red-tree.js";
import DrawableNode from "./drawable-node.js";

export default class DrawableBRTree {

    constructor(props = { nodeRadius: 20, columnSpace: 20, minPointSpace: 10 }) {
        this.nodeRadius = props.nodeRadius == null ? 50 : props.nodeRadius;
        this.columnSpace = props.columnSpace == null ? 50 : props.columnSpace;
        this.minPointSpace = props.minPointSpace == null ? 20 : props.minPointSpace;
        this._tree = new BlackRedTree();
        this.width = 0;
        this.height = 0;
    }

    get root() {
        return this._tree.root;
    }

    set root(r) {
        this._tree.root = r;
    }

    updateSize(region) {
        this.oldWidth = this.width;
        this.oldHeight = this.height;
        this.width = region.width;
        this.height = region.height;
    }

    insertNode(id, props = {}) {
        let node = new DrawableNode(id, this.nodeRadius, props.value, false, this.nodeRadius, this.nodeRadius);
        node.changeToRed();
        let newNode = this._tree.insertNode(node);
        return newNode;
    }

    draw(ctx) {
        ctx.save();
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.translate(ctx.canvas.width / 2, ctx.canvas.height / 2);
        let scale = 1;
        if (this.width > canvas.width) {
            scale = Math.min(canvas.width / this.width, scale);
        }
        if (this.height > canvas.height) {
            scale = Math.min(canvas.height / this.height, scale);
        }
        if (scale != 1) {
            ctx.scale(scale, scale);
        }
        ctx.translate(-this.width / 2, -this.height / 2);
        this._findRoot(this.root);
        this.root.draw(ctx);
        // TODO : debug:
        ctx.strokeStyle = 'black';
        ctx.strokeRect(0, 0, this.width, this.height);
        ctx.restore();
    }


    _findRoot(node) {
        // 分段进行动画展示的时候，根节点会变化，这就需要重新寻找
        if (node.parent != null) {
            return this._findRoot(node.parent);
        } else {
            this.root = node;
            return this.root;
        }
    }

    layout() {
        let root = this._findRoot(this.root);
        if (root == null) return null;
        let dimension = root.calculateWidth();
        let dirtyNodes = [];
        root.layout({ x: 0, y: 0 }, dirtyNodes);
        return { 'dirty': dirtyNodes, 'region': { 'width': dimension.width, 'height': dimension.height } };
    }

    _constriantNodePosition(
        node, position, width, dirtyNodes = []) {
        if (node == null) return;
        node.oldX = node.x;
        node.x = position.x;
        node.oldY = node.y;
        node.y = position.y;

        if (node.oldX != node.x || node.oldY != node.y) dirtyNodes.push(node);
        var half = width / 2;
        this._constriantNodePosition(
            node.left,
            { 'x': position.x - half, 'y': position.y + node.radius * 2 + this.columnSpace },
            half,
            dirtyNodes);
        this._constriantNodePosition(
            node.right,
            { 'x': position.x + half, 'y': position.y + node.radius * 2 + this.columnSpace },
            half,
            dirtyNodes);
    }

}