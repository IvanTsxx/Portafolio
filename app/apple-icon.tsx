import { iconMarks, renderIconMark } from "@/lib/site/icon-mark";

export const size = {
  height: iconMarks.touch.size,
  width: iconMarks.touch.size,
};
export const contentType = "image/png";

const AppleIcon = () => renderIconMark("touch");

export default AppleIcon;
