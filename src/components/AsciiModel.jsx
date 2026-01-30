import { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { AsciiEffect } from 'three/addons/effects/AsciiEffect.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

/**
 * AsciiModel Component
 *
 * Renders a 3D model with Three.js ASCII effect
 *
 * @param {string} modelPath - Path to .glb file (in public folder)
 * @param {string} currentAnimation - Name of animation to play
 * @param {function} onAnimationComplete - Callback when animation finishes (non-looping only)
 * @param {object} cameraView - Camera offsets from original position { positionOffset: [x,y,z], targetOffset: [x,y,z] }
 * @param {object} options - Configuration options
 * @param {string} options.characters - ASCII characters dark to light (default: ' .:-=+*#%@')
 * @param {boolean} options.invert - Invert colors (default: true)
 * @param {number} options.resolution - Detail level, lower = more detail (default: 0.15)
 * @param {string} options.color - Text color (default: 'white')
 * @param {string} options.backgroundColor - Background color (default: 'black')
 * @param {number} options.scale - Model scale (default: 1)
 * @param {array} options.position - Model position [x, y, z] (default: [0, 0, 0])
 * @param {boolean} options.autoRotate - Auto rotate model (default: false)
 * @param {boolean} options.enableControls - Enable orbit controls (default: true)
 *   Controls: Left-click drag = rotate/orbit, Right-click drag = pan (move up/down/left/right), Scroll = zoom
 */
function AsciiModel({
  modelPath,
  currentAnimation,
  onAnimationComplete,
  cameraView,
  options = {}
}) {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const effectRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const modelRef = useRef(null);
  const mixerRef = useRef(null);
  const actionsRef = useRef({});
  const clockRef = useRef(new THREE.Clock());
  const animationIdRef = useRef(null);
  const previousAnimationRef = useRef(null);
  const originalCameraPositionRef = useRef(null);
  const originalCameraTargetRef = useRef(null);
  const cameraReadyRef = useRef(false);
  const cameraAnimationIdRef = useRef(null);
  const hasAnimatedCameraRef = useRef(false);

  // Default options
  const {
    characters = ' .:-=+*#%@',
    invert = true,
    resolution = 0.15,
    color = 'white',
    backgroundColor = 'black',
    scale = 1,
    position = [0, 0, 0],
    autoRotate = false,
    enableControls = true,
  } = options;

  // Initialize Three.js scene
  const initScene = useCallback(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, -2, 0);
    cameraRef.current = camera;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const directionalLight1 = new THREE.DirectionalLight(0xffffff, 1.0);
    directionalLight1.position.set(10, 10, 5);
    scene.add(directionalLight1);

    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight2.position.set(-10, 10, -5);
    scene.add(directionalLight2);

    const pointLight = new THREE.PointLight(0xffffff, 0.6);
    pointLight.position.set(0, 5, 10);
    scene.add(pointLight);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;

    // ASCII Effect
    const effect = new AsciiEffect(renderer, characters, { invert, resolution });
    effect.setSize(width, height);
    effect.domElement.style.color = color;
    effect.domElement.style.backgroundColor = backgroundColor;
    effect.domElement.style.width = '100%';
    effect.domElement.style.height = '100%';
    effectRef.current = effect;

    // Append to container
    container.appendChild(effect.domElement);

    // Orbit Controls
    if (enableControls) {
      const controls = new OrbitControls(camera, effect.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;

      // Enable panning (right-click drag)
      controls.enablePan = true;
      controls.screenSpacePanning = true;
      controls.panSpeed = 1.0;

      // Mouse button assignments:
      // Left click = rotate (orbit around object)
      // Right click = pan (move camera up/down/left/right)
      // Scroll = zoom in/out
      controls.mouseButtons = {
        LEFT: THREE.MOUSE.ROTATE,
        MIDDLE: THREE.MOUSE.DOLLY,
        RIGHT: THREE.MOUSE.PAN
      };

      // Distance constraints
      controls.minDistance = 0.1;
      controls.maxDistance = 1.5;

      controlsRef.current = controls;
    }
  }, [characters, invert, resolution, color, backgroundColor, enableControls]);

  // Load model
  const loadModel = useCallback(() => {
    if (!sceneRef.current || !modelPath) return;

    const loader = new GLTFLoader();

    loader.load(
      modelPath,
      (gltf) => {
        // Remove previous model
        if (modelRef.current) {
          sceneRef.current.remove(modelRef.current);
          modelRef.current = null;
        }

        const model = gltf.scene;
        modelRef.current = model;

        // Apply scale and position
        model.scale.setScalar(scale);
        model.position.set(...position);

        // Flip model 180 degrees to face the other way
        //model.rotation.y = (Math.PI/2) * .7;
        model.rotation.y = (Math.PI/2) * -.15;

        sceneRef.current.add(model);

        // Setup animations
        if (gltf.animations && gltf.animations.length > 0) {
          const mixer = new THREE.AnimationMixer(model);
          mixerRef.current = mixer;
          actionsRef.current = {};

          gltf.animations.forEach((clip) => {
            const action = mixer.clipAction(clip);
            actionsRef.current[clip.name] = action;
          });

          // Log available animations
          console.log('Available animations:', Object.keys(actionsRef.current));

          // Play initial animation
          if (currentAnimation && actionsRef.current[currentAnimation]) {
            actionsRef.current[currentAnimation].play();
            previousAnimationRef.current = currentAnimation;
          } else if (gltf.animations.length > 0) {
            // Play first animation if specified one doesn't exist
            const firstAnim = gltf.animations[0].name;
            actionsRef.current[firstAnim].play();
            previousAnimationRef.current = firstAnim;
          }
        }

        // Auto-fit camera to model
        fitCameraToModel(model);
      },
      (progress) => {
        const percent = ((progress.loaded / progress.total) * 100).toFixed(0);
        console.log(`Loading model: ${percent}%`);
      },
      (error) => {
        console.error('Error loading model:', error);
      }
    );
  }, [modelPath, scale, JSON.stringify(position)]);

  // Fit camera to model bounds
  const fitCameraToModel = (model) => {
    if (!cameraRef.current) return;

    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    // Calculate baseline camera distance
    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = cameraRef.current.fov * (Math.PI / 180);
    const baseDistance =  maxDim / (2 * Math.tan(fov / 2));

    // ===== CAMERA OFFSET CONSTANTS (EASY TO MODIFY) =====
    // calculates the position of the camera relative to lookTarget coords
    // Positive X = move camera RIGHT relative to model
    // Negative X = move camera LEFT relative to model
    const CAMERA_OFFSET_X = .2;

    // Positive Y = move camera UP relative to model
    // Negative Y = move camera DOWN relative to model
    const CAMERA_OFFSET_Y = .42;  // Position camera lower so it looks up at model

    // Positive Z = move camera BACK (further from model)
    // Negative Z = move camera FORWARD (closer to model)
    const CAMERA_OFFSET_Z = .8;  // Position camera further back

    // Where the camera looks (target point offsets)
    const TARGET_OFFSET_X = 0;
    const TARGET_OFFSET_Y = 0;
    const TARGET_OFFSET_Z = 0;
    // ====================================================

    // calculates the point at which we are viewing the model
    const lookTarget = new THREE.Vector3(
      box.min.x + .08,
      box.min.y + .75,
      box.min.z + .55,
    );

    // Calculate camera position
    const cameraPosition = new THREE.Vector3(
      center.x + CAMERA_OFFSET_X,
      center.y + CAMERA_OFFSET_Y,
      center.z + baseDistance + CAMERA_OFFSET_Z
    );

    cameraRef.current.position.copy(cameraPosition);
    cameraRef.current.lookAt(lookTarget);

    // Store original camera position and target for offset calculations
    originalCameraPositionRef.current = cameraPosition.clone();
    originalCameraTargetRef.current = lookTarget.clone();
    cameraReadyRef.current = true;  // Mark camera as ready
    hasAnimatedCameraRef.current = true;  // Reset on model load

    if (controlsRef.current) {
      controlsRef.current.target.copy(lookTarget);
      controlsRef.current.update();
    }
  };

  // Animation loop
  const animate = useCallback(() => {
    animationIdRef.current = requestAnimationFrame(animate);

    const delta = clockRef.current.getDelta();

    // Update mixer
    if (mixerRef.current) {
      mixerRef.current.update(delta);
    }

    // Auto rotate
    if (modelRef.current && autoRotate) {
      modelRef.current.rotation.y += 0.005;
    }

    // Update controls
    if (controlsRef.current) {
      controlsRef.current.update();
    }

    // Render
    if (effectRef.current && sceneRef.current && cameraRef.current) {
      effectRef.current.render(sceneRef.current, cameraRef.current);
    }
  }, [autoRotate]);

  // Handle resize
  const handleResize = useCallback(() => {
    if (!containerRef.current || !cameraRef.current || !rendererRef.current || !effectRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    cameraRef.current.aspect = width / height;
    cameraRef.current.updateProjectionMatrix();

    rendererRef.current.setSize(width, height);
    effectRef.current.setSize(width, height);
  }, []);

  // Handle camera view changes
  useEffect(() => {
    if (!cameraRef.current || !controlsRef.current || !cameraView) return;
    if (!cameraReadyRef.current || !originalCameraPositionRef.current || !originalCameraTargetRef.current) return;

    // Cancel any existing camera animation
    if (cameraAnimationIdRef.current) {
      cancelAnimationFrame(cameraAnimationIdRef.current);
    }

    const { positionOffset, targetOffset } = cameraView;
    const camera = cameraRef.current;
    const controls = controlsRef.current;

    const endPos = originalCameraPositionRef.current.clone().add(new THREE.Vector3(...positionOffset));
    const endTarget = originalCameraTargetRef.current.clone().add(new THREE.Vector3(...targetOffset));

    // On first load, snap immediately (no animation)
    if (!hasAnimatedCameraRef.current) {
      camera.position.copy(endPos);
      controls.target.copy(endTarget);
      controls.update();
      hasAnimatedCameraRef.current = true;
      return;
    }

    // Animate camera transition
    const startPos = camera.position.clone();
    const startTarget = controls.target.clone();
    const duration = 1000;
    const startTime = Date.now();

    const animateCamera = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const eased = progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;

      camera.position.lerpVectors(startPos, endPos, eased);
      controls.target.lerpVectors(startTarget, endTarget, eased);
      controls.update();

      if (progress < 1) {
        cameraAnimationIdRef.current = requestAnimationFrame(animateCamera);
      }
    };

    cameraAnimationIdRef.current = requestAnimationFrame(animateCamera);

    return () => {
      if (cameraAnimationIdRef.current) {
        cancelAnimationFrame(cameraAnimationIdRef.current);
      }
    };
  }, [cameraView]);

  // Handle animation changes
  useEffect(() => {
    if (!mixerRef.current || !actionsRef.current || !currentAnimation) return;

    const newAction = actionsRef.current[currentAnimation];
    const prevAction = previousAnimationRef.current
      ? actionsRef.current[previousAnimationRef.current]
      : null;

    if (newAction && newAction !== prevAction) {
      const crossfadeDuration = 0.4;

      // Reset the new action to ensure it starts from a clean state
      // This fixes animations that were previously faded out and need to be replayed
      newAction.reset();
      newAction.setEffectiveWeight(1);
      newAction.setEffectiveTimeScale(1);
      newAction.play();

      if (prevAction) {
        // Use explicit fadeOut + fadeIn for predictable behavior
        // Both happen simultaneously so there's always at least one animation with non-zero weight
        prevAction.fadeOut(crossfadeDuration);
        newAction.fadeIn(crossfadeDuration);
      } else {
        newAction.fadeIn(crossfadeDuration);
      }

      previousAnimationRef.current = currentAnimation;

      // Set up completion callback for non-looping animations
      if (onAnimationComplete && newAction.loop === THREE.LoopOnce) {
        newAction.clampWhenFinished = true;

        const onFinished = (e) => {
          if (e.action === newAction) {
            onAnimationComplete(currentAnimation);
            mixerRef.current?.removeEventListener('finished', onFinished);
          }
        };

        mixerRef.current.addEventListener('finished', onFinished);
      }
    }
  }, [currentAnimation, onAnimationComplete]);

  // Initialize
  useEffect(() => {
    initScene();
    
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      
      // Cleanup
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      
      if (controlsRef.current) {
        controlsRef.current.dispose();
      }
      
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      
      if (effectRef.current && effectRef.current.domElement.parentNode) {
        effectRef.current.domElement.parentNode.removeChild(effectRef.current.domElement);
      }
    };
  }, [initScene, handleResize]);

  // Load model when path changes
  useEffect(() => {
    if (sceneRef.current && modelPath) {
      loadModel();
    }
  }, [modelPath, loadModel]);

  // Start animation loop after scene is ready
  useEffect(() => {
    if (sceneRef.current) {
      animate();
    }
    
    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, [animate]);

  return (
    <div 
      ref={containerRef} 
      style={{ 
        width: '100%', 
        height: '100%',
        overflow: 'hidden'
      }} 
    />
  );
}

export default AsciiModel;
