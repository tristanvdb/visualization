
var editor = ace.edit("editor");
editor.setReadOnly(true);
editor.$blockScrolling = Infinity;

//function makeAsmViz(filename, callback) {
//  $.post("./call-asm-viz.php", { filename: filename }).done(callback);
//}

function traverseASM_CG(cg, graph) {
  var rtn_select = document.getElementById("routine");
  while (rtn_select.options.length > 0) rtn_select.remove(0);

  cg.routines.forEach(function (rtn) {
    if (rtn.type=="idapro" || rtn.type=="ours" || rtn.type=="user") {
      var rtn_opt = document.createElement('option');
      rtn_opt.appendChild( document.createTextNode(rtn.label) );
      rtn_opt.value = rtn.tag;
      rtn_select.appendChild(rtn_opt);
    }
    graph.setNode(rtn.tag, { "label": rtn.label, "class": "is-" + rtn.type});
    rtn.callees.forEach(function (callee) {
      graph.setEdge(rtn.tag, callee.tag, {});
    });
  });
  graph.graph().rankSep = 50;
  graph.graph().nodeSep = 50;
}

function traverseASM_CFG(cfg, graph) {
  cfg.blocks.forEach(function (blk) {

    var start = editor.session.getLength() - 1;
    var stop = start;
    editor.setValue(editor.getValue() + blk.label + ":\n");
    blk.instructions.forEach(function (inst) {
      editor.setValue(editor.getValue() + "    " + inst.str + "\n");
      stop++;
    });

    console.log("label: " + blk.label + ", start=" + start + ", stop=" + stop);
    graph.setNode(blk.tag, { "label": blk.label, "start": start, "stop": stop });

    if (blk.out_true != "" && blk.out_false != "") {
      graph.setEdge(blk.tag, blk.out_true,  { "style": "stroke: #0F0; fill: none; ", "arrowheadStyle": "stroke: #0F0; fill: #0F0" });
      graph.setEdge(blk.tag, blk.out_false, { "style": "stroke: #F00; fill: none; ", "arrowheadStyle": "stroke: #F00; fill: #F00" });
    }
    else if (blk.out_true != "")
      graph.setEdge(blk.tag, blk.out_true,  { "style": "stroke: #00F; fill: none; ", "arrowheadStyle": "stroke: #00F; fill: #00F" });
  });
  graph.graph().rankSep = 20;
  graph.graph().nodeSep = 20;
  graph.graph().rankDir = "LR";
}

function generate_cg(file) {
  d3.select("#cgviz").html("<svg><g></g></svg>");
  d3.select("#cfgviz").html("<svg><g></g></svg>");
  editor.setValue("");

  dumpFile("../../media/ssd/projects/drafts/asm-to-graphs/tests/" + file + "/" + file + "-no-block.json", function (content) {
    var graph = render_JSON(content, "cgviz", traverseASM_CG, set_max_hw_margin);

    var cgviz = d3.select("#cgviz");

    cgviz.selectAll(".is-idapro").on('click', function () {
      generate_cfg(file, d3.select(this).datum());
    }).style("fill", "#00ff00");
    cgviz.selectAll(".is-ours").on('click', function () {
      generate_cfg(file, d3.select(this).datum());
    }).style("fill", "#00ff00");
    cgviz.selectAll(".is-user").on('click', function () {
      generate_cfg(file, d3.select(this).datum());
    }).style("fill", "#00ff00");

    cgviz.selectAll(".is-indirect").style("fill", "#0000ff");
    cgviz.selectAll(".is-library" ).style("fill", "#ff0000");
  });
}

function set_margin_cfg(viz, graph) {
  var margin = 20;
  var height_ratio = viz.node().getBoundingClientRect().height / (graph.height + 2 * margin + 100);

  var scale = height_ratio;
  var hmargin = margin;
  var vmargin = (viz.node().getBoundingClientRect().height - scale * (graph.height  + 2 * margin + 100))/2;

  return {"hmargin":hmargin, "vmargin":vmargin, "scale":scale};
}

var zoom_cfg;

function set_zoom_cfg(viz, zoom_init) {
  var svg = viz.select("svg");
  var svg_inner_graph = svg.select("g");

  zoom_cfg = d3.behavior.zoom().on("zoom", function() {
    svg_inner_graph.attr("transform", "translate(" + d3.event.translate + ") scale(" + d3.event.scale + ")");
  });
  svg.call(zoom_cfg);

  zoom_cfg.translate([zoom_init.hmargin, zoom_init.vmargin])
          .scale(zoom_init.scale)
          .event(svg);
}

var graph_cfg;

function generate_cfg(file, routine) {
  d3.select("#cfgviz").html("<svg><g></g></svg>");
  editor.setValue("");
  editor.selection.removeListener("changeCursor");

  dumpFile("../../media/ssd/projects/drafts/asm-to-graphs/tests/" + file + "/" + file + "-" + routine + ".json", function (content) {
    graph_cfg = render_JSON(content, "cfgviz", traverseASM_CFG, set_margin_cfg, set_zoom_cfg);

    var cfgviz = d3.select("#cfgviz");

    cfgviz.selectAll(".node").on('click', function () {
      editor.gotoLine(graph_cfg.node(d3.select(this).datum()).start+1, 0, true);
    });

    editor.gotoLine(1);

    editor.selection.on("changeCursor", function () {
      var line = editor.selection.getCursor().row;
      console.log("Cursor on line: " + line);
  
      cfgviz.selectAll(".node").forEach(function (a) { a.forEach(function (n) {
        if (line >= graph_cfg.node(n.__data__).start && line <= graph_cfg.node(n.__data__).stop) {

          n.style.fill = "#FF0000";

          zoom_cfg.translate([0, 0]).scale(1).event(cfgviz.select("svg"));

          var viz_box = cfgviz.node().getBoundingClientRect();
          var v_w = viz_box.width;
          var v_h = viz_box.height;
          console.log("v_w=" + v_w + ", v_h=" + v_h);

          var rect = n.getBoundingClientRect();
          console.log("rect.x=" + rect.x + ", rect.width=" + rect.width);
          console.log("rect.y=" + rect.y + ", rect.height=" + rect.height);

          var x = rect.x + rect.width / 2 - viz_box.x;
          var y = rect.y + rect.height / 2 - viz_box.y;
          console.log("x=" + x + ", y=" + y);

          var g_w = graph_cfg.graph().width;
          var g_h = graph_cfg.graph().height;
          console.log("g_w=" + g_w + ", g_h=" + g_h);

          cfgviz.select("svg").select("g");

          var t_x = (v_w/2 - x);
          var t_y = (v_h/2 - y);

          console.log("move: [" + t_x + ", " + t_y + "]");

          zoom_cfg.translate([t_x, t_y]).scale(1).event(cfgviz.select("svg"));

        }
        else {
          n.style.fill = "#000000";
        }
      })});
    });
  });
}

function generate_cg_(e) {
  var file = document.getElementById("file").value;

  generate_cg(file);
}
document.getElementById('generate-cg').addEventListener('click', generate_cg_);

function generate_cfg_(e) {
  var file = document.getElementById("file").value;
  var routine = document.getElementById("routine").value;

  generate_cfg(file, routine);
}
document.getElementById('generate-cfg').addEventListener('click', generate_cfg_);

