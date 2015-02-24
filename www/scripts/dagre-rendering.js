
// Whole graph is visible
function set_max_hw_margin(viz, graph) {
  var margin = 20;
  var width_ratio  = viz.node().getBoundingClientRect().width  / (graph.width  + 2 * margin);
  var height_ratio = viz.node().getBoundingClientRect().height / (graph.height + 2 * margin);

  var scale = 1;
  var hmargin = 0;
  var wmargin = 0;
  if (width_ratio < height_ratio) {
    scale = width_ratio;
    hmargin = (viz.node().getBoundingClientRect().height - scale * (graph.height  + 2 * margin))/2;
    wmargin = margin;
  }
  else {
    scale = height_ratio;
    hmargin = margin;
    wmargin = (viz.node().getBoundingClientRect().width - scale * (graph.width  + 2 * margin))/2;
  }

  return {"hmargin":hmargin, "wmargin":wmargin, "scale":scale};
}

// Smallest dimension is visible
function set_min_hw_margin(viz, graph) {
  var margin = 20;
  var width_ratio  = viz.node().getBoundingClientRect().width  / (graph.width  + 2 * margin);
  var height_ratio = viz.node().getBoundingClientRect().height / (graph.height + 2 * margin);

  var scale = 1;
  var hmargin = 0;
  var wmargin = 0;
  if (width_ratio > height_ratio) {
    scale = width_ratio;
    hmargin = (viz.node().getBoundingClientRect().height - scale * (graph.height  + 2 * margin))/2;
    wmargin = margin;
  }
  else {
    scale = height_ratio;
    hmargin = margin;
    wmargin = (viz.node().getBoundingClientRect().width - scale * (graph.width  + 2 * margin))/2;
  }

  return {"hmargin":hmargin, "wmargin":wmargin, "scale":scale};
}

function set_h_margin(viz, graph) {
  var margin = 20;
  var height_ratio = viz.node().getBoundingClientRect().height / (graph.height + 2 * margin);

  var scale = height_ratio;
  var hmargin = margin;
  var wmargin = (viz.node().getBoundingClientRect().width - scale * (graph.width  + 2 * margin))/2;

  return {"hmargin":hmargin, "wmargin":wmargin, "scale":scale};
}

function set_w_margin(viz, graph) {
  var margin = 20;
  var width_ratio  = viz.node().getBoundingClientRect().width  / (graph.width  + 2 * margin);

  var scale = width_ratio;
  var hmargin = (viz.node().getBoundingClientRect().height - scale * (graph.height  + 2 * margin))/2;
  var wmargin = margin;

  return {"hmargin":hmargin, "wmargin":wmargin, "scale":scale};
}

function set_zoom(viz, zoom_init) {
  var svg = viz.select("svg");
  var svg_inner_graph = svg.select("g");

  var zoom = d3.behavior.zoom().on("zoom", function() {
    svg_inner_graph.attr("transform", "translate(" + d3.event.translate + ") scale(" + d3.event.scale + ")");
  });
  svg.call(zoom);

  zoom.translate([zoom_init.hmargin, zoom_init.wmargin])
      .scale(zoom_init.scale)
      .event(svg);

  return zoom;
}

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

  return out_graph;
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

