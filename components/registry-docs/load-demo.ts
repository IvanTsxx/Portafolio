import type { ComponentType } from "react";

export interface DemoModule {
  Demo: ComponentType;
  Thumbnail: ComponentType;
}

export interface ExampleModule {
  Example: ComponentType;
}

const examplesPrefix = "registry/ivan/examples/";

export const loadDemoModule = (name: string): Promise<DemoModule> =>
  import(`./demos/${name}`);

export const loadExampleModule = (file: string): Promise<ExampleModule> => {
  const relativePath = file.slice(examplesPrefix.length).replace(/\.tsx$/u, "");
  return import(`../../registry/ivan/examples/${relativePath}`);
};
