


window.addEventListener("load", function () {
    "use strict";
    var THREEx      = THREEx        || {};
    THREEx.GeometryUtils    = THREEx.GeometryUtils  || {};
    THREEx.GeometryUtils.center = function(geometry, noX, noY, noZ)
    {  

        var delta   = this.middlePoint(geometry).negate();
        if( noX )   delta.x = 0;
        if( noY )   delta.y = 0;
        if( noZ )   delta.z = 0;

        return this.translate(geometry, delta)
    }

    THREEx.GeometryUtils.middlePoint = function(geometry)
    {
        geometry.computeBoundingBox();
        console.log(geometry.boundingBox);

        var middle  = new THREE.Vector3()
        middle.x    = ( geometry.boundingBox.min.x + geometry.boundingBox.max.x ) / 2;
        middle.y    = ( geometry.boundingBox.min.y + geometry.boundingBox.max.y ) / 2;
        middle.z    = ( geometry.boundingBox.min.z + geometry.boundingBox.max.z ) / 2;
        
        return middle;
    }

    THREEx.GeometryUtils.translate  = function(geometry, delta)
    {
        console.log(delta);
        for(var i = 0; i < geometry.vertices.length; i++) {
            var vertex  = geometry.vertices[i];
            vertex.x = vertex.x + delta.x; 
            vertex.y = vertex.y + delta.y;
            // vertex.z = vertex.z + delta.z;
        }
        geometry.__dirtyVertices = true;

        return this;
    }
        
    var w = 600, h = 600;
    
    var renderer = new THREE.WebGLRenderer({alpha: true});
    renderer.setSize(w, h);
    var view = document.getElementById("view");
    view.appendChild(renderer.domElement);
    
    var camera = new THREE.PerspectiveCamera(45, w / h, 1, 1000);
    camera.position.set(0, 0, 100);
    var controls = new THREE.TrackballControls(camera, view);
    
    var scene = new THREE.Scene();
    scene.add(new THREE.AmbientLight(0x666666));
    
    var light1 = new THREE.DirectionalLight(0xffffff);
    light1.position.set(0, 100, 100);
    scene.add(light1);
    
    var light2 = new THREE.DirectionalLight(0xffffff);
    light2.position.set(0, -100, -100);
    scene.add(light2);
    
    var mat = new THREE.MeshPhongMaterial({
        color: 0xaabac3, ambient: 0x000000, specular: 0x111111,
    });
    var obj = new THREE.Mesh(new THREE.Geometry(), mat);
    
    scene.add(obj);

   
    var loop = function loop() {
        requestAnimationFrame(loop);
        controls.update();
        renderer.clear();
        renderer.render(scene, camera);
    };
    loop();
    
    // file load
    var openFile = function (file) {
        var reader = new FileReader();
        reader.addEventListener("load", function (ev) {
            var buffer = ev.target.result;
            var geom = loadStl(buffer);
            scene.remove(obj);
            THREEx.GeometryUtils.center(geom);
            obj = new THREE.Mesh(geom, mat);
            obj.rotateX(270 * Math.PI / 180);
            scene.add(obj);
        }, false);
        reader.readAsArrayBuffer(file);
        var grid = new THREE.GridHelper(50, 10);
        scene.add(grid);
    };
    
    // file input button
    var input = document.getElementById("file");
    input.addEventListener("change", function (ev) {
        var file = ev.target.files[0];
        openFile(file);
    }, false);
    
    // dnd
    view.addEventListener("dragover", function (ev) {
        ev.stopPropagation();
        ev.preventDefault();
        ev.dataTransfer.dropEffect = "copy";
    }, false);
    view.addEventListener("drop", function (ev) {
        ev.stopPropagation();
        ev.preventDefault();
        var file = ev.dataTransfer.files[0];
        openFile(file);
    }, false);
}, false);
