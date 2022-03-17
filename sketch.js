// let nodes = [
//     {id: 0,  parent_id: null, label: "O"},
//     {id: 1,  parent_id: 0, label: "E"},
//     {id: 2,  parent_id: 0, label: "F"},
//     {id: 3,  parent_id: 0, label: "N"},
//     {id: 4,  parent_id: 1, label: "A"},
//     {id: 5,  parent_id: 1, label: "D"},
//     {id: 6,  parent_id: 5, label: "B"},
//     {id: 7,  parent_id: 5, label: "C"},
//     {id: 8,  parent_id: 3, label: "G"},
//     {id: 9,  parent_id: 3, label: "M"},
//     {id: 10, parent_id: 9, label: "H"},
//     {id: 11, parent_id: 9, label: "I"},
//     {id: 12, parent_id: 9, label: "J"},
//     {id: 13, parent_id: 9, label: "K"},
//     {id: 14, parent_id: 9, label: "L"},
// ]

let config = {
    node_width: 100,
    node_height: 50,
    max_node_width: 200,
    min_node_width: 80,
    padding_x: 40,
    padding_y: 40,
    min_distance: 1,
    node_width_style: "fixed",
    node_style: "rounded_rect",
    edge_style: "line",
}

let tree;
let input_string = $("#tree-input").val();
input_string = `- A
-- B
-- C
--- D
--- E
---- F
--- G
---- H
---- I
-- J
--- K
--- L
---- M
--- N
-- O`;
let nodes = parseStringToTree(input_string);

let zoom = 1.00;
let zMin = 0.05;
let zMax = 9.00;
let sensitivity = 0.001;
let offset = {x: 250, y: 150};
let dragging = false;
let lastMouse = {x: 0, y: 0};

let cv = null;
let mg = null;

function setup() {
    cv = createCanvas(800, 600);
    cv.parent("canvas-holder");

    mg = createGraphics(5000, 5000);
    mg.textAlign(CENTER);

    updateTree();
}

function draw() {
    background(255);
    
    mg.background(255);

    mg.push();
    mg.translate(offset.x, offset.y);
    mg.scale(zoom);

    tree.draw(mg);
    image(mg, 0, 0);

    mg.pop();
}

function mousePressed() {
    if (!isHoveringCanvas()) {
        return;
    }

    dragging = true;
    lastMouse.x = mouseX;
    lastMouse.y = mouseY;
}

function mouseDragged() {
    if (dragging) {
        offset.x += (mouseX - lastMouse.x);
        offset.y += (mouseY - lastMouse.y);
        lastMouse.x = mouseX;
        lastMouse.y = mouseY;
    }
}

function mouseReleased() {
    dragging = false;
}

function mouseWheel(event) {
    if (!isHoveringCanvas()) {
        return;
    }

    zoom += sensitivity * -event.delta;
    zoom = constrain(zoom, zMin, zMax);
    // offset.x -= (mouseX - offset.x) * (zoom - 1);
    // offset.y -= (mouseY - offset.y) * (zoom - 1);
    return false;
}

function isHoveringCanvas() {
    return (mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height);
}

function parseStringToTree(string) {
    try {
        var splitted_string = string.split("\n");
        var output = [];
        var parents = [];
        
        for (var i = 0; i < splitted_string.length; i++) {
            var node_str = splitted_string[i];
            var level = node_str.indexOf("- ") + 1;
            var label = node_str.slice(level + 1);
            
            var node = {id: i, parent_id: parents[level - 1], label: label}
            
            parents[level] = i;
            output.push(node);
        }
        
        return output;
    } catch {
        return null;
    }
}

function updateConfigs() {
    config.node_width = parseInt($("#node_width").val());
    config.node_height = parseInt($("#node_height").val());
    config.min_node_width = parseInt($("#min_node_width").val());
    config.max_node_width = parseInt($("#max_node_width").val());
    config.padding_x = parseInt($("#padding_x").val());
    config.padding_y = parseInt($("#padding_y").val());
    config.node_style = $("#node_style").val();
    config.node_width_style = $("#node_width_style").val();
    config.edge_style = $("#edge_style").val();
}

function updateTree() {
    input_string = $("#tree-input").val();
    nodes = parseStringToTree(input_string);
    if (nodes != null) {
        tree = new VisualizableTree(nodes, config);
        tree.initialize();
    }
}

function exportImage() {
    var pad = 5 * zoom;

    var pg = createGraphics(
        tree.width * zoom + 2*pad,
        tree.height * zoom + 2*pad);
    pg.textAlign(CENTER);

    pg.background(255);
    pg.push();
    pg.translate(pad - tree.min_x * zoom, pad);
    pg.scale(zoom);
    tree.draw(pg);
    pg.pop();

    let d = new Date();
    var filename = "tree_view_ " + d.toISOString().split('T')[0] + 
        "_" + d.getHours() + "-" + d.getMinutes() + ".png"
    pg.save(filename)
}