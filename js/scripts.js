const canvas = document.getElementById("renderCanvas"); // Get the canvas element
const engine = new BABYLON.Engine(canvas, true); // Generate the BABYLON 3D engine
var sphere;
var delta = 0;

const CANVASHEIGHT = 768;
const CANVASWIDTH = 768;

var FIELDSIZE = 16;
var LAYERSAMOUNT = 5;

var PAINTMODE = 1;
var MATERIALSLIST = [];
var CURRENTLAYER = 0;

var MAPDATA = new Array(LAYERSAMOUNT)
for (let i = 0; i < LAYERSAMOUNT; i++){
    MAPDATA[i] = new Array(FIELDSIZE);
    for (let j = 0; j < FIELDSIZE; j++){
        MAPDATA[i][j] = new Array(FIELDSIZE).fill(0);
    }
}

const initializeMaterials = function(scene){
    //Eraser material
    MATERIALSLIST = [null];

    //Green material
    let material = new BABYLON.StandardMaterial(scene)
    material.alpha = 1;
    material.diffuseColor = new BABYLON.Color3.Green;
    MATERIALSLIST.push(material);

    //Red material
    material = new BABYLON.StandardMaterial(scene)
    material.alpha = 1;
    material.diffuseColor = new BABYLON.Color3.Red;
    MATERIALSLIST.push(material);

    //Blue material
    material = new BABYLON.StandardMaterial(scene)
    material.alpha = 1;
    material.diffuseColor = new BABYLON.Color3.Blue;
    MATERIALSLIST.push(material);

    //Point of exit
    MATERIALSLIST.push(null);

    //Player starting point
    MATERIALSLIST.push(null);

    return MATERIALSLIST;
}

const setupCameraOrthographic = function(scene, topDownCamera = null){
    if (topDownCamera == null){
        topDownCamera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(FIELDSIZE/2, 40, FIELDSIZE/2), scene);
    }
    topDownCamera.setTarget(new BABYLON.Vector3(FIELDSIZE/2, 0.0, FIELDSIZE/2));
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
        arcCamera = new BABYLON.ArcRotateCamera("camera2", -2, 1.4, 20, new BABYLON.Vector3(FIELDSIZE/2, 0.0, FIELDSIZE/2), scene);
    }
    return arcCamera;
}

const setupLight = function(scene){
    let light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0.35, 1, -0.55), scene);

    light.intensity = 1;
    light.specular = new BABYLON.Color3(0,0,0);

    return light;
}

const lightChangeMode = function(light){
    if (light.intensity == 1){
        light.intensity = 0.9;
        light.specular = new BABYLON.Color3(1.0, 0.9, 0.8);
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

const createTile = function(posX, posY, height, materialNumber, scene){
    if (MAPDATA[CURRENTLAYER][posY][posX] == materialNumber){
        return null;
    }
    if (materialNumber == 4){
        initializeExit(posX, FIELDSIZE - posY, height+1, scene);
        return null;
    }
    if (materialNumber == 5){
        initializePlayer(posX, FIELDSIZE - posY, height+1, scene);
        return null;
    }
    if (materialNumber == 0){
        MAPDATA[CURRENTLAYER][posY][posX] = materialNumber;
        scene.removeMesh(scene.getMeshByName("tileX"+posX+"Y"+posY+"level"+CURRENTLAYER))
        return null;
    } else {
        if (MAPDATA[CURRENTLAYER][posY][posX] != materialNumber){
            createTile(posX, posY, height, 0, scene);
        }
        MAPDATA[CURRENTLAYER][posY][posX] = materialNumber;
        let tile = BABYLON.MeshBuilder.CreateBox("tileX"+posX+"Y"+posY+"level"+CURRENTLAYER, {size:1}, scene)
        tile.position.x = posX+0.5;
        tile.position.z = FIELDSIZE - posY-0.5;
        tile.position.y = height;

        tile.material = MATERIALSLIST[materialNumber];
        return tile;
    }

}

const initializePlayer = function(startX, startY, startHeight, scene){
    let player = scene.getMeshByName("player")
    if (player == null){
        player = BABYLON.MeshBuilder.CreateSphere("player", {diameter: 1, segments: 32}, scene);
    }
    player.position.y = startHeight;
    player.position.x = startX + 0.5;
    player.position.z = startY - 0.5;
    
    return player;
}

const initializeExit = function(startX, startY, startHeight, scene){
    let exit = scene.getMeshByName("exit")
    if (exit == null){
        exit = BABYLON.MeshBuilder.CreateBox("exit", {size: 0.6, segments: 32}, scene);
    }

    let material = new BABYLON.StandardMaterial(scene);
    material.alpha = 0.7;
    material.diffuseColor = new BABYLON.Color3.Red;
    exit.material = material;

    exit.position.y = startHeight;
    exit.position.x = startX + 0.5;
    exit.position.z = startY - 0.5;
    
    return exit;
}

const moveTarget = function(target, horizontalDistance, verticalDistance){
    target.position.x += horizontalDistance;
    target.position.z += verticalDistance;
}

const stepForward = function(){
    player.movePOV(1, 0, 0);
}

const turnRight = function(){
    player.rotatePOV(0, Math.PI/2, 0);
}

const turnLeft = function(){
    player.rotatePOV(0, -Math.PI/2, 0);
}


const scene = createScene(); 
const topDownCamera = setupCameraOrthographic(scene);
const arcCamera = setupCameraArc(scene);
const light = setupLight(scene);
const skybox = setupSkybox(scene);
const player = initializePlayer(7,7,1,scene);
const exit = initializeExit(8, 7, 1, scene);
initializeMaterials(scene);

engine.runRenderLoop(function () {
    player.position.y += Math.sin(delta*0.05)*0.01;
    if (exit){
        exit.rotation.y = delta * 0.006;
        exit.rotation.x = delta * 0.007;
        exit.rotation.z = delta * 0.008;
    }
    delta += 1;
    scene.render();
});

window.addEventListener("resize", function () {
    engine.resize();
});


console.log(scene)

canvas.addEventListener("click", function(event){
    let x = event.x;
    let y = event.y;
    x = Math.floor(x/(CANVASHEIGHT/FIELDSIZE))
    y = Math.floor(y/(CANVASHEIGHT/FIELDSIZE))
    if (scene.activeCamera == topDownCamera){
        if (event.altKey){
            createTile(x,y, CURRENTLAYER, 0, scene);
        } else {
            createTile(x,y, CURRENTLAYER, PAINTMODE, scene);
            
        }
    }
})
canvas.addEventListener("keydown", function(event){
    if (event.key == " "){
        switchCameras(topDownCamera, arcCamera, scene);
        lightChangeMode(light);
    }

})
