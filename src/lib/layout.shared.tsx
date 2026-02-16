import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import { FileDown } from "lucide-react";
import { ArgIcon } from "@/components/icons";
import { buttonVariants } from "@/components/ui/button";

// fill this with your actual GitHub info, for example:
export const gitConfig = {
  user: "IvanTsxx",
};

export function baseOptions(): BaseLayoutProps {
  return {
    links: [
      {
        type: "custom",
        children: (
          <button
            type="button"
            className={buttonVariants({
              color: "outline",
              size: "sm",
              className:
                "gap-2 [&_svg]:size-3.5 [&_svg]:text-fd-muted-foreground",
            })}
          >
            <a
              aria-label="Descargar CV"
              className="flex items-center gap-2"
              download
              href="/cv.pdf"
              title="Descargar CV"
            >
              <FileDown className="h-4 w-4" />
              Descargar CV
            </a>
          </button>
        ),
        secondary: true,
      },
    ],
    nav: {
      title: (
        <span className="flex items-start gap-2">
          <img
            alt="IB"
            className="h-7 w-7 rounded-lg object-cover ring-1 ring-brand/20"
            height={28}
            src="/avatar.webp"
            width={28}
          />
          <div className="flex flex-col">
            <span className="font-semibold">Iván Bongiovanni</span>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <ArgIcon className="h-4 w-4" />
              Argentina, Tucumán
            </div>
          </div>
        </span>
      ),
    },
    githubUrl: `https://github.com/${gitConfig.user}`,
  };
}
