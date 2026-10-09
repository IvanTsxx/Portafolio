import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { RegistryItemDocs } from "@/lib/registry/schema";

const headCellClassName = "label text-muted-foreground h-11 px-4";
const cellClassName = "px-4 py-3 align-top whitespace-normal";

const Frame = ({ children }: { children: React.ReactNode }) => (
  <div className="border-rule bg-card border">{children}</div>
);

const Mono = ({ children }: { children: React.ReactNode }) => (
  <code className="text-foreground font-mono text-xs">{children}</code>
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
          <h3 className="font-mono text-sm">{`<${group.component}>`}</h3>
          {group.description ? (
            <p className="text-muted-foreground max-w-prose text-sm text-pretty">
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
                      <span className="label text-clay ml-2">Required</span>
                    ) : null}
                  </TableCell>
                  <TableCell className={`${cellClassName} min-w-48`}>
                    <code className="text-muted-foreground font-mono text-xs">
                      {prop.type}
                    </code>
                  </TableCell>
                  <TableCell className={cellClassName}>
                    {prop.default ? (
                      <Mono>{prop.default}</Mono>
                    ) : (
                      <span className="text-muted-foreground">None</span>
                    )}
                  </TableCell>
                  <TableCell
                    className={`${cellClassName} text-muted-foreground min-w-64 text-sm text-pretty`}
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

export const VariantsTable = ({
  variants,
}: {
  variants: RegistryItemDocs["variants"];
}) => (
  <Frame>
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className={headCellClassName}>Variant</TableHead>
          <TableHead className={headCellClassName}>Options</TableHead>
          <TableHead className={headCellClassName}>Default</TableHead>
          <TableHead className={headCellClassName}>Behavior</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {variants.map((variant) => (
          <TableRow key={variant.name}>
            <TableCell className={cellClassName}>
              <Mono>{variant.name}</Mono>
            </TableCell>
            <TableCell className={`${cellClassName} min-w-48`}>
              <ul className="flex flex-wrap gap-1">
                {variant.options.map((option) => (
                  <li
                    className="border-rule text-muted-foreground border px-1.5 py-0.5 font-mono text-xs"
                    key={option}
                  >
                    {option}
                  </li>
                ))}
              </ul>
            </TableCell>
            <TableCell className={cellClassName}>
              <Mono>{variant.default}</Mono>
            </TableCell>
            <TableCell
              className={`${cellClassName} text-muted-foreground min-w-64 text-sm text-pretty`}
            >
              {variant.description}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </Frame>
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
          <TableHead className={headCellClassName}>Properties</TableHead>
          <TableHead className={headCellClassName}>Timing</TableHead>
          <TableHead className={headCellClassName}>Trigger</TableHead>
          <TableHead className={headCellClassName}>Reduced motion</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {animations.map((animation) => (
          <TableRow key={animation.target}>
            <TableCell className={`${cellClassName} text-foreground text-sm`}>
              {animation.target}
            </TableCell>
            {[
              animation.properties,
              animation.timing,
              animation.trigger,
              animation.reducedMotion,
            ].map((value) => (
              <TableCell
                className={`${cellClassName} text-muted-foreground min-w-48 text-sm text-pretty`}
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
