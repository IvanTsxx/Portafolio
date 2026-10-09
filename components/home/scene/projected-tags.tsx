"use client";

import { useFrame } from "@react-three/fiber";
import { Vector3 } from "three";

import type {
  ProjectedTag,
  TagAnchors,
  TagElements,
} from "@/components/home/scene/tag-anchors";

const projectionScratch = new Vector3();

export const TagProjector = ({
  anchors,
  elements,
  lift,
}: {
  anchors: TagAnchors;
  elements: TagElements;
  lift: number;
}) => {
  useFrame(({ camera, size }) => {
    for (const [id, anchor] of anchors.current) {
      const element = elements.current.get(id);
      if (!element) {
        continue;
      }
      const point = anchor.getWorldPosition(projectionScratch);
      point.y += lift;
      point.project(camera);
      const x = (point.x * 0.5 + 0.5) * size.width;
      const y = (-point.y * 0.5 + 0.5) * size.height;
      element.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, -50%)`;
    }
  });

  return null;
};

export const TagLayer = ({
  tags,
  elements,
}: {
  tags: readonly ProjectedTag[];
  elements: TagElements;
}) => (
  <div
    aria-hidden
    className="pointer-events-none absolute inset-0 overflow-hidden"
  >
    {tags.map((tag) => (
      <span
        className="label border-rule-strong bg-background/80 text-muted-foreground ease-out-quart absolute top-0 left-0 border px-1.5 whitespace-nowrap opacity-0 transition-opacity duration-300 select-none data-[visible=true]:opacity-100"
        data-visible={tag.visible}
        key={tag.id}
        ref={(element) => {
          if (element) {
            elements.current.set(tag.id, element);
          } else {
            elements.current.delete(tag.id);
          }
        }}
      >
        {tag.label}
      </span>
    ))}
  </div>
);
