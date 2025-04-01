// my piano.js

const canvas = document.getElementById('renderCanvas');
// attaching the BABYLON 3d engine to the canvas
const engine = new BABYLON.Engine(canvas, true);

async function createScene() {
  const scene = new BABYLON.Scene(engine);

  // Basic camera
  const camera = new BABYLON.ArcRotateCamera(
    'cam',
    -Math.PI / 2,
    Math.PI / 2.5,
    5,
    new BABYLON.Vector3(0, 0, 0),
    scene
  );
  camera.attachControl(canvas, true);

  // Simple light
  const light = new BABYLON.HemisphericLight(
    'light',
    new BABYLON.Vector3(0, 1, 0),
    scene
  );
  light.intensity = 1.0;

  // Ground
  const ground = BABYLON.MeshBuilder.CreateGround(
    'ground',
    { width: 10, height: 10 },
    scene
  );

  // Basic WebXR setup
  const xrHelper = await scene.createDefaultXRExperienceAsync({
    floorMeshes: [ground],
  });

  return scene;
}

createScene().then((scene) => {
  engine.runRenderLoop(() => {
    scene.render();
  });
});

window.addEventListener('resize', () => {
  engine.resize();
});
