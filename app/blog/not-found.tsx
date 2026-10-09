import { ContentNotFound } from "@/components/content/content-not-found";

const BlogNotFound = () => (
  <ContentNotFound
    backHref="/blog"
    backLabel="All field notes"
    description="This note does not exist or was renamed. The index lists every note."
    title="Note not found"
  />
);

export default BlogNotFound;
