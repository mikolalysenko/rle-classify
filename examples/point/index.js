var $         = require("jquery-browserify")
  , classify  = require("../../index.js");

$(document).ready(function() {

  //Create viewer
  var viewer = require("gl-shells").makeViewer({wireframe:true});
  
  //Create a volume from a sphere
  var volume = require("rle-core").sampleSolid([-7,-7,-7], [7,7,7], function(x) {
    return Math.sqrt(x[0]*x[0]+x[1]*x[1]+x[2]*x[2]) - 5.0;
  });
  
  //Extract mesh eagerly so we can append rays to it
  //var mesh = require("rle-mesh")(volume);
  var mesh = { positions: [], faces: [] };
  
  //Generate and test a bunch of random rays
  for(var i=0; i<100000; ++i) {
    var x = [0,0,0];
    for(var j=0; j<3; ++j) {
      x[j] = Math.random() * 10.0 - 5.0;
    }
    if(classify.testPoint(volume, x)) {
      console.log("Hit:", x);
      var nv = mesh.positions.length;
      mesh.positions.push(x);
      mesh.positions.push([x[0]+0.01, x[1]+0.01, x[2]+0.01]);
      mesh.faces.push([nv, nv+1, nv]);
    } else {
      console.log("Miss:", x);
    }
  }
  
  //Draw the mesh
  viewer.updateMesh(mesh);
});