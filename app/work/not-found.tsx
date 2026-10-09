import { ContentNotFound } from "@/components/content/content-not-found";

const WorkNotFound = () => (
  <ContentNotFound
    backHref="/work"
    backLabel="All work"
    description="This project does not exist or was renamed. The archive lists every case study."
    title="Project not found"
  />
);

export default WorkNotFound;
