export default class BlackRedTree {

    constructor() {
        this.root;
    }

    insertNode(node) {
        if (this.root == null) {
            this.root = node;
            this.root.changeToBlack();
            return this.root;
        }
        return this.root.insertNode(node);
    }
}
