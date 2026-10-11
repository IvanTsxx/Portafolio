import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { RegistryItemDocs } from "@/lib/registry/schema";

const headCellClassName =
  "label bg-paper-deep text-graphite border-rule-strong h-11 border-b px-4 font-normal";
const cellClassName = "px-4 py-3 align-top whitespace-normal";

const Frame = ({ children }: { children: React.ReactNode }) => (
  <div className="border-rule-strong bg-popover border">{children}</div>
);

const Mono = ({ children }: { children: React.ReactNode }) => (
  <code className="text-ink font-mono text-xs">{children}</code>
);

export const PropsTables = ({
  groups,
}: {
  groups: RegistryItemDocs["props"];
}) => (
  <div className="flex flex-col gap-10">
    {groups.map((group) => (
      <div className="flex flex-col gap-3" key={group.component}>
        <div className="flex flex-col gap-1">
          <h3 className="text-ink font-mono text-sm">{`<${group.component}>`}</h3>
          {group.description ? (
            <p className="text-graphite max-w-prose text-sm text-pretty">
              {group.description}
            </p>
          ) : null}
        </div>
        <Frame>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className={headCellClassName}>Prop</TableHead>
                <TableHead className={headCellClassName}>Type</TableHead>
                <TableHead className={headCellClassName}>Default</TableHead>
                <TableHead className={headCellClassName}>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {group.props.map((prop) => (
                <TableRow key={prop.name}>
                  <TableCell className={cellClassName}>
                    <Mono>{prop.name}</Mono>
                    {prop.required ? (
                      <span className="label text-ink border-ink ml-2 border px-1">
                        Req
                      </span>
                    ) : null}
                  </TableCell>
                  <TableCell className={`${cellClassName} min-w-48`}>
                    <code className="text-graphite font-mono text-xs">
                      {prop.type}
                    </code>
                  </TableCell>
                  <TableCell className={cellClassName}>
                    {prop.default ? (
                      <Mono>{prop.default}</Mono>
                    ) : (
                      <span className="text-graphite">None</span>
                    )}
                  </TableCell>
                  <TableCell
                    className={`${cellClassName} text-graphite min-w-64 text-sm text-pretty`}
                  >
                    {prop.description}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Frame>
      </div>
    ))}
  </div>
);

export const AnimationTable = ({
  animations,
}: {
  animations: RegistryItemDocs["animation"];
}) => (
  <Frame>
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className={headCellClassName}>Target</TableHead>
          <TableHead className={headCellClassName}>Timing</TableHead>
          <TableHead className={headCellClassName}>Reduced motion</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {animations.map((animation) => (
          <TableRow key={animation.target}>
            <TableCell className={`${cellClassName} text-ink text-sm`}>
              {animation.target}
            </TableCell>
            {[animation.timing, animation.reducedMotion].map((value) => (
              <TableCell
                className={`${cellClassName} text-graphite min-w-48 text-sm text-pretty`}
                key={value}
              >
                {value}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </Frame>
);
