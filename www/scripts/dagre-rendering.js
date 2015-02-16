
function render_JSON(text, selector, graph_builder) {
  // Process input into a graph

  var in_graph = JSON.parse(text);
  var out_graph = new dagreD3.graphlib.Graph().setGraph({});

  graph_builder(in_graph, out_graph);

  // Find where result should be inserted

  var viz = d3.select("#" + selector);
    viz.html("<svg><g></g></svg>");
  var svg = viz.select("svg");
  var svg_inner_graph = svg.select("g");

  // Render the graph
  var render = new dagreD3.render();
  render(svg_inner_graph, out_graph);

  // Figure out initial scale and margin

  var margin = 20;
  var width_ratio  = viz.node().getBoundingClientRect().width  / (out_graph.graph().width  + 2 * margin + 100);
  var height_ratio = viz.node().getBoundingClientRect().height / (out_graph.graph().height + 2 * margin + 100);

  var scale = 1;
  var hmargin = 0;
  var vmargin = 0;
  if (width_ratio < height_ratio) {
    scale = width_ratio;
    hmargin = margin;
    vmargin = (viz.node().getBoundingClientRect().height - scale * (out_graph.graph().height  + 2 * margin + 100))/2;
  }
  else {
    scale = height_ratio;
    hmargin = (viz.node().getBoundingClientRect().width - scale * (out_graph.graph().width  + 2 * margin + 100))/2;
    vmargin = margin;
  }

/*document.getElementById("debug").value = document.getElementById("debug").value + "\n" +
    "renderAST_JSON:\n\n" +
    "  viz.width    = " + viz.node().getBoundingClientRect().width + "\n" +
    "  viz.height   = " + viz.node().getBoundingClientRect().height + "\n" +
    "  graph.width  = " + out_graph.graph().width + "\n" +
    "  graph.height = " + out_graph.graph().height + "\n" +
    "  width_ratio  = " + width_ratio + "\n" +
    "  height_ratio = " + height_ratio + "\n\n" +
    "  scale   = " + scale + "\n" +
    "  hmargin = " + hmargin + "\n" +
    "  vmargin = " + vmargin + "\n" +
    "\n------------------------\n"; */

  var zoom = d3.behavior.zoom().on("zoom", function() {
    svg_inner_graph.attr("transform", "translate(" + d3.event.translate + ") scale(" + d3.event.scale + ")");
  });
  svg.call(zoom);

  zoom.translate([hmargin, vmargin])
      .scale(scale)
      .event(svg);
}

function renderAST_JSON(text, selector) {
  render_JSON(text, selector, traverseAST_JSON);
}

function traverseAST_JSON(ast, graph) {
  ast.nodes.forEach(function (node) {
   graph.setNode(node.tag, { label: node.label });
  });

  ast.edges.forEach(function (edge) {
    graph.setEdge(edge.head, edge.tail, { label: edge.label });
  });

  ast.clusters.forEach(function (cluster) {
    traverseAST_JSON(cluster, graph);
  });
}

function renderCFG_JSON(text, selector) {
  render_JSON(text, selector, traverseCFG_JSON);
}

function traverseCFG_JSON(ast, graph) {
  ast.nodes.forEach(function (node) {
   graph.setNode(node.tag, { label: node.label });
  });

  ast.edges.forEach(function (edge) {
    graph.setEdge(edge.head, edge.tail, { label: edge.label });
  });
}

