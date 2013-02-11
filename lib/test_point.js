//Checks if a point is contained in a volume
module.exports = function(volume, point) {
  var frac  = [0,0,0]
    , coord = [0,0,0];
  for(var i=0; i<3; ++i) {
    coord[i] = Math.floor(point[i]);
    frac[i]  = point[i] - coord[i];
  }
  var s = 0.0
    , d = [0,0,0]
    , tcoord = [0,0,0]
    , best_w = -2.0
    , best_p = 0;
  for(d[2]=0; d[2]<2; ++d[2]) {
    for(d[1]=0; d[1]<2; ++d[1]) {
      for(d[0]=0; d[0]<2; ++d[0]) {
        var w = 0.0;
        for(var i=0; i<3; ++i) {
          if(d[i]) {
            tcoord[i] = coord[i] + 1;
            w += 1.0 - frac[i];
          } else {
            tcoord[i] = coord[i];
            w += frac[i];
          }
        }
        var idx = volume.bisect(tcoord, 0, volume.length()-1);
        if(volume.coords[0][idx] === tcoord[0] &&
           volume.coords[1][idx] === tcoord[1] &&
           volume.coords[2][idx] === tcoord[2]) {
          var v = volume.distances[idx];
          w = v - w;
        } else {
          w = -1.0;
        }
        if(w > best_w) {
          best_w = w;
          best_p = volume.phases[idx];
        }
      }
    }
  }
  return best_p;
}
