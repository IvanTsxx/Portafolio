"use client";

import { Environment } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import type { Texture, WebGLRenderer } from "three";
import { PMREMGenerator } from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

const environments = new WeakMap<WebGLRenderer, Texture>();

const sharedEnvironment = (gl: WebGLRenderer) => {
  const cached = environments.get(gl);
  if (cached) {
    return cached;
  }
  const generator = new PMREMGenerator(gl);
  const room = new RoomEnvironment();
  const { texture } = generator.fromScene(room, 0.04);
  room.dispose();
  generator.dispose();
  environments.set(gl, texture);
  return texture;
};

export const ViewLights = () => {
  const gl = useThree((state) => state.gl);

  return (
    <>
      <Environment environmentIntensity={0.38} map={sharedEnvironment(gl)} />
      <hemisphereLight args={["#fffaf3", "#cfc8bd", 1.25]} />
      <directionalLight
        color="#fff3e6"
        intensity={2.1}
        position={[-3.5, 6, 6]}
      />
      <directionalLight
        color="#e8eef7"
        intensity={0.7}
        position={[5, 2.5, 3]}
      />
      <directionalLight color="#ffffff" intensity={0.9} position={[2, 4, -6]} />
    </>
  );
};
