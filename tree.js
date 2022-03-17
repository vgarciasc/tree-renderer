class Tree {
    constructor(nodes, config) {
        this.nodes = nodes;
        this.config = config;
    }
    
    getChildren(node) {
        return nodes.filter((n) => n.parent_id == node.id);
    }
    
    getParent(node) {
        if (node.parent_id != null) {
            return nodes[node.parent_id];
        }
        
        return null;
    }
    
    getSiblings(node) {
        var parent = this.getParent(node)
        
        if (parent) {
            var siblings = this.getChildren(parent)
            return siblings
        }
        
        return [node];
    }
    
    getPreviousSibling(node) {
        var siblings = this.getSiblings(node);
        var my_sibling_id = siblings.findIndex((f) => f.id == node.id);
        
        if (my_sibling_id > 0) {
            return siblings[my_sibling_id - 1];
        } else {
            return node;
        }
    }
    
    isLeftmostSibling(node) {
        return this.getSiblings(node)[0] == node;
    }
    
    isRightmostSibling(node) {
        var siblings = this.getSiblings(node);
        return siblings[siblings.length - 1] == node;
    }
    
    isLeaf(node) {
        return this.getChildren(node).length == 0;
    }
    
    preOrderTraversal(node, fn) {
        fn(node);
        for (var child of this.getChildren(node)) {
            this.preOrderTraversal(child, fn)
        }
    }
    
    postOrderTraversal(node, fn) {
        for (var child of this.getChildren(node)) {
            this.postOrderTraversal(child, fn)
        }
        fn(node);
    }
}