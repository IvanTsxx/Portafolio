import { renderIconMark, touchIconSize } from "@/lib/site/icon-mark";

export const size = { height: touchIconSize, width: touchIconSize };
export const contentType = "image/png";

const AppleIcon = () => renderIconMark("touch", touchIconSize);

export default AppleIcon;
