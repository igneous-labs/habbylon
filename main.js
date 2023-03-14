var canvas = document.getElementById("renderCanvas");

var startRenderLoop = function (engine, canvas) {
    engine.runRenderLoop(function () {
        if (sceneToRender && sceneToRender.activeCamera) {
            sceneToRender.render();
        }
    });
}

var engine = null;
var scene = null;
var sceneToRender = null;
var createDefaultEngine = function() { return new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true,  disableWebGL2Support: false}); };
var meshes = {};

class Playground {
    static CreateScene(engine, canvas) {
        let scene = new BABYLON.Scene(engine);
        //scene.clearColor = new BABYLON.Color4(0.5, 0.5, 0.75, 1).toLinearSpace();
        scene.clearColor = new BABYLON.Color4(1, 1, 1, 1);
        let camera = new BABYLON.ArcRotateCamera("camera2", Math.PI / 4, Math.PI / 3, 3 * 10, new BABYLON.Vector3(-5, 0, 0), scene);
        camera.mode = BABYLON.Camera.ORTHOGRAPHIC_CAMERA;
        // This attaches the camera to the canvas
        camera.attachControl(canvas, true);
        camera.lowerRadiusLimit = camera.radius;
        camera.upperRadiusLimit = camera.radius;
        camera.wheelDeltaPercentage = 0.01;
        let width = 10 * 1.5;
        camera.orthoLeft = (-1.2 * width) / 2;
        camera.orthoRight = -camera.orthoLeft;
        this.setTopBottomRatio(camera, canvas);
        scene.onPointerObservable.add(({ event }) => {
            const delta = -Math.sign(event.deltaY);
            this.zoom2DView(camera, delta, canvas);
        }, BABYLON.PointerEventTypes.POINTERWHEEL);
        // From above
        var light1 = new BABYLON.DirectionalLight("light1", new BABYLON.Vector3(0, -1, 0), scene);
        light1.diffuse = new BABYLON.Color3(1, 1, 1);
        // From left and far
        var light2 = new BABYLON.DirectionalLight("light2", new BABYLON.Vector3(1, 0, -1), scene);
        light2.intensity = 1;
        light2.diffuse = new BABYLON.Color3(1, 1, 1);
        // From right and front
        var light3 = new BABYLON.DirectionalLight("light2", new BABYLON.Vector3(-1, 0, 1), scene);
        light3.intensity = 1;
        light3.diffuse = new BABYLON.Color3(1, 1, 1);
        for (let x = -3; x < 6; x++) {
            for (let y = -3; y < 11; y++) {
                for (let z = 0; z < 2; z++) {
                    let box = BABYLON.MeshBuilder.CreateBox("box", { size: 1 }, scene);
                    box.position.x = x;
                    box.position.z = y;
                    box.position.y = z;
                    box.enableEdgesRendering();
                    box.edgesColor = new BABYLON.Color4(0, 0, 0, 1);
                    box.edgesWidth = 2;
                    let material = new BABYLON.StandardMaterial("myMaterial", scene);
                    if (z == 1) {
                        material.diffuseColor = new BABYLON.Color3(0.49, 0.8, 0.05);
                    }
                    else {
                        // rgba(170,102,43,255)
                        material.diffuseColor = new BABYLON.Color3(0.667, 0.4, 0.168);
                    }
                    material.ambientColor = new BABYLON.Color3(0.0, 0.0, 0.0);
                    material.specularColor = new BABYLON.Color3(0, 0, 0);
                    box.material = material;
                }
            }
        }
        // left wall 
        for (let x = -3; x < 6; x++)
            for (let z = 2; z < 12; z++) {
                {
                    let box = BABYLON.MeshBuilder.CreateBox("box", { size: 1 }, scene);
                    box.position.x = x;
                    box.position.z = -3;
                    box.position.y = z;
                    box.enableEdgesRendering();
                    box.edgesColor = new BABYLON.Color4(0, 0, 0, 1);
                    box.edgesWidth = 2;
                    let material = new BABYLON.StandardMaterial("myMaterial", scene);
                    material.diffuseColor = new BABYLON.Color3(0.4, 0.4, 0.4);
                    material.ambientColor = new BABYLON.Color3(0.0, 0.0, 0.0);
                    material.specularColor = new BABYLON.Color3(0, 0, 0);
                    box.material = material;
                }
            }
        // left wall 
        for (let y = -3; y < 11; y++)
            for (let z = 2; z < 12; z++) {
                {
                    let box = BABYLON.MeshBuilder.CreateBox("box", { size: 1 }, scene);
                    box.position.x = -3;
                    box.position.z = y;
                    box.position.y = z;
                    box.enableEdgesRendering();
                    box.edgesColor = new BABYLON.Color4(0, 0, 0, 1);
                    box.edgesWidth = 2;
                    let material = new BABYLON.StandardMaterial("myMaterial", scene);
                    material.diffuseColor = new BABYLON.Color3(0.4, 0.4, 0.4);
                    material.ambientColor = new BABYLON.Color3(0.0, 0.0, 0.0);
                    material.specularColor = new BABYLON.Color3(0, 0, 0);
                    box.material = material;
                }
            }
        let pipeline = new BABYLON.DefaultRenderingPipeline("pipeline", false, scene, scene.cameras);
        pipeline.imageProcessingEnabled = true;
        pipeline.imageProcessing.vignetteEnabled = true;
        pipeline.imageProcessing.vignetteWeight = 2;
        return scene;
    }
    static setTopBottomRatio(camera, canvas) {
        const ratio = canvas.height / canvas.width;
        if (camera.orthoLeft && camera.orthoRight) {
            camera.orthoTop = camera.orthoRight * ratio;
            camera.orthoBottom = camera.orthoLeft * ratio;
        }
    }
    static zoom2DView(camera, delta, canvas) {
        const zoomingOut = delta < 0;
        if (camera.orthoLeft && camera.orthoRight) {
            // limit zooming in to no less than 3 units.
            if (!zoomingOut && Math.abs(camera.orthoLeft) <= 3) {
                console.log("Skip");
                return;
            }
            camera.orthoLeft += delta / 8;
            camera.orthoRight -= delta / 8;
            this.setTopBottomRatio(camera, canvas);
        }
    }
}
createScene = function() { return Playground.CreateScene(engine, engine.getRenderingCanvas()); }

window.initFunction = async function() {
    var asyncEngineCreation = async function() {
        try {
        return createDefaultEngine();
        } catch(e) {
        console.log("the available createEngine function failed. Creating the default engine instead");
        return createDefaultEngine();
        }
    }
    window.engine = await asyncEngineCreation();
    if (!engine) throw 'engine should not be null.';
    
    window.scene = createScene();

    // Load assets
    // const result = await BABYLON.SceneLoader.ImportMeshAsync(null, "./models/", "stairs.glb", window.scene);
    // meshes["stairs"] = result.meshes[0];

    BABYLON.SceneLoader.ImportMesh(null, "./models/", "stairs.glb", window.scene, function (meshes, particleSystems, skeletons) {
        console.log("loaded")
        console.log(meshes)
        meshes[0].position.x = 5;
        meshes[0].position.y = 1.6;
        meshes[0].position.z = 5;
        console.log(meshes[0].getBoundingInfo().boundingBox)
    });

    BABYLON.SceneLoader.ImportMesh(null, "./models/", "loungeSofa.glb", window.scene, function (meshes, particleSystems, skeletons) {
        console.log("loaded")
        meshes[0].position.x = 1;
        meshes[0].position.y = 2;
        meshes[0].position.z = 5;
        meshes[0].showBoundingBox = true;
    });


    // Add stairs to the scene

    startRenderLoop(engine, canvas);

};


initFunction().then(() => {sceneToRender = scene});

// Resize
window.addEventListener("resize", function () {
    engine.resize();
});