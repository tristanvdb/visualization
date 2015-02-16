
// Change JSON via browsing button
function load_file(e) {
  var file = e.target.files[0];

  if (file) {
    var reader = new FileReader();
    reader.onload = function  (e) {
      document.getElementById("editor").value = e.target.result;
    };
    reader.readAsText(file);
  }
}
document.getElementById('file-load').addEventListener('change', load_file, false);

// Click on "Generate"
function generate() {
  renderAST_JSON(document.getElementById("editor").value, "viz");
}
document.getElementById("viz-generate").addEventListener("click", generate);

