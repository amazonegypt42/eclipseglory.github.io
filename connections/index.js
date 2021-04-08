import BlackRedTree from "./black-red-tree.js";
import DrawableBRTree from "./drawable-brtree.js";
import TreeNode from "./tree-node.js";
import MyAnimation from "./animation.js";
import AnimationController from "./animation-controller.js";
import ColorSchema from "./color-schema.js";

// var brTree = new DrawableBRTree();
var animationController;
var ctx;
ColorSchema.currentSchema = 'dark';
document.addEventListener("DOMContentLoaded", function () {
    var button = document.getElementById('randomadd');
    var button1 = document.getElementById('addbutton');
    button.addEventListener('click', randomClick);
    button1.addEventListener('click', addClick);
    let ratio = window.devicePixelRatio;
    var canvas = document.getElementById("canvas");
    ctx = canvas.getContext('2d');
    animationController = new AnimationController(ctx);
    animationController.on('operationStart', operationStart);
    animationController.on('operationOver', fireOperationOver);
    canvas.width = canvas.clientWidth * ratio;
    canvas.height = canvas.clientHeight * ratio;
    canvas.style.background = `linear-gradient(135deg, #ffffff 0%, ${ColorSchema.getBackGroundColor()} 100%)`;
});

function randomClick(event) {
    if (animationController)
        animationController.addNode(Math.floor(Math.random() * 100));
}

function addClick(event) {
    if (animationController) {
        var input = document.getElementById('idinput');
        animationController.addNode(Number.parseInt(input.value));
    }
}


function fireOperationOver() {
    let button = document.getElementById('randomadd');
    var button1 = document.getElementById('addbutton');
    button.disabled = false;
    button1.disabled = false;
}

function operationStart() {
    var button = document.getElementById('randomadd');
    var button1 = document.getElementById('addbutton');
    button.disabled = true;
    button1.disabled = true;
}


function testModel() {
    var tree = new BlackRedTree();
    var u = new TreeNode(20, 'U');
    tree.insertNode(u);
    var p = new TreeNode(18, 'P');
    TreeNode.createConnection(u, p);
    var y = new TreeNode(21, 'y');
    y.changeToBlack();
    TreeNode.createConnection(u, y, false);

    var k = new TreeNode(14, 'K');
    k.changeToBlack();
    TreeNode.createConnection(p, k);

    var r = new TreeNode(19, 'R');
    r.changeToBlack();
    TreeNode.createConnection(p, r, false);

    var d = new TreeNode(12, 'D');
    TreeNode.createConnection(k, d);

    var m = new TreeNode(15, 'M');
    TreeNode.createConnection(k, m, false);

    var b = new TreeNode(1, 'B');
    tree.insertNode(b);

    console.assert(tree.root == p && p.isBlack);
    console.assert(p.left == k && k.isRed);
    console.assert(k.left == d && d.isBlack);
    console.assert(k.right == m && m.isBlack);
    console.assert(d.left == b && b.isRed);

    console.assert(p.right == u && u.isRed);
    console.assert(u.left == r && r.isBlack);
    console.assert(u.right == y && y.isBlack);
}