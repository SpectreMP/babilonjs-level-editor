const canvas = document.getElementById("renderCanvas"); // Get the canvas element
const engine = new BABYLON.Engine(canvas, true); // Generate the BABYLON 3D engine
var sphere;
var delta = 0;

const CANVASHEIGHT = 768;
const CANVASWIDTH = 768;

const FIELDSIZE = 16;
const LAYERSAMOUNT = 5;

var PAINTMODE = 1;
var CURRENTLAYER = 0;

var mapData = new Array(LAYERSAMOUNT)
for (let i = 0; i < LAYERSAMOUNT; i++){
    mapData[i] = new Array(FIELDSIZE);
    for (let j = 0; j < FIELDSIZE; j++){
        mapData[i][j] = new Array(FIELDSIZE).fill(0);
    }

}
const setupCameraOrthographic = function(scene, topDownCamera = null){
    if (topDownCamera == null){
        topDownCamera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 10, 0), scene);
    }
    topDownCamera.setTarget(BABYLON.Vector3.Zero());
    topDownCamera.rotation.y = 0;
    topDownCamera.mode = BABYLON.Camera.ORTHOGRAPHIC_CAMERA;
    topDownCamera.orthoTop = FIELDSIZE/2;
    topDownCamera.orthoBottom = -FIELDSIZE/2;
    topDownCamera.orthoRight = FIELDSIZE/2;
    topDownCamera.orthoLeft = -FIELDSIZE/2;
    
    return topDownCamera;
}

const setupCameraArc = function(scene, arcCamera = null){
    if (arcCamera == null){
        arcCamera = new BABYLON.ArcRotateCamera("camera2", 1, 2, 10, BABYLON.Vector3.Zero(), scene);
        arcCamera.attachControl(scene);
    }
    return arcCamera;
}

const setupLight = function(scene){
    let light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0.5, 1, -0.5), scene);

    light.intensity = 1;
    light.specular = new BABYLON.Color3(0,0,0);

    return light;
}

const lightChangeMode = function(light){
    if (light.intensity == 1){
        light.intensity = 0.9;
        light.specular = new BABYLON.Color3(0.5,0.5,1);
    } else {
        light.intensity = 1;
        light.specular = new BABYLON.Color3(0,0,0);
    }
}

const setupSkybox = function(scene){
    let skybox = BABYLON.MeshBuilder.CreateBox("skybox", {size:1000.0}, scene);
    let skyboxMaterial = new BABYLON.StandardMaterial("skybox", scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("textures/skybox", scene);
    skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
    skyboxMaterial.diffuseColor = new BABYLON.Color3(0,0,0);
    skyboxMaterial.specularColor = new BABYLON.Color3(0,0,0);
    skybox.material = skyboxMaterial;

    return skybox;
}

const createScene = function () {
    const scene = new BABYLON.Scene(engine);

    sphere = BABYLON.MeshBuilder.CreateSphere("sphere", {diameter: 1, segments: 32}, scene);
    sphere.position.y = 1;

    return scene;
};

const switchCameras = function(camera1, camera2, scene){
    if (scene.activeCamera == camera1){
        scene.activeCamera = camera2;
        camera2.attachControl(scene)
    } else {
        scene.activeCamera = camera1;
        camera2.detachControl(scene)
    }
}


const createChessBoard = function(posX, posY, posZ, size, squares, scene) {
    for (let i = 0; i < squares; i++){
        for (let j = 0; j < squares; j++){
            let square = BABYLON.MeshBuilder.CreateGround("chess"+i+j, {width:size, height:size}, scene)
            let material = new BABYLON.StandardMaterial(scene);
            material.alpha = 1;

            if ((i+j)%2==0){
                material.diffuseColor = new BABYLON.Color3.White;
            } else {
                material.diffuseColor = new BABYLON.Color3.Gray;
            }
            square.position.x = (i-squares/2+0.5)*size + posX;
            square.position.y = posY;
            square.position.z = (j-squares/2+0.5)*size + posZ;

            square.material = material;
        }
    }
}

const createTile = function(posX, posY, height){
    if (scene.getMeshByName("tileX"+posX+"Y"+posY+"level"+CURRENTLAYER)){
        return null
    }
    let tile = BABYLON.MeshBuilder.CreateBox("tileX"+posX+"Y"+posY+"level"+CURRENTLAYER, {size:1}, scene)
    tile.position.x = posX;
    tile.position.z = posY;
    tile.position.y = height;

    let material = new BABYLON.StandardMaterial(scene);
    material.alpha = 1;
    material.diffuseColor = new BABYLON.Color3(Math.min(1, posX/FIELDSIZE + 0.5), Math.min(1, posY/FIELDSIZE + 0.5), Math.min(1, height/LAYERSAMOUNT))

    tile.material = material;

    return tile;
}

const moveTarget = function(target, horizontalDistance, verticalDistance){
    target.position.x += horizontalDistance;
    target.position.z += verticalDistance;
}

engine.runRenderLoop(function () {
    sphere.position.y = 1 + Math.sin(delta*0.05)*0.2;
    delta += 1;
    scene.render();
});

window.addEventListener("resize", function () {
    engine.resize();
});

const scene = createScene(); 
const topDownCamera = setupCameraOrthographic(scene);
const arcCamera = setupCameraArc(scene);
const light = setupLight(scene);
const skybox = setupSkybox(scene);

console.log(scene)

//createChessBoard(0, -20, 0, 1, FIELDSIZE, scene);

canvas.addEventListener("click", function(event){
    let x = event.x;
    let y = event.y;
    x = Math.floor(x/(CANVASHEIGHT/FIELDSIZE))
    y = Math.floor(y/(CANVASHEIGHT/FIELDSIZE))
    let xTranslated = x - FIELDSIZE/2 + 0.5
    let yTranslated = FIELDSIZE - y - FIELDSIZE/2 - 0.5
    if (scene.activeCamera == topDownCamera){
        if (event.altKey){
            scene.removeMesh(scene.getMeshByName("tileX"+xTranslated+"Y"+yTranslated+"level"+CURRENTLAYER))
            mapData[CURRENTLAYER][y][x] = 0;
        } else {
            createTile(xTranslated,yTranslated, CURRENTLAYER);
            mapData[CURRENTLAYER][y][x] = PAINTMODE;
        }
    }
})
canvas.addEventListener("keydown", function(event){
    if (event.key == " "){
        switchCameras(topDownCamera, arcCamera, scene);
        lightChangeMode(light);
    }

})
