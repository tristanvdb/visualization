
function render_GraphViz(text, selector) {
  var result = Viz(text, "svg", "dot");

  document.getElementById("debug").value = document.getElementById("debug").value + "\n" +
    "render_GraphViz:\n\n" +
    "  result:\n" + result + "\n\n------------------------\n";

  if (result != "") {
    var viz = document.getElementById(selector);
    viz.innerHTML = result;

    var svg = viz.getElementsByTagName("svg")[0];
      svg.setAttribute("preserveAspectRatio", "xMidYMid");
      svg.removeAttribute("width");
      svg.removeAttribute("height");

    var panZoomTiger = svgPanZoom(svg);
  }
}

