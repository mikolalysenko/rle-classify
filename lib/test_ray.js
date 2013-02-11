"use strict"; "use restrict";

var core = require("rle-core");

var NEGATIVE_INFINITY   = core.NEGATIVE_INFINITY
  , POSITIVE_INFINITY   = core.POSITIVE_INFINITY
  , EPSILON             = core.EPSILON;

//Check if region is on boundary
function isBoundary(lo, hi) {
  for(var j=2; j>=0; --j) {
    if(hi[j] > lo[j]+1) {
      return false;
    } else if(hi[j] < lo[j]+1) {
      return true;
    }
  }
  return false;
}

//Intersect ray with axis-aligned face
function faceIntersect(
    x     //Ray origin
  , dir   //Ray direction
  , p     //Face level
  , axis  //Face axis
  , lo_u, hi_u  //Face u-limits
  , lo_v, hi_v  //Face v-limits
  ) {

  if(Math.abs(dir[axis]) < EPSILON) {
    return Number.POSITIVE_INFINITY;
  }
  var t = (p - x[axis]) / dir[axis];
  if(t < EPSILON) {
    return Number.POSITIVE_INFINITY;
  }

  var u = (axis+1)%3
    , v = (axis+2)%3;
  
  var a = x[u] + dir[u] * t
    , b = x[v] + dir[v] * t;
  
  if(a < lo_u || a >= hi_u || b < lo_v || b >= hi_v) {
    return Number.POSITIVE_INFINITY;
  }
  return t;
}

//Step through an interval
function traceInterval(x, dir, lo, hi) {

  var min_t = Number.POSITIVE_INFINITY;
  
  //Check x-faces
  if(dir[0] < -EPSILON) {
    min_t = faceIntersect(x, dir,
      lo[0], 0,
      NEGATIVE_INFINITY, lo[1]+1,
      NEGATIVE_INFINITY, lo[2]+1);
  } else if(dir[0] > EPSILON) {
    min_t = faceIntersect(x, dir,
      hi[0], 0,
      hi[1], POSITIVE_INFINITY,
      hi[2], POSITIVE_INFINITY);
  }
  
  //Check y-faces
  if(dir[1] < -EPSILON) {
    min_t = Math.min(min_t, faceIntersect(x, dir,
      lo[1], 1,
      NEGATIVE_INFINITY, lo[2]+1,
      lo[0], POSITIVE_INFINITY));
      
    min_t = Math.min(min_t, faceIntersect(x, dir,
      lo[1]+1, 1,
      NEGATIVE_INFINITY, lo[2]+1,
      NEGATIVE_INFINITY, lo[0]));
  } else if(dir[1] > EPSILON) {
    min_t = Math.min(min_t, faceIntersect(x, dir,
      hi[1]+1, 1,
      hi[2], POSITIVE_INFINITY,
      NEGATIVE_INFINITY, hi[0]));
      
    min_t = Math.min(min_t, faceIntersect(x, dir,
      hi[1], 1,
      hi[2], POSITIVE_INFINITY,
      hi[0], POSITIVE_INFINITY));
  }
  
  //Check z-faces
  if(dir[2] < -EPSILON) {
    min_t = Math.min(min_t, faceIntersect(x, dir,
      lo[2], 2,
      lo[0], POSITIVE_INFINITY,
      lo[1], lo[1]+1));
    
    min_t = Math.min(min_t, faceIntersect(x, dir,
      lo[2], 2,
      NEGATIVE_INFINITY, POSITIVE_INFINITY,
      lo[1]+1, POSITIVE_INFINITY));
    
    min_t = Math.min(min_t, faceIntersect(x, dir,
      lo[2]+1, 2,
      NEGATIVE_INFINITY, POSITIVE_INFINITY,
      NEGATIVE_INFINITY, lo[1]));
    
    min_t = Math.min(min_t, faceIntersect(x, dir,
      lo[2]+1, 2,
      NEGATIVE_INFINITY, lo[0],
      lo[1], lo[1]+1));
  } else if(dir[2] > EPSILON) {
    min_t = Math.min(min_t, faceIntersect(x, dir,
      hi[2]+1, 2,
      NEGATIVE_INFINITY, hi[0],
      hi[1], hi[1]+1));
    
    min_t = Math.min(min_t, faceIntersect(x, dir,
      hi[2]+1, 2,
      NEGATIVE_INFINITY, POSITIVE_INFINITY,
      NEGATIVE_INFINITY, hi[1]));
    
    min_t = Math.min(min_t, faceIntersect(x, dir,
      hi[2], 2,
      NEGATIVE_INFINITY, POSITIVE_INFINITY,
      hi[1]+1, POSITIVE_INFINITY));
    
    min_t = Math.min(min_t, faceIntersect(x, dir,
      hi[2], 2,
      hi[0], POSITIVE_INFINITY,
      hi[1], hi[1]+1));
  }
  
  //Return step
  return min_t;
}

//Step a ray against a surface
function intersectSurface(x, dir, distances, phases, retval) {
  for(var i=0; i<8; ++i) {
    if(!phases[i]) {
      retval[0] = -1;
      return;
    }
  }
  retval[0] = 0;
  return;
}

var DEFAULT_SOLID_FUNC = new Function("p", "return !!p;");

//Test a ray against the volume
module.exports = function(volume, origin, direction, max_t, solid_func) {
  if(!max_t) {
    max_t = Number.POSITIVE_INFINITY;
  }
  if(!solid_func) {
    solid_func = DEFAULT_SOLID_FUNC;
  }
  //Unpack local variables
  var x     = origin.slice(0)
    , ix    = [0,0,0]
    , fx    = [0,0,0]
    , y     = [0,0,0]
    , lo    = [0,0,0]
    , hi    = [0,0,0]
    , length  = volume.length()
    , t     = 0.0
    , retval  = [0, 0]
    , distances = [0,0,0,0,0,0,0,0]
    , phases   = [0,0,0,0,0,0,0,0]
    , solid    = [false, false, false, false, false, false, false, false];
outer_loop:
  while(t <= max_t) {
    //Get integer/faction parts of coordinate
    for(var i=0; i<3; ++i) {
      ix[i] = Math.floor(x[i]);
    }
    //Locate pointer
    var ptr = volume.bisect(ix, 0, length-1);
    //Get bounds on run
    lo[0] = volume.coords[0][ptr];
    lo[1] = volume.coords[1][ptr];
    lo[2] = volume.coords[2][ptr];
    if(ptr < length-1) {
      hi[0] = volume.coords[0][ptr+1];
      hi[1] = volume.coords[1][ptr+1];
      hi[2] = volume.coords[2][ptr+1];
    } else {
      hi[0] = hi[1] = hi[2] = POSITIVE_INFINITY;
    }
    //Check if on boundary of volume
    if(isBoundary(lo, hi) || solid_func(volume.phases[ptr])) {
      //Hard case: Have to test if ray intersects near surface
      var n = 0;
      var touches_surface = false;
      for(var dz=0; dz<2; ++dz) {
        y[2] = ix[2]+dz;
        for(var dy=0; dy<2; ++dy) {
          y[1] = ix[1]+dy;
          for(var dx=0; dx<2; ++dx) {
            y[0] = ix[0]+dx;
            var nptr = volume.bisect(y, 0, length-1);
            distances[n] = (volume.coords[0][nptr] === y[0] &&
                            volume.coords[1][nptr] === y[1] &&
                            volume.coords[2][nptr] === y[2]) ?
                                volume.distances[nptr] :
                                1.0;
            phases[n] = volume.phases[nptr];
            solid[n] = solid_func(phases[n]);
            touches_surface |= solid[n];
            ++n;
          }
        }
      }
      if(touches_surface) {
        for(var i=0; i<3; ++i) {
          fx[i] = x - ix[i];
        }
        intersectSurface(fx, direction, distances, phases, retval);
        if(retval[0] >= 0) {
          var dt = retval[1];
          for(var i=0; i<3; ++i) {
            x[i] += dt * direction[i];
          }
          t += dt;
          return { hit: true, t:t, x:x, phase: phases[retval[0]] };
        }
      }
    }
    //Easy case: Just walk ray as far as possible along run
    var step = traceInterval(x, direction, lo, hi) + EPSILON;
    for(var i=0; i<3; ++i) {
      x[i] += step * direction[i];
    }
    t += step;
    //Check bounds
    for(var i=0; i<3; ++i) {
      if(x[i] <= NEGATIVE_INFINITY+1 || x[i] >= POSITIVE_INFINITY-1) {
        t = Number.POSITIVE_INFINITY;
        break outer_loop;
      }
    }
  }
  return { hit: false, t:max_t, x:x, phase:0 };
}
