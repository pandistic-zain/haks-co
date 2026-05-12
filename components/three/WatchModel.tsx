"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { usePrefersReducedMotion } from "@/lib/hooks/use-prefers-reduced-motion";

export type WatchPose = {
  rotX?: number;
  rotY?: number;
  rotZ?: number;
  posX?: number;
  posY?: number;
  scale?: number;
};

export type WatchCameraPose = {
  x?: number;
  y?: number;
  z?: number;
};

export type WatchModelController = {
  setPose: (pose: WatchPose) => void;
  setCamera: (pose: WatchCameraPose) => void;
  setInteractive: (enabled: boolean) => void;
  setLighting: (levels: { key?: number; fill?: number; ember?: number; ambient?: number }) => void;
  resetToIdle: () => void;
};

type WatchModelProps = {
  className?: string;
  targetSize?: number;
  cameraZ?: number;
  initialRotationY?: number;
  autoRotateSpeed?: number;
  interactive?: boolean;
  allowZoom?: boolean;
  scrollReactive?: boolean;
  scrollMotionEnabled?: boolean;
};

function fitObject(object: THREE.Object3D, targetSize: number) {
  const box = new THREE.Box3().setFromObject(object);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const maxSize = Math.max(size.x, size.y, size.z) || 1;
  const scale = targetSize / maxSize;

  object.position.sub(center);
  object.scale.setScalar(scale);

  return scale;
}

function buildFallback(scene: THREE.Scene, targetSize: number) {
  const group = new THREE.Group();

  const metal = new THREE.MeshStandardMaterial({
    color: 0xd0d0d0,
    metalness: 0.9,
    roughness: 0.22
  });
  const dark = new THREE.MeshStandardMaterial({
    color: 0x111111,
    metalness: 0.42,
    roughness: 0.34
  });
  const strapMaterial = new THREE.MeshStandardMaterial({
    color: 0x1c1716,
    metalness: 0.24,
    roughness: 0.5
  });

  const bezel = new THREE.Mesh(new THREE.TorusGeometry(1.2, 0.18, 36, 128), metal);
  const dial = new THREE.Mesh(new THREE.CircleGeometry(1.01, 96), dark);
  const strap = new THREE.Mesh(new THREE.BoxGeometry(0.66, 4.1, 0.16), strapMaterial);
  const crown = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.42, 0.22), metal);

  dial.position.z = 0.08;
  strap.position.z = -0.11;
  crown.position.set(1.38, 0, 0.04);

  group.add(strap, bezel, dial, crown);

  const hourHand = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.7, 0.05), metal);
  const minuteHand = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.96, 0.05), metal);
  hourHand.position.set(0, 0.28, 0.14);
  minuteHand.position.set(0.22, 0.27, 0.145);
  minuteHand.rotation.z = -0.72;
  group.add(hourHand, minuteHand);

  scene.add(group);
  group.scale.setScalar(targetSize / 4);

  return group;
}

function disposeObject(root: THREE.Object3D) {
  root.traverse((child) => {
    const mesh = child as THREE.Mesh;

    if (!mesh.isMesh) {
      return;
    }

    mesh.geometry?.dispose();
    const material = mesh.material;

    if (Array.isArray(material)) {
      material.forEach((item) => item.dispose());
      return;
    }

    material?.dispose();
  });
}

export const WatchModel = forwardRef<WatchModelController, WatchModelProps>(function WatchModel(
  {
    className,
    targetSize = 3.4,
    cameraZ = 7,
    initialRotationY = 0,
    autoRotateSpeed = 0.005,
    interactive = true,
    allowZoom = true
  },
  ref
) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const [isWebGLAvailable, setIsWebGLAvailable] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const modelRef = useRef<THREE.Object3D | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  const baseScaleRef = useRef(1);
  const basePoseRef = useRef({
    rotX: 0.35,
    rotY: initialRotationY,
    rotZ: -0.2,
    posX: 0,
    posY: 0
  });

  const poseRef = useRef({
    rotX: 0.35,
    rotY: initialRotationY,
    rotZ: -0.2,
    posX: 0,
    posY: 0,
    scale: 1
  });
  const renderedPoseRef = useRef({
    rotX: 0.35,
    rotY: initialRotationY,
    rotZ: -0.2,
    posX: 0,
    posY: 0,
    scale: 1
  });

  const cameraPoseRef = useRef({
    x: 0,
    y: 0,
    z: cameraZ
  });
  const renderedCameraRef = useRef({
    x: 0,
    y: 0,
    z: cameraZ
  });

  const interactiveRef = useRef(interactive);
  const lightRefs = useRef<{
    ambient: THREE.AmbientLight | null;
    key: THREE.DirectionalLight | null;
    fill: THREE.DirectionalLight | null;
    ember: THREE.DirectionalLight | null;
  }>({
    ambient: null,
    key: null,
    fill: null,
    ember: null
  });

  const lightIntensityRef = useRef({
    ambient: 2.8,
    key: 5,
    fill: 2.4,
    ember: 2.3
  });
  const renderedLightRef = useRef({
    ambient: 2.8,
    key: 5,
    fill: 2.4,
    ember: 2.3
  });

  useImperativeHandle(
    ref,
    () => ({
      setPose: (nextPose) => {
        poseRef.current = {
          ...poseRef.current,
          ...nextPose
        };
      },
      setCamera: (nextCamera) => {
        cameraPoseRef.current = {
          ...cameraPoseRef.current,
          ...nextCamera
        };
      },
      setInteractive: (enabled) => {
        interactiveRef.current = enabled;

        if (controlsRef.current) {
          controlsRef.current.enabled = enabled;
        }
      },
      setLighting: (levels) => {
        lightIntensityRef.current = {
          ...lightIntensityRef.current,
          ...levels
        };
      },
      resetToIdle: () => {
        poseRef.current = {
          ...basePoseRef.current,
          scale: 1
        };
        renderedPoseRef.current = {
          ...basePoseRef.current,
          scale: 1
        };
        cameraPoseRef.current = {
          x: 0,
          y: 0,
          z: cameraZ
        };
        renderedCameraRef.current = {
          x: 0,
          y: 0,
          z: cameraZ
        };
        interactiveRef.current = interactive;

        if (controlsRef.current) {
          controlsRef.current.enabled = interactive;
          controlsRef.current.target.set(0, 0, 0);
        }

        lightIntensityRef.current = {
          ambient: 2.8,
          key: 5,
          fill: 2.4,
          ember: 2.3
        };
        renderedLightRef.current = {
          ambient: 2.8,
          key: 5,
          fill: 2.4,
          ember: 2.3
        };
      }
    }),
    [cameraZ, interactive]
  );

  useEffect(() => {
    if (prefersReducedMotion) {
      setLoadError(null);
      return;
    }

    const canvas = canvasRef.current;
    const container = containerRef.current;

    if (!canvas || !container) {
      return;
    }

    setIsWebGLAvailable(true);
    setLoadError(null);

    const canCreateWebGLContext = () => {
      const testCanvas = document.createElement("canvas");
      const contextAttributes: WebGLContextAttributes = {
        alpha: true,
        antialias: true,
        powerPreference: "high-performance"
      };

      return (
        !!testCanvas.getContext("webgl2", contextAttributes) ||
        !!testCanvas.getContext("webgl", contextAttributes)
      );
    };

    if (!canCreateWebGLContext()) {
      setIsWebGLAvailable(false);
      return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    camera.position.set(0, 0, cameraZ);
    cameraRef.current = camera;
    cameraPoseRef.current = {
      x: 0,
      y: 0,
      z: cameraZ
    };

    let renderer: THREE.WebGLRenderer | null = null;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: "high-performance"
      });
    } catch {
      setIsWebGLAvailable(false);
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, window.innerWidth < 768 ? 1.2 : 1.6));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const ambient = new THREE.AmbientLight(0xffffff, lightIntensityRef.current.ambient);
    const key = new THREE.DirectionalLight(0xffffff, lightIntensityRef.current.key);
    const fill = new THREE.DirectionalLight(0xffffff, lightIntensityRef.current.fill);
    const ember = new THREE.DirectionalLight(0x8b2038, lightIntensityRef.current.ember);

    key.position.set(5, 8, 8);
    fill.position.set(-5, 3, 5);
    ember.position.set(0, -5, 4);
    scene.add(ambient, key, fill, ember);

    lightRefs.current = {
      ambient,
      key,
      fill,
      ember
    };

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enablePan = false;
    controls.enableZoom = allowZoom;
    controls.enabled = interactiveRef.current;
    controls.minDistance = 3;
    controls.maxDistance = 18;
    controlsRef.current = controls;

    const updateSize = () => {
      const width = Math.max(container.clientWidth, 1);
      const height = Math.max(container.clientHeight, 1);

      renderer?.setPixelRatio(Math.min(window.devicePixelRatio, window.innerWidth < 768 ? 1.2 : 1.6));
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer?.setSize(width, height, false);
    };

    updateSize();

    const loader = new GLTFLoader();
    let disposed = false;
    let isInView = true;
    let isPageVisible = document.visibilityState !== "hidden";
    let intersectionObserver: IntersectionObserver | null = null;

    loader.load(
      "/model/watch.glb",
      (gltf) => {
        if (disposed) {
          disposeObject(gltf.scene);
          return;
        }

        const model = gltf.scene;
        scene.add(model);
        modelRef.current = model;
        setLoadError(null);

        model.rotation.x = basePoseRef.current.rotX;
        model.rotation.y = basePoseRef.current.rotY;
        model.rotation.z = basePoseRef.current.rotZ;
        baseScaleRef.current = fitObject(model, targetSize);
        basePoseRef.current.posX = model.position.x;
        basePoseRef.current.posY = model.position.y;
        poseRef.current = {
          ...basePoseRef.current,
          scale: 1
        };
        renderedPoseRef.current = {
          ...basePoseRef.current,
          scale: 1
        };
      },
      undefined,
      (error) => {
        console.error("Failed to load watch model", error);
        if (disposed) {
          return;
        }

        setLoadError("Failed to load 3D model");
        const fallback = buildFallback(scene, targetSize);
        modelRef.current = fallback;
        fallback.rotation.x = basePoseRef.current.rotX;
        fallback.rotation.y = basePoseRef.current.rotY;
        fallback.rotation.z = basePoseRef.current.rotZ;
        baseScaleRef.current = 1;
        basePoseRef.current.posX = fallback.position.x;
        basePoseRef.current.posY = fallback.position.y;
        poseRef.current = {
          ...basePoseRef.current,
          scale: 1
        };
        renderedPoseRef.current = {
          ...basePoseRef.current,
          scale: 1
        };
      }
    );

    const resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(container);
    window.addEventListener("resize", updateSize);

    let frameId = 0;

    const animate = () => {
      if (disposed || !renderer) {
        return;
      }

      if (!isInView || !isPageVisible) {
        frameId = 0;
        return;
      }

      frameId = window.requestAnimationFrame(animate);

      const model = modelRef.current;
      const activeCamera = cameraRef.current;

      if (model && activeCamera) {
        if (!interactiveRef.current) {
          poseRef.current.rotY += autoRotateSpeed * 0.22;
        }

        const blend = interactiveRef.current ? 0.13 : 0.085;
        renderedPoseRef.current.rotX = THREE.MathUtils.lerp(
          renderedPoseRef.current.rotX,
          poseRef.current.rotX,
          blend
        );
        renderedPoseRef.current.rotY = THREE.MathUtils.lerp(
          renderedPoseRef.current.rotY,
          poseRef.current.rotY,
          blend
        );
        renderedPoseRef.current.rotZ = THREE.MathUtils.lerp(
          renderedPoseRef.current.rotZ,
          poseRef.current.rotZ,
          blend
        );
        renderedPoseRef.current.posX = THREE.MathUtils.lerp(
          renderedPoseRef.current.posX,
          poseRef.current.posX,
          blend
        );
        renderedPoseRef.current.posY = THREE.MathUtils.lerp(
          renderedPoseRef.current.posY,
          poseRef.current.posY,
          blend
        );
        renderedPoseRef.current.scale = THREE.MathUtils.lerp(
          renderedPoseRef.current.scale,
          poseRef.current.scale,
          blend
        );

        model.rotation.x = renderedPoseRef.current.rotX;
        model.rotation.y = renderedPoseRef.current.rotY;
        model.rotation.z = renderedPoseRef.current.rotZ;
        model.position.x = basePoseRef.current.posX + renderedPoseRef.current.posX;
        model.position.y = basePoseRef.current.posY + renderedPoseRef.current.posY;
        model.scale.setScalar(baseScaleRef.current * renderedPoseRef.current.scale);

        renderedCameraRef.current.x = THREE.MathUtils.lerp(
          renderedCameraRef.current.x,
          cameraPoseRef.current.x,
          0.11
        );
        renderedCameraRef.current.y = THREE.MathUtils.lerp(
          renderedCameraRef.current.y,
          cameraPoseRef.current.y,
          0.11
        );
        renderedCameraRef.current.z = THREE.MathUtils.lerp(
          renderedCameraRef.current.z,
          cameraPoseRef.current.z,
          0.11
        );

        activeCamera.position.set(
          renderedCameraRef.current.x,
          renderedCameraRef.current.y,
          renderedCameraRef.current.z
        );
        activeCamera.lookAt(0, 0, 0);
      }

      if (lightRefs.current.ambient) {
        renderedLightRef.current.ambient = THREE.MathUtils.lerp(
          renderedLightRef.current.ambient,
          lightIntensityRef.current.ambient,
          0.12
        );
        lightRefs.current.ambient.intensity = renderedLightRef.current.ambient;
      }
      if (lightRefs.current.key) {
        renderedLightRef.current.key = THREE.MathUtils.lerp(
          renderedLightRef.current.key,
          lightIntensityRef.current.key,
          0.12
        );
        lightRefs.current.key.intensity = renderedLightRef.current.key;
      }
      if (lightRefs.current.fill) {
        renderedLightRef.current.fill = THREE.MathUtils.lerp(
          renderedLightRef.current.fill,
          lightIntensityRef.current.fill,
          0.12
        );
        lightRefs.current.fill.intensity = renderedLightRef.current.fill;
      }
      if (lightRefs.current.ember) {
        renderedLightRef.current.ember = THREE.MathUtils.lerp(
          renderedLightRef.current.ember,
          lightIntensityRef.current.ember,
          0.12
        );
        lightRefs.current.ember.intensity = renderedLightRef.current.ember;
      }

      if (controlsRef.current) {
        controlsRef.current.enabled = interactiveRef.current;
        controlsRef.current.update();
      }

      renderer.render(scene, camera);
    };

    const stopAnimation = () => {
      if (frameId) {
        window.cancelAnimationFrame(frameId);
        frameId = 0;
      }
    };

    const startAnimation = () => {
      if (!frameId) {
        frameId = window.requestAnimationFrame(animate);
      }
    };

    const syncAnimationState = () => {
      if (disposed) {
        return;
      }

      if (isInView && isPageVisible) {
        startAnimation();
      } else {
        stopAnimation();
      }
    };

    const handleVisibilityChange = () => {
      isPageVisible = document.visibilityState !== "hidden";
      syncAnimationState();
    };

    intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        isInView = entry.isIntersecting;
        syncAnimationState();
      },
      {
        threshold: 0.12
      }
    );
    intersectionObserver.observe(container);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    syncAnimationState();

    return () => {
      disposed = true;
      stopAnimation();
      resizeObserver.disconnect();
      intersectionObserver?.disconnect();
      window.removeEventListener("resize", updateSize);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      controls.dispose();
      renderer?.dispose();

      scene.traverse((child) => {
        const mesh = child as THREE.Mesh;

        if (!mesh.isMesh) {
          return;
        }

        mesh.geometry?.dispose();
      });

      if (modelRef.current) {
        disposeObject(modelRef.current);
      }
    };
  }, [allowZoom, autoRotateSpeed, cameraZ, initialRotationY, prefersReducedMotion, targetSize]);

  const overlayMessage = prefersReducedMotion
    ? "3D preview paused to reduce motion"
    : loadError
      ? loadError
      : !isWebGLAvailable
        ? "3D preview unavailable on this device/browser"
        : null;

  return (
    <div ref={containerRef} className={`relative ${className ?? ""}`}>
      <canvas ref={canvasRef} className="h-full w-full" aria-label="Interactive 3D watch model" />
      {overlayMessage ? (
        <div className="absolute inset-0 flex items-center justify-center border border-white/10 bg-black/30 px-4 text-center text-sm text-white/80 backdrop-blur-sm">
          {overlayMessage}
        </div>
      ) : null}
    </div>
  );
});
