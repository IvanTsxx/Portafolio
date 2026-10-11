import { ContentNotFound } from "@/components/content/content-not-found";

const NotesNotFound = () => (
  <ContentNotFound
    backHref="/notes"
    backLabel="All notes"
    description="This note does not exist."
    title="Note not found"
  />
);

export default NotesNotFound;
