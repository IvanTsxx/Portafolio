"use client";
import type { HTMLAttributes } from "react";
import { type LinkItemType, useLinkItemActive } from "../link-item";
import type * as Base from "./base";

type InternalComponents = Pick<
  typeof Base,
  | "SidebarFolder"
  | "SidebarFolderLink"
  | "SidebarFolderContent"
  | "SidebarFolderTrigger"
  | "SidebarItem"
>;

export function createLinkItemRenderer({
  SidebarFolder,
  SidebarFolderContent,
  SidebarFolderLink,
  SidebarFolderTrigger,
  SidebarItem,
}: InternalComponents) {
  /**
   * Render sidebar items from page tree
   */
  return function SidebarLinkItem({
    item,
    ...props
  }: HTMLAttributes<HTMLElement> & {
    item: Exclude<LinkItemType, { type: "icon" }>;
  }) {
    const active = useLinkItemActive(item);
    if (item.type === "custom") {
      return <div {...props}>{item.children}</div>;
    }

    if (item.type === "menu") {
      return (
        <SidebarFolder {...props}>
          {item.url ? (
            <SidebarFolderLink
              active={active}
              external={item.external}
              href={item.url}
            >
              {item.icon}
              {item.text}
            </SidebarFolderLink>
          ) : (
            <SidebarFolderTrigger>
              {item.icon}
              {item.text}
            </SidebarFolderTrigger>
          )}
          <SidebarFolderContent>
            {item.items.map((child, i) => (
              <SidebarLinkItem item={child} key={i} />
            ))}
          </SidebarFolderContent>
        </SidebarFolder>
      );
    }

    return (
      <SidebarItem
        active={active}
        external={item.external}
        href={item.url}
        icon={item.icon}
        {...props}
      >
        {item.text}
      </SidebarItem>
    );
  };
}
