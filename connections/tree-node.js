export default class TreeNode {
    constructor(id, value, black = false) {
        this._id = id;
        if (this._id == null) throw 'ID can not be null';
        this._black = black;
        this.value = value;
        this.left;
        this.right;
        this.parent;
    }

    static createConnection(parent, child, isLeft = true) {
        if (isLeft) parent.left = child; else parent.right = child;
        child.parent = parent;
    }

    get isBlack() { return this._black; }

    get isRed() { return !this.isBlack }

    get id() {
        return this._id;
    }

    update(node) {
        this.value = node.value;
    }


    changeToRed() {
        this._black = false;
    }

    changeToBlack() {
        this._black = true;
    }

    /**
     * 
     * @returns 如果断开连接的时候是parent的左子树，返回true，右子树返回false。没有父节点返回null
     */
    disConnectParent() {
        if (this.parent == null) return null;
        if (this.parent.left == this) {
            this.parent.left = null;
            this.parent = null;
            return true;
        }
        if (this.parent.right == this) {
            this.parent.right = null;
            this.parent = null;
            return false;
        }
        return null;
    }

    leftRotate() {
        if (this.right == null) throw 'Cant left rotate without right child node';
        let effected = [];
        var oldParent = this.parent;
        var isLeft = false;
        if (this.parent != null) {
            isLeft = this.disConnectParent();
        }
        effected.push(this);

        var tempRight = this.right;
        effected.push(this.right);

        this.right.disConnectParent();

        if (tempRight.left != null) {
            var tempL = tempRight.left;
            effected.push(tempRight.left);
            tempRight.left.disConnectParent();
            TreeNode.createConnection(this, tempL, false);
        }
        TreeNode.createConnection(tempRight, this);

        if (oldParent != null) {
            TreeNode.createConnection(oldParent, tempRight, isLeft);
        }
        return effected;
    }

    rightRotate() {
        if (this.left == null) throw 'Cant right rotate without left child node';
        let effected = [];
        var oldParent = this.parent;
        var isLeft = false;
        if (this.parent != null) {
            isLeft = this.disConnectParent();
        }
        effected.push(this);

        var tempLeft = this.left;
        effected.push(this.left);
        this.left.disConnectParent();

        if (tempLeft.right != null) {
            var tempR = tempLeft.right;
            effected.push(tempLeft.right);
            tempLeft.right.disConnectParent();
            TreeNode.createConnection(this, tempR);
        }
        TreeNode.createConnection(tempLeft, this, false);

        if (oldParent != null) {
            TreeNode.createConnection(oldParent, tempLeft, isLeft);
        }
        return effected;
    }

    rotate(l) { if (l) return this.leftRotate(); else return this.rightRotate(); }

    insertNode(node) {
        if (node.id == this.id) {
            this._debug(`找到更新点，使用${node.toString()}更新信息`);
            this.update(node);
            return null;
        } else {
            if (this.id > node.id) {
                if (this.left != null) {
                    return this.left.insertNode(node);
                } else {
                    this._debug(`找到插入位置，插入节点${node.toString()}作为左节点`);
                    TreeNode.createConnection(this, node);
                    return node;
                    // return node.blanceSubTree();
                }
            } else {
                if (this.right != null) {
                    return this.right.insertNode(node);
                } else {
                    this._debug(`找到插入位置，插入节点${node.toString()}作为右节点`);
                    TreeNode.createConnection(this, node, false);
                    return node;
                    // return node.blanceSubTree();
                }
            }
        }
    }


    blanceSubTree(changedNodes = []) {

        this._debug('平衡子树 : ');
        if (this.parent == null) {
            // 根节点必须是黑色
            // if (this.isBlack) return null;
            this._debug('该节点为根节点，修改颜色');
            this.changeToBlack();
            changedNodes.push(this);
            return { 'change': changedNodes };
        }
        if (this.isBlack) return null;
        if (this.parent.isBlack) {
            this._debug(`父节点${this.parent.toString()}为黑色节点，不做任何修改`);
            return null;
        }
        var grande = this.parent.parent;
        if (grande == null) {
            throw 'Blance sub-tree error, grande node can not be null';
        }
        var _pbro = grande.left == this.parent ? grande.right : grande.left;
        var leftParent = grande.left == this.parent;
        var isleft = this.parent.left == this;
        if (_pbro != null && _pbro.isRed) {
            this._debug(`修改祖父节点(${grande.toString()})为红色，更改父节点(${this.parent.toString()})、叔父节点(${_pbro.toString()})为黑色，子树保持平衡`);

            _pbro.changeToBlack();
            this.parent.changeToBlack();
            changedNodes.push(_pbro);
            changedNodes.push(this.parent);
            // if (grande.parent != null) {
            //     grande.changeToRed();
            //     changedNodes.push(grande);
            //     return { 'next': grande, 'change': changedNodes };
            // } else {
            //     return { 'change': changedNodes };
            // }
            grande.changeToRed();
            changedNodes.push(grande);
            return { 'next': grande, 'change': changedNodes };
        } else {
            var tempParent = this.parent;
            let effected;
            if (leftParent != isleft) {
                this._debug(`对父节点(${this.parent.toString()})进行旋转`);
                effected = this.parent.rotate(!isleft);
            } else {
                this._debug(`修改祖父节点(${grande.toString()})为红色，更改父节点(${this.parent.toString()})为黑色，对祖父节点进行旋转`);
                this.parent.changeToBlack();
                grande.changeToRed();
                changedNodes.push(grande);
                changedNodes.push(this.parent);
                effected = grande.rotate(!leftParent);
            }
            if (tempParent.isBlack) {
                return { 'change': changedNodes, 'effected': effected };
            } else { return { 'next': tempParent, 'change': changedNodes, 'effected': effected }; }
        }
    }


    _debug(msg) {
        console.log(`${this.toString()} - ${msg}`);
    }

    toString() {
        if (this.value != null) return `Node(${this.id})[${this.value}]`;
        return `Node(${this.id})`;
    }
}