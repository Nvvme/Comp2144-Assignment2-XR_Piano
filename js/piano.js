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

  // Ground material
  const groundMat = new BABYLON.StandardMaterial('groundMat', scene);
  groundMat.diffuseColor = new BABYLON.Color3(0.45, 0.35, 0.25); // I didn't like the white color so I am going with a classy brown.
  ground.material = groundMat;

  // now for the Piano

  // One material for white keys, one for black
  const whiteMat = new BABYLON.StandardMaterial('whiteMat', scene);
  whiteMat.diffuseColor = new BABYLON.Color3(1, 1, 1);

  const blackMat = new BABYLON.StandardMaterial('blackMat', scene);
  blackMat.diffuseColor = new BABYLON.Color3(0, 0, 0);

  // I don't know how to read sheet music or how to play a piano
  // but I looked up some stuff online and this is what the white keys of an octave are

  // White key info
  const whiteKeys = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
  // Basic sizes for each key box
  // After a lot of fine tunning
  const whiteWidth = 0.2,
    whiteDepth = 1.0,
    whiteHeight = 0.08;
  // Start position in X this will help to keep it centered
  const startX = -(whiteKeys.length / 2) * whiteWidth;

  // Making the white keys
  whiteKeys.forEach((note, i) => {
    const key = BABYLON.MeshBuilder.CreateBox(
      `${note}_whiteKey`,
      { width: whiteWidth, height: whiteHeight, depth: whiteDepth },
      scene
    );
    key.position.x = startX + i * whiteWidth;
    key.position.y = 0.4; // float it a bit above the ground
    key.material = whiteMat;
  });

  // Black key info
  // The null entries mark places where black keys don't exist, like E-F and B-C.
  const blackKeys = ['C#', 'D#', null, 'F#', 'G#', 'A#', null];
  const blackWidth = 0.12,
    blackDepth = 0.6,
    blackHeight = 0.12;

  // Making the black keys
  blackKeys.forEach((note, i) => {
    if (!note) return; // skip if there's no black key in between

    const blackKey = BABYLON.MeshBuilder.CreateBox(
      `${note}_blackKey`,
      { width: blackWidth, height: blackHeight, depth: blackDepth },
      scene
    );
    // Position it between the white keys, slightly behind
    blackKey.position.x = startX + (i + 1) * whiteWidth - whiteWidth / 2;
    blackKey.position.y = 0.4 + blackHeight / 2;
    blackKey.position.z = -(whiteDepth - blackDepth) / 2;
    blackKey.material = blackMat;
  });

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
