import { iconMarks, renderIconMark } from "@/lib/site/icon-mark";

export const size = { height: iconMarks.tab.size, width: iconMarks.tab.size };
export const contentType = "image/png";

const Icon = () => renderIconMark("tab");

export default Icon;
