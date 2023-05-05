import { VRM, VRMLoaderPlugin } from "@pixiv/three-vrm";
import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { useMediaDeviceSelect } from "@livekit/components-react";
import { createLocalVideoTrack } from "livekit-client";
import { Holistic } from "@mediapipe/holistic";
import useResizeObserver from "use-resize-observer";
import { Vector3 } from "three";
import { animateVRM } from "./rigging";

type Props = {
  onCanvasStreamChanged: (canvasStream: MediaStream | null) => void;
};

export const LocalVideoView = ({ onCanvasStreamChanged }: Props) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const resizeRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const clockRef = useRef(new THREE.Clock());
  const vrmRef = useRef<VRM | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const canvasStreamRef = useRef<MediaStream | null>(null);
  const loader = useRef(new GLTFLoader());
  const holistic = useRef(
    new Holistic({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/holistic@0.5.1675471629/${file}`;
      },
    })
  );
  const size = useResizeObserver({ ref: resizeRef });

  const inferenceLoop = useRef(async () => {
    try {
      await holistic.current.send({ image: videoRef.current! });
    } catch (e) {
      console.error("Error in holistic:", e);
      // Reset holistic
      holistic.current = new Holistic({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/holistic@0.5.1675471629/${file}`;
        },
      });
      setupHolistic.current();
    }
    setTimeout(inferenceLoop.current, 1000 / 30);
  });

  const animate = useRef(() => {
    requestAnimationFrame(animate.current);
    if (vrmRef.current) {
      vrmRef.current.update(clockRef.current.getDelta());
    }
    rendererRef.current?.render(sceneRef.current!, cameraRef.current!);
  });

  const setupThreeJS = useCallback(() => {
    if (!canvasRef.current) return; // Shouldn't ever happen
    if (sceneRef.current) return; // Already setup
    if (!size.width || !size.height) return;

    loader.current.register((parser) => {
      return new VRMLoaderPlugin(parser);
    });

    sceneRef.current = new THREE.Scene();
    rendererRef.current = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
    });
    cameraRef.current = new THREE.PerspectiveCamera(
      45,
      size.width / size.height,
      0.1,
      1000
    );
    cameraRef.current.position.z = 1;
    cameraRef.current.position.y = 1;
    cameraRef.current.rotation.set(0.0, 0, 0.0);
    const light = new THREE.AmbientLight(0xffffff); // soft white light
    sceneRef.current.add(light);

    loader.current.load("/characters/model.vrm", (gltf) => {
      const vrm = gltf.userData.vrm as VRM;
      vrmRef.current = vrm;
      sceneRef.current?.add(vrm.scene);
      const target: Vector3 = new THREE.Vector3(0, 0, 0);
      vrm.humanoid.humanBones.head.node.getWorldPosition(target);
      cameraRef.current!.position.y = target.y;
      var bgTexture = new THREE.TextureLoader().load("bg.jpeg");
      var material = new THREE.SpriteMaterial({
        map: bgTexture,
        color: 0xffffff,
      });
      var sprite = new THREE.Sprite(material);
      sprite.scale.set(10, 7, 7);
      sprite.position.set(0, 1, -5);
      sceneRef.current?.add(sprite);
    });
  }, [size.height, size.width]);

  useEffect(() => {
    createLocalVideoTrack({
      facingMode: "environment",
      resolution: { width: 640, height: 320, frameRate: 15 },
    }).then((t) => {
      t.attach(videoRef.current!);
      setupHolistic.current();
      inferenceLoop.current();
      animate.current();
    });
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;
    if (!cameraRef.current) return;
    if (!size.width || !size.height) return;
    canvasRef.current.width = size.width + 1; // prevent pixel line on right
    canvasRef.current.height = size.height;
    rendererRef.current?.setSize(size.width, size.height);
    cameraRef.current.aspect = size.width / size.height;
    cameraRef.current.updateProjectionMatrix();
  }, [size, size.height, size.width]);

  useEffect(() => {
    if (!canvasRef.current) return;
    if (canvasStreamRef.current) return;
    canvasStreamRef.current = canvasRef.current.captureStream(60);
    onCanvasStreamChanged(canvasStreamRef.current);
  }, [onCanvasStreamChanged]);

  const setupHolistic = useRef(() => {
    holistic.current.setOptions({
      refineFaceLandmarks: true,
    });
    holistic.current.onResults((results) => {
      if (!vrmRef.current) return;
      animateVRM(vrmRef.current, results, videoRef.current);
    });
  });

  useEffect(setupThreeJS, [setupThreeJS]);

  return (
    <div className="relative h-full w-full">
      <div className="overflow-hidden h-full" ref={resizeRef}>
        <canvas
          width={size.width}
          height={size.height}
          className="h-full w-full"
          ref={canvasRef}
        />
      </div>
      <div className="absolute w-[100px] h-[100px] bottom-2 right-2 overflow-hidden">
        <video className="h-full w-full" ref={videoRef} />
      </div>
    </div>
  );
};
