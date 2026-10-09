"use client";

import { useRef } from "react";
import type { RefObject } from "react";
import type { Object3D } from "three";

export interface ProjectedTag {
  id: string;
  label: string;
  visible: boolean;
}

export type TagElements = RefObject<Map<string, HTMLSpanElement>>;
export type TagAnchors = RefObject<Map<string, Object3D>>;

export const useTagElements = (): TagElements =>
  useRef(new Map<string, HTMLSpanElement>());

export const useTagAnchors = (): TagAnchors =>
  useRef(new Map<string, Object3D>());

export const anchorRef =
  (anchors: TagAnchors, id: string) => (object: Object3D | null) => {
    if (object) {
      anchors.current.set(id, object);
    } else {
      anchors.current.delete(id);
    }
  };
