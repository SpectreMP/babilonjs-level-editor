const canvas = document.getElementById("renderCanvas"); // Get the canvas element
const engine = new BABYLON.Engine(canvas, true); // Generate the BABYLON 3D engine
var sphere;
var delta = 0;

var paintmode = 1;
var field = [
    [0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0],
]

const createChessBoard = function(posX, posY, posZ, size, squares = 3) {
    for (let i = -squares+1; i < squares; i++){
        for (let j = -squares+1; j < squares; j++){
            let square = BABYLON.MeshBuilder.CreateGround("chess"+i+j, {width:size, height:size}, scene)
            let material = new BABYLON.StandardMaterial(scene);
            material.alpha = 1;

            if ((i+j)%2==0){
                material.diffuseColor = new BABYLON.Color3.White;
            } else {
                material.diffuseColor = new BABYLON.Color3.Gray;
            }
            square.position.x = i*size + posX;
            square.position.y = posY;
            square.position.z = j*size + posZ;

            square.material = material;
        }
    }
}

const createScene = function () {
    const scene = new BABYLON.Scene(engine);

    const camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 10, 0), scene);
    camera.setTarget(BABYLON.Vector3.Zero());
    //camera.attachControl(canvas, true);
    camera.rotation.y = 0;
    camera.mode = BABYLON.Camera.ORTHOGRAPHIC_CAMERA;
    camera.orthoTop = 5;
    camera.orthoBottom = -5;
    camera.orthoRight = 5;
    camera.orthoLeft = -5;
    
    const light = new BABYLON.DirectionalLight("light", new BABYLON.Vector3(0, -1, 0), scene);
    light.intensity = 0.5;

    sphere = BABYLON.MeshBuilder.CreateSphere("sphere", {diameter: 1, segments: 32}, scene);
    sphere.position.y = 1;

    return scene;
};

const createTile = function(posX, posY){
    let plate = BABYLON.MeshBuilder.CreateGround("plateX"+posX+"Y"+posY, {width:1, height:1}, scene)
    plate.position.x = posX;
    plate.position.z = posY;
    plate.position.y = 0;

    let material = new BABYLON.StandardMaterial(scene);
    material.alpha = 1;
    material.diffuseColor = new BABYLON.Color3.Teal;

    plate.material = material;

    return plate;
}

const scene = createScene(); //Call the createScene function

console.log(scene, "Scene");
console.log(sphere, "Sphere");

createChessBoard(0,-1,0,1,5);
engine.runRenderLoop(function () {
        sphere.position.y = 1 + Math.sin(delta*0.05)*0.2;
        delta += 1;
        scene.render();
});
window.addEventListener("resize", function () {
        engine.resize();
});
const moveLeft = function(target){
    target.position.x += 1;
}
const moveRight = function(target){
    target.position.x -= 1;
}
const moveUp = function(target){
    target.position.z += 1;
}
const moveDown = function(target){
    target.position.z -= 1;
}

canvas.addEventListener("click", function(event){
    let x = event.x;
    let y = event.y;
    if (x > 38 & x < 730 & y > 38 & y < 730){
        x -= 38;
        y -= 38;
        x = Math.floor(x/76.8888)
        y = Math.floor(y/76.8888)
        let xTranslated = x - 4
        let yTranslated = 8 - y -4
        if (event.altKey){
            scene.removeMesh(scene.getMeshByName("plateX"+xTranslated+"Y"+yTranslated))
            field[x][y] = 0;
        } else {
            createTile(xTranslated,yTranslated);
            field[x][y] = paintmode;
        }
    }
})
