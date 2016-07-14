


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
    camera.position.set(175, 150, 180);
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

    function volumeOfT(a, b, c){
        // console.log("Wektory składowe")
        // console.log(a);
        // console.log(b);
        // console.log(c);
        var p1 = a.x*b.y*c.z;
        var p2 = c.x*a.y*b.z;
        var p3 = b.x*c.y*a.z;
        var n1 = c.x*b.y*a.z;
        var n2 = b.x*a.y*c.z;
        var n3 = a.x*c.y*b.z;
        console.log(a.x, a.y, a.z);
        console.log(b.x, b.y, b.z);
        console.log(c.x, c.y, c.z);
        console.log((p1 + p2 + p3 - n1 - n2 - n3));
        
        return (1.0/6.0)*(p1 + p2 + p3 - n1 - n2 - n3);
    }

    function calculateVolume(object){
        var volumes = 0.0;
        var negative_volumes = 0.0;
        console.log(object.geometry.faces.length);

        for(var i = 0; i < object.geometry.faces.length; i++){
            var Pi = object.geometry.faces[i].a;
            var Qi = object.geometry.faces[i].b;
            var Ri = object.geometry.faces[i].c;
            // console.log(object.geometry.vertices[Pi]);

            var P = new THREE.Vector3(object.geometry.vertices[Pi].x, object.geometry.vertices[Pi].y, object.geometry.vertices[Pi].z);
            var Q = new THREE.Vector3(object.geometry.vertices[Qi].x, object.geometry.vertices[Qi].y, object.geometry.vertices[Qi].z);
            var R = new THREE.Vector3(object.geometry.vertices[Ri].x, object.geometry.vertices[Ri].y, object.geometry.vertices[Ri].z);
            var volume = volumeOfT(P, Q, R);
            // console.log("Single volume", volume);
            if(volume < 0){
                negative_volumes += volume;
            }
            else{
                volumes += volume;
            }

        }
        console.log("Volumes", volumes);
        console.log("Neg. volumes", negative_volumes);
        return Math.abs(volumes + negative_volumes);
    }


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
            var div = document.getElementById('volume');
            div.innerHTML = calculateVolume(obj) + " mm^3";
            div.addEventListener('click', function(){
                console.log(camera);
            })
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
