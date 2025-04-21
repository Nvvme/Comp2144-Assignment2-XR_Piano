// my piano.js

const canvas = document.getElementById('renderCanvas');
// attaching the BABYLON 3d engine to the canvas
const engine = new BABYLON.Engine(canvas, true, { audioEngine: true }); // All I had to do was add this line and it works now :)

// Manually unlocking the audio engine
if (!BABYLON.Engine.audioEngine) {
  BABYLON.Engine.audioEngine = new BABYLON.AudioEngine();
  console.log(' Manually initialized audio engine. :|');
}

// Alot of trial and error to semitone offsets within an octave
const semitoneMap = {
  C: 0,
  Db: 1,
  D: 2,
  Eb: 3,
  E: 4,
  F: 5,
  Gb: 6,
  G: 7,
  Ab: 8,
  A: 9,
  Bb: 10,
  B: 11,
};

// changing some stuff up
function getPlaybackRate(noteName, baseOctave = 4) {
  const root = noteName.length === 3 ? noteName.slice(0, 2) : noteName[0];
  const octave = parseInt(noteName.slice(root.length), 10);
  const target = semitoneMap[root] + octave * 12;
  const base = semitoneMap[root] + baseOctave * 12;
  return Math.pow(2, (target - base) / 12);
}

async function createScene() {
  const scene = new BABYLON.Scene(engine);

  // Adding a UI for note display
  const gui = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI('UI');
  const noteLabel = new BABYLON.GUI.TextBlock();
  noteLabel.text = '';
  noteLabel.color = 'white';
  noteLabel.fontSize = 48;
  noteLabel.textHorizontalAlignment =
    BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
  noteLabel.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
  noteLabel.paddingTop = '20px';
  noteLabel.alpha = 0;
  gui.addControl(noteLabel);

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

  // spacing between white keys
  const keyGap = 0.002;

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

  // center across total width = keys*width + gaps*(keys–1)
  const totalW =
    whiteKeys.length * whiteWidth + (whiteKeys.length - 1) * keyGap;

  // Black key info
  // The null entries mark places where black keys don't exist, like E-F and B-C.
  const blackKeys = ['Db4', 'Eb4', null, 'Gb4', 'Ab4', 'Bb4', null];
  // I could only find the mp3 files labeled flat and such. They are the same so I just changed the names here

  const blackWidth = 0.12,
    blackDepth = 0.6,
    blackHeight = 0.12;

  // adding the entire keyboard now using this logic
  const noteNames = [
    'C',
    'Db',
    'D',
    'Eb',
    'E',
    'F',
    'Gb',
    'G',
    'Ab',
    'A',
    'Bb',
    'B',
  ];
  const octaves = [2, 3, 4, 5, 6];
  const keyStep = whiteWidth + keyGap;

  // the white keys
  const totalWhites = whiteKeys.length * octaves.length;
  const baseX = -(totalWhites * keyStep) / 2 + whiteWidth / 2;

  let whiteIndex = 0;
  octaves.forEach((oct, oi) => {
    noteNames.forEach((root, ni) => {
      const note = root + oct;
      const isBlack = root.includes('b');
      const w = isBlack ? blackWidth : whiteWidth;
      const h = isBlack ? blackHeight : whiteHeight;
      const d = isBlack ? blackDepth : whiteDepth;
      const mesh = BABYLON.MeshBuilder.CreateBox(
        `${note}_${isBlack ? 'black' : 'white'}Key`,
        { width: w, height: h, depth: d },
        scene
      );
      if (isBlack) {
        // center between previous and next white keys
        const lastX = baseX + (whiteIndex - 1) * keyStep;
        const nextX = baseX + whiteIndex * keyStep;
        mesh.position.x = (lastX + nextX) / 2;
        mesh.position.y = 0.4 + blackHeight / 2;
        mesh.position.z = whiteDepth / 2 - blackDepth / 2;
      } else {
        mesh.position.x = baseX + whiteIndex * keyStep;
        mesh.position.y = 0.4;
        mesh.position.z = 0;
        whiteIndex++;
      }
      mesh.material = (isBlack ? blackMat : whiteMat).clone(`${note}_mat`);
      addKeyInteraction(mesh, note, scene);
    });
  });

  // Adding a lone C7 key
  const c7Key = BABYLON.MeshBuilder.CreateBox(
    'C7_whiteKey',
    { width: whiteWidth, height: whiteHeight, depth: whiteDepth },
    scene
  );
  // placing it immediately after the existing octaves (7 whites × 5 octaves = 35 slots)
  c7Key.position.x = baseX + 35 * (whiteWidth + keyGap);
  c7Key.position.y = 0.4;
  c7Key.position.z = 0;
  c7Key.material = whiteMat.clone('C7_mat');
  addKeyInteraction(c7Key, 'C7', scene);

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
        // display the note name
        noteLabel.text = noteName;
        noteLabel.alpha = 1;
        setTimeout(() => {
          noteLabel.alpha = 0;
        }, 800);

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
    // determine base sample name and shift
    const root = note.length === 3 ? note.slice(0, 2) : note[0];
    const baseSample = root + '4';
    const soundUrl = noteAudioMap[baseSample];
    if (!soundUrl) return;
    const rate = getPlaybackRate(note, 4);
    const noteSound = new BABYLON.Sound(
      note + '_sound',
      soundUrl,
      scene,
      () => noteSound.play(),
      {
        volume: 1.0,
        playbackRate: rate,
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
