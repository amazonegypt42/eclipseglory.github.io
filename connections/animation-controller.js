import DrawableBRTree from "./drawable-brtree.js";
import MyAnimation from "./animation.js";

export default class AnimationController {

    constructor(ctx) {
        this.ctx = ctx;
        this.brTree = new DrawableBRTree();
        this._eventHandler = {};
    }

    on(eventName, handler) {
        let handlers = this._eventHandler[eventName];
        if (handlers == null) {
            this._eventHandler[eventName] = [];
            handlers = this._eventHandler[eventName];
        }
        handlers.push(handler);
    }

    _fireOperationStart() {
        let handlers = this._eventHandler['operationStart'];
        if (handlers != null) {
            handlers.forEach((handler) => {
                handler();
            });
        }
    }

    _fireOperationOver() {
        let handlers = this._eventHandler['operationOver'];
        if (handlers != null) {
            handlers.forEach((handler) => {
                handler();
            });
        }
    }

    addNode(id) {
        this._fireOperationStart();
        new Promise((resolve, reject) => {
            setTimeout(() => {
                // let node = brTree.insertNode(id);
                let node = this.brTree.insertNode(id);
                let result = this.brTree.layout();
                resolve({ 'r': result, 'node': node });
            }, 0);
        }).then((t) => {
            let result = t.r;
            let insertNode = t.node;
            let dirty = result.dirty;
            let region = result.region;
            this.brTree.updateSize(region);
            let animation = new MyAnimation(500, { x1: 0.37, y1: -0.47, x2: 0.61, y2: 1.45 });
            dirty.forEach((node) => {
                if (insertNode != null && node.id == insertNode.id) return;
                this.registPositionChange(animation, node);
            });
            if (insertNode) {
                animation.add(insertNode, 'scale', 0, 1);
                if (insertNode.isLeftLeaf) {
                    animation.add(insertNode, 'innerPercent', insertNode.innerPercent, 1);
                } else {
                    animation.add(insertNode, 'innerPercent', insertNode.innerPercent, 0);
                }
            }
            this._registerTreeDimensionChange(animation);
            return new Promise((resolve, reject) => {
                animation.forward((progress) => {
                    this._refreshTree();
                    if (progress == 1) {
                        if (t.node != null && t.node.isRed) {
                            resolve(t.node);
                        } else resolve();
                    }
                });
            });
        }).then((node) => {
            if (node == null) {
                this._fireOperationOver();
                return;
            }
            this.needToBlance(node);
        });
    }

    registPositionChange(animation, node) {
        animation.add(node, 'x', node.oldX, node.x);
        animation.add(node, 'y', node.oldY, node.y);
    }

    registColorChange(animation, node) {
        animation.add(node, 'red', node.oldRed, node.red);
        animation.add(node, 'green', node.oldGreen, node.green);
        animation.add(node, 'blue', node.oldBlue, node.blue);
    }

    needToBlance(node) {
        let blance = node.blanceSubTree();
        if (blance == null) { this._fireOperationOver(); return; }
        this.flashNode(node, blance.change).then(() => {
            let result = this.brTree.layout();
            let dirty = result.dirty;
            let region = result.region;
            this.brTree.updateSize(region);

            let animation = new MyAnimation();
            dirty.forEach((node) => {
                this.registPositionChange(animation, node);
            });
            blance.change.forEach((n) => {
                this.registColorChange(animation, n);
            });
            let effected = blance.effected;
            if (effected != null) {
                effected.forEach((effectNode) => {
                    if (effectNode.isLeftLeaf) {
                        animation.add(effectNode, 'innerPercent', effectNode.innerPercent, 1);
                    } else {
                        animation.add(effectNode, 'innerPercent', effectNode.innerPercent, 0);
                    }
                });
            }
            this._registerTreeDimensionChange(animation);
            animation.forward((progress) => {
                this._refreshTree();
                if (progress == 1) {
                    var next = blance.next;
                    if (next == null) {
                        this._fireOperationOver();
                        return;
                    }
                    setTimeout(this.needToBlance(next), 500);
                }
            });
        });
    }

    _registerTreeDimensionChange(animation) {
        animation.add(this.brTree, 'width', this.brTree.oldWidth, this.brTree.width);
        animation.add(this.brTree, 'height', this.brTree.oldHeight, this.brTree.height);
    }

    saveNodeColor(node) {
        return {
            oldRed: node.oldRed,
            oldBlue: node.oldBlue,
            oldGreen: node.oldGreen,
            red: node.red,
            blue: node.blue,
            green: node.green
        }
    }

    restoreNodeColor(colors, node) {
        node.red = colors.red;
        node.blue = colors.blue;
        node.green = colors.green;
        node.oldRed = colors.oldRed;
        node.oldGreen = colors.oldGreen;
        node.oldBlue = colors.oldBlue;
    }

    lightColor(color, amount = 0.3) {
        color.red = Math.min(255, color.red + 255 * amount);
        color.green = Math.min(255, color.green + 255 * amount);
        color.blue = Math.min(255, color.blue + 255 * amount);
    }


    flashNode(node, changes) {
        changes.forEach((changeNode) => {
            changeNode.reverseColor();
        });

        let animation = new MyAnimation(500);

        let savedColors = {};

        savedColors[node.id] = this.saveNodeColor(node);
        node.recordOldColor();
        this.lightColor(node);
        this.registColorChange(animation, node);
        animation.add(node, 'shadowOffset', node.shadowOffset, 1);

        changes.forEach((changeNode) => {
            if (changeNode.id == node.id) return;
            savedColors[changeNode.id] = this.saveNodeColor(changeNode);
            changeNode.recordOldColor();
            this.lightColor(changeNode);
            this.registColorChange(animation, changeNode);
            animation.add(changeNode, 'shadowOffset', changeNode.shadowOffset, 1);
        });

        let count = 0;
        let times = 2;
        return new Promise((resolve, reject) => {
            let that = this;
            function refresh() {
                animation.forward((progress) => {
                    that._refreshTree();
                    if (progress == 1) {
                        count++;
                        if (count > times * 2 - 1) {
                            that.restoreNodeColor(savedColors[node.id], node);
                            changes.forEach((changeNode) => {
                                if (changeNode.id != node.id) {
                                    that.restoreNodeColor(savedColors[changeNode.id], changeNode);
                                }
                                changeNode.reverseColor();
                            });
                            resolve();
                            return;
                        }
                        animation.reverse((progress) => {
                            that._refreshTree();
                            if (progress == 1) {
                                count++;
                                if (count > times * 2 - 1) {
                                    that.restoreNodeColor(savedColors[node.id], node);
                                    changes.forEach((changeNode) => {
                                        if (changeNode.id != node.id) {
                                            that.restoreNodeColor(savedColors[changeNode.id], changeNode);
                                        }
                                        changeNode.reverseColor();
                                    });
                                    resolve();
                                    return;
                                }
                                refresh();
                            }
                        })
                    }
                });
            }
            refresh();
        });

    }

    _refreshTree() {
        this.brTree.draw(this.ctx);
    }

}