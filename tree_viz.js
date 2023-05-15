class VisualizableTree extends Tree {
    initialize() {
        let root = this.nodes[0];
        root.y = 0;

        this.calculateInitialPositions(root);
        this.checkChildrenOnScreen(root);
        this.calculateFinalPositions(root);
    }

    draw(buffer) {
        this.buffer = buffer;

        this.max_x = 0;
        this.max_y = 0;
        this.min_x = 10000;
        this.min_y = 10000;

        this.drawNode(this.nodes[0]);
    }
    
    calculateInitialPositions(node, sibling_idx=0) {
        var parent = this.getParent(node);
        var children = this.getChildren(node);
        var siblings = parent ? this.getChildren(parent) : [];
        
        var is_leftmost_sibling = (sibling_idx == 0);
        var is_leaf = (children.length == 0);
        
        for (var i = 0; i < children.length; i++) {
            let child = children[i];
            child.y = node.y + 1;
            this.calculateInitialPositions(child, i);
        }
        
        node.final_x = 0;
        node.mod = 0;
        
        if (is_leaf) {
            if (is_leftmost_sibling) {
                node.x = 0;
            } else {
                node.x = siblings[sibling_idx - 1].x + 1;
            }
        }
        else if (children.length == 1) {
            var child = children[0];
            
            if (is_leftmost_sibling) {
                node.x = child.x;
            } else {
                node.x = siblings[sibling_idx - 1].x + 1;
                node.mod = node.x - child.x;
            }
        }
        else {
            var leftmost_child = children[0];
            var rightmost_child = children[children.length - 1];
            var midway_dist = (leftmost_child.x + rightmost_child.x) / 2;
            
            if (is_leftmost_sibling) {
                node.x = midway_dist;
            } else {
                node.x = siblings[sibling_idx - 1].x + 1;
                node.mod = node.x - midway_dist;
            }
        }
        
        if (!is_leaf && !is_leftmost_sibling) {
            this.fixConflicts(node, sibling_idx);
        }
    }
    
    calculateFinalPositions(node, mod_sum=0) {
        node.x += mod_sum;
        mod_sum += node.mod
        
        for (var child of this.getChildren(node)) {
            this.calculateFinalPositions(child, mod_sum);
        }
    }
    
    fixConflicts(node, sibling_idx = 0) {
        if (node == this.nodes[8]) {
            print("BEFORE: " + node.x);
        }
        var parent = this.getParent(node);
        var siblings = parent ? this.getChildren(parent) : [];
        
        var min_distance = this.config.min_distance;
        var shift_value = 0;
        
        var node_contour = this.getLeftContour(node);
        var node_contour_lvls = Object.keys(node_contour).map((f) => parseInt(f));
        var node_contour_max_lvl = Math.max.apply(Math, node_contour_lvls);
        
        for (var i = 0; i < sibling_idx; i++) {
            let sibling = siblings[i];
            
            let sibling_contour = this.getRightContour(sibling);
            let sibling_contour_lvls = Object.keys(sibling_contour).map((f) => parseInt(f));
            let sibling_contour_max_lvl = Math.max.apply(Math, sibling_contour_lvls);
            
            for (var lvl = node.y + 1; lvl <= Math.min(node_contour_max_lvl, sibling_contour_max_lvl); lvl++) {
                let distance = node_contour[lvl] - sibling_contour[lvl];
                if (distance + shift_value < min_distance) {
                    shift_value = Math.max(min_distance - distance, shift_value);
                }
            }
        }
            
        if (shift_value > 0) {
            node.x += shift_value;
            node.mod += shift_value;
            
            this.centerNodesBetween(node, siblings[siblings.length - 1])
            shift_value = 0;
        }

        if (node == this.nodes[8]) {
            print("AFTER: " + node.x);
        }
    }
    
    getLeftContour(node, mod_sum=0, contours={}) {
        if (contours[node.y] == null) {
            contours[node.y] = node.x + mod_sum;
        } else {
            contours[node.y] = Math.min(contours[node.y], node.x + mod_sum);
        }

        mod_sum += node.mod;
        
        for (var child of this.getChildren(node)) {
            contours = this.getLeftContour(child, mod_sum, contours);
        }
        
        return contours;
    }
    
    getRightContour(node, mod_sum=0, contours={}) {
        if (contours[node.y] == null) {
            contours[node.y] = node.x + mod_sum;
        } else {
            contours[node.y] = Math.max(contours[node.y], node.x + mod_sum);
        }

        mod_sum += node.mod;
        
        for (var child of this.getChildren(node)) {
            contours = this.getRightContour(child, mod_sum, contours);
        }
        
        return contours;
    }
    
    drawNode(node) {
        var config = this.config;
        var x = node.x * (config.node_width + config.padding_x);
        var y = node.y * (config.node_height + config.padding_y);
        
        this.drawNodeContent(node, x, y);
        this.drawNodeEdges(node, x, y);

        for (var child of this.getChildren(node)) {
            this.drawNode(child);
        }
    }
    
    drawNodeContent(node, x, y) {
        var config = this.config;
        var nodeWidth = 0;

        switch (this.config.node_width_style) {
            case "fixed":
                nodeWidth = this.config.node_width;
                break;
            case "fit":
            default:
                nodeWidth = constrain(
                    textWidth(node.label) * 1.2,
                    config.min_node_width,
                    config.max_node_width);
                break;
        }

        var rectX = x + config.node_width / 2 - nodeWidth / 2;

        switch (this.config.node_style) {
            case "rounded_rect":
                this.buffer.rect(rectX, y, nodeWidth, config.node_height, 5)
                break;
            case "rect":
            default:
                this.buffer.rect(rectX, y, nodeWidth, config.node_height)
                break;
        }
        
        this.buffer.textAlign(CENTER, CENTER)
        this.buffer.text(node.label,
                rectX,
                y,
                nodeWidth,
                config.node_height);

        if (rectX + nodeWidth > this.max_x) {
            this.max_x = round(rectX + nodeWidth);
        }
        if (rectX < this.min_x) {
            this.min_x = round(rectX);
        }
        if (y + config.node_height > this.max_y) {
            this.max_y = round(y + config.node_height);
        }
        if (y < this.min_y) {
            this.min_y = round(y);
        }

        this.width = this.max_x - this.min_x;
        this.height = this.max_y - this.min_y;
    }

    drawNodeEdges(node, x, y) {
        switch(this.config.edge_style) {
            case "line":
                this.drawNodeEdgesDirectLine(node, x, y);
                return;
            case "rect":
            default:
                this.drawNodeEdgesRectangular(node, x, y);
                return;
        }
    }

    drawNodeEdgesDirectLine(node, x, y) {
        var children = this.getChildren(node);
        var config = this.config;

        for (var child of children) {
            this.buffer.line(
                x + config.node_width / 2,
                y + config.node_height,
                child.x * (config.node_width + config.padding_x) + config.node_width/2,
                child.y * (config.node_height + config.padding_y))
        }
    }
    
    drawNodeEdgesRectangular(node, x, y) {
        var children = this.getChildren(node);
        var parent = this.getParent(node);
        var config = this.config;
        
        if (parent != null) {
            this.buffer.line(
                x + config.node_width / 2,
                y,
                x + config.node_width / 2,
                y - config.padding_y / 2);
        }
            
        if (children.length > 0) {
            this.buffer.line(
                x + config.node_width / 2,
                y + config.node_height,
                x + config.node_width / 2,
                y + config.node_height + config.padding_y / 2);
        }
        
        if (children.length > 0) {
            var leftmost_child = children[0];
            var rightmost_child = children[children.length - 1];
            
            this.buffer.line(
                leftmost_child.x * (config.padding_x + config.node_width) + config.node_width/2,
                node.y * (config.node_height + config.padding_y) + config.node_height + config.padding_y/2,
                rightmost_child.x * (config.padding_x + config.node_width) + config.node_width/2,
                node.y * (config.node_height + config.padding_y) + config.node_height + config.padding_y/2);
        }
    }
        
    centerNodesBetween(right_node, left_node) {
        let siblings = this.getSiblings(left_node);
        let left_sibling_id = siblings.findIndex((f) => f.id == left_node.id);
        let right_sibling_id = siblings.findIndex((f) => f.id == right_node.id);
        let num_nodes_between = (right_sibling_id - left_sibling_id) - 1;
        
        if (num_nodes_between > 0) {
            let distance_between_nodes = (right_node.x - left_node.x) / (num_nodes_between + 1);
            
            let count = 1;
            for (var i = left_sibling_id + 1; i < right_sibling_id; i++) {
                let middle_node = siblings[i];
                
                let desired_x = left_node.x + (distance_between_nodes * count);
                let offset = desired_x - middle_node.x;
                
                middle_node.x += offset;
                middle_node.mod += offset;
                
                count++;
            }
            
            this.fixConflicts(left_node, left_sibling_id);
        }
    }

    checkChildrenOnScreen(node) {
        var left_contour = this.getLeftContour(node);

        var shift_value = 0;
        for (var key of Object.keys(left_contour)) {
            if (left_contour[key] + shift_value < 0) {
                shift_value = (left_contour[key] * -1);
            }
        }

        if (shift_value > 0) {
            node.x += shift_value;
            node.mod += shift_value;
        }
    }
}