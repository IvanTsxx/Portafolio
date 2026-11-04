import "react";

declare module "react" {
  interface CSSProperties {
    "--guide-near"?: number;
    "--guide-x"?: string;
    "--guide-y"?: string;
  }
}
