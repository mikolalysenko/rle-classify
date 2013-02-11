rle-classify
============
This library implements basic geometric queries for narrowband level sets, specifically point and raycasting queries.

Installation/Usage
==================
You can install the library using npm:

    npm install rle-classify

And then use it to do basic primitive classification tests:

    //First create a level set
    var bunny = require("rle-rasterize")(require("bunny"));
    
    //Then do a ray-query
    var ray_hit = require("rle-classify").ray(bunny, [10, 0, 0], [-1, 0, 0]);
    console.log("Ray hit info:", ray_hit);
    
    //Point test
    var point_phase = require("rle-classify").point(bunny, [0,0,0]);
    console.log("Point info:", point_phase);

`classify.ray(volume, origin, direction[, solid_func])`
-------------------------------------------------------
Casts a ray against the level set.  This takes about O(ray.length * log(volume.length())).

* `volume` is a narrowband level set
* `origin` is the origin of the ray
* `direction` is the ray direction
* `solid_func` tests if the volume is solid or not

Returns a hit record containing the following properties:
* `hit`: A boolean flag that checks if the ray hit the volume
* `x`: The point of intersection
* `t`: The the time of intersection
* `phase`: The phase of the volume at the point of intersection

`classify.point(volume, point)`
-------------------------------
Tests a point against the level set.  This takes O(log(volume.length())) time.

* `volume` is a narrowband level set
* `point` is the point to test against

Returns the phase of the level set at `point`

Credits
=======
(c) 2013 Mikola Lysenko. BSD
