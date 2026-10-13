export const labTopics = [
  "3D",
  "Motion",
  "WebGL",
  "GSAP",
  "CSS",
  "Shader",
  "Typography",
  "UI",
  "AI",
  "Image",
] as const;

export type LabTopic = (typeof labTopics)[number];

export const topicParam = (topic: LabTopic) => topic.toLowerCase();

export const parseTopicParam = (value: string | null): LabTopic | null =>
  labTopics.find((topic) => topicParam(topic) === value) ?? null;
