
var editor = ace.edit("editor");
editor.setReadOnly(true);
editor.$blockScrolling = Infinity;

function traverseASM_CG(cg, graph) {
  var rtn_select = document.getElementById("routine");
  while (rtn_select.options.length > 0) rtn_select.remove(0); // remove current options

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

//  console.log("label: " + blk.label + ", start=" + start + ", stop=" + stop);
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
  var cgviz = d3.select("#cgviz");
  var cfgviz = d3.select("#cfgviz");

  cgviz.html("<svg><g></g></svg>");  // Erase CG Viz
  cfgviz.html("<svg><g></g></svg>"); // Erase CFG Viz

  // Reset editor
  editor.setValue("");
  editor.selection.removeListener("changeCursor");

  dumpFile("../../media/ssd/projects/drafts/asm-to-graphs/tests/" + file + "/" + file + "-no-block.json", function (content) {
    var graph_cg = render_JSON(content, "cgviz", traverseASM_CG);
    var zoom_cg = set_zoom(cgviz, set_max_hw_margin(cfgviz, graph_cg.graph()));

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

var graph_cfg;
var zoom_cfg;

function generate_cfg(file, routine) {
  var cfgviz = d3.select("#cfgviz");

  cfgviz.html("<svg><g></g></svg>"); // Erase CFG Viz

  // Reset editor
  editor.setValue("");
  editor.selection.removeListener("changeCursor");

  dumpFile("../../media/ssd/projects/drafts/asm-to-graphs/tests/" + file + "/" + file + "-" + routine + ".json", function (content) {
    graph_cfg = render_JSON(content, "cfgviz", traverseASM_CFG);

    zoom_cfg = set_zoom(cfgviz, set_w_margin(cfgviz, graph_cfg.graph()));

    cfgviz.selectAll(".node").on('click', function () {
      editor.gotoLine(graph_cfg.node(d3.select(this).datum()).start+1, 0, true);
    });

    editor.gotoLine(1);

    editor.selection.on("changeCursor", function () {
      var line = editor.selection.getCursor().row;
//    console.log("Cursor on line: " + line);
  
      cfgviz.selectAll(".node").forEach(function (a) { a.forEach(function (n) {
        if (line >= graph_cfg.node(n.__data__).start && line <= graph_cfg.node(n.__data__).stop) {
          n.style.fill = "#FF0000";

          // Reset position and scale
          zoom_cfg.translate([0, 0]).scale(1).event(cfgviz.select("svg"));

          // getBoundingClientRect: return position relative to the window
          //  get position of the viz div
          var viz_box = cfgviz.node().getBoundingClientRect();
          var v_w = viz_box.width;
          var v_h = viz_box.height;
          //  get position of the center of the node (relative to window) and compute position in the viz div
          var rect = n.getBoundingClientRect();
          var x = rect.x + rect.width / 2 - viz_box.x;
          var y = rect.y + rect.height / 2 - viz_box.y;
          // Figure out the translation to center the node in viz div
          var t_x = (v_w/2 - x);
          var t_y = (v_h/2 - y);

          // move the graph to computed position
          zoom_cfg.translate([t_x, t_y]).scale(1).event(cfgviz.select("svg"));

        }
        else {
          n.style.fill = "#000000";
        }
      })});

      cfgviz.selectAll(".edgePath").style({opacity:'.4'});

//    cfgviz.selectAll(".path").on('mouseover', function(d) { d3.select(this).style({opacity:'1' });  })
//    cfgviz.selectAll(".path").on('mouseout',  function(d) { d3.select(this).style({opacity:'.4'}); });

      cfgviz.selectAll(".path").on('mouseover', function(d) { console.log("mouseover"); })
      cfgviz.selectAll(".path").on('mouseout',  function(d) { console.log("mouseout"); });
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

