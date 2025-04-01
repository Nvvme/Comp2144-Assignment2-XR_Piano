// my piano.js

const canvas = document.getElementById('renderCanvas');
// attaching the BABYLON 3d engine to the canvas
const engine = new BABYLON.Engine(canvas, true, { audioEngine: true }); // All I had to do was add this line and it works now :)

// Manually unlocking the audio engine
if (!BABYLON.Engine.audioEngine) {
  BABYLON.Engine.audioEngine = new BABYLON.AudioEngine();
  console.log(' Manually initialized audio engine. :|');
}

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

  // audio file map
  const noteAudioMap = {
    C4: 'sounds/C4.mp3',
    Db4: 'sounds/Db4.mp3',
    D4: 'sounds/D4.mp3',
    Eb4: 'sounds/Eb4.mp3',
    E4: 'sounds/E4.mp3',
    F4: 'sounds/F4.mp3',
    Gb4: 'sounds/Gb4.mp3',
    G4: 'sounds/G4.mp3',
    Ab4: 'sounds/Ab4.mp3',
    A4: 'sounds/A4.mp3',
    Bb4: 'sounds/Bb4.mp3',
    B4: 'sounds/B4.mp3',
  };

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

    // Clone the white material so each key can highlight individually
    key.material = whiteMat.clone(`${note}_mat`);

    // Add interaction using the full note name (like "C4")
    addKeyInteraction(key, note + '4', scene);
  });

  // Black key info
  // The null entries mark places where black keys don't exist, like E-F and B-C.
  const blackKeys = ['Db4', 'Eb4', null, 'Gb4', 'Ab4', 'Bb4', null];
  // I could only find the mp3 files labeled flat and such. They are the same so I just changed the names here

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

    // Cloning the black material so each black key can highlight individually
    blackKey.material = blackMat.clone(`${note}_mat`);

    // Add interaction
    addKeyInteraction(blackKey, note, scene);
  });

  // Function that sets up highlight and playing the sound
  function addKeyInteraction(mesh, noteName, sceneRef) {
    // Mark the mesh as pickable for VR/desktop clicks
    mesh.isPickable = true;
    mesh.actionManager = new BABYLON.ActionManager(sceneRef);

    // On hover, set a faint emissive color to highlight
    mesh.actionManager.registerAction(
      new BABYLON.InterpolateValueAction(
        BABYLON.ActionManager.OnPointerOverTrigger,
        mesh.material,
        'emissiveColor',
        BABYLON.Color3.Gray(), // faint highlight
        150
      )
    );

    // On pointer out, remove highlight
    mesh.actionManager.registerAction(
      new BABYLON.InterpolateValueAction(
        BABYLON.ActionManager.OnPointerOutTrigger,
        mesh.material,
        'emissiveColor',
        BABYLON.Color3.Black(),
        150
      )
    );

    // On click
    mesh.actionManager.registerAction(
      new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, () => {
        playNote(noteName);

        // Simple press effect
        const originalY = mesh.position.y;
        mesh.position.y = originalY - 0.03;
        setTimeout(() => {
          mesh.position.y = originalY;
        }, 150);
      })
    );
  }

  function playNote(note) {
    const soundUrl = noteAudioMap[note];
    if (!soundUrl) return;
    const noteSound = new BABYLON.Sound(
      note + '_sound',
      soundUrl,
      scene,
      null,
      {
        volume: 1.0,
        autoplay: true,
      }
    );
  }

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
