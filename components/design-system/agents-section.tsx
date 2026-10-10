import { DocumentSection } from "@/components/site/document-section";
import {
  agentActionNames,
  agentContract,
  agentReactionNames,
  agentRoleSpecs,
  agentSceneSpecs,
} from "@/lib/design-system/agents";
import { sectionById } from "@/lib/design-system/sections";
import { AgentPoster } from "@/registry/ivan/components/agent-stage/agent-poster";

import { SceneStage } from "./scene-stage";
import { ClassTag, SubHeading, padCount } from "./spec-frame";

const RolesTable = () => (
  <table className="label w-full border-collapse">
    <caption className="sr-only">Agent roles</caption>
    <thead>
      <tr className="text-mist text-left">
        <th className="pb-2 font-normal" scope="col">
          <span className="sr-only">Poster</span>
        </th>
        <th className="pb-2 font-normal" scope="col">
          Code
        </th>
        <th className="pb-2 font-normal" scope="col">
          Role
        </th>
        <th className="hidden pb-2 font-normal md:table-cell" scope="col">
          Kit
        </th>
        <th
          className="hidden pb-2 text-right font-normal sm:table-cell"
          scope="col"
        >
          Signature actions
        </th>
      </tr>
    </thead>
    <tbody>
      {agentRoleSpecs.map((profile) => (
        <tr className="border-rule border-t" key={profile.role}>
          <td className="w-16 py-2 pr-3">
            <AgentPoster className="size-14" role={profile.role} />
          </td>
          <td className="text-mist py-2 pr-3 tabular-nums">
            {profile.designation}
          </td>
          <td className="text-ink py-2 pr-3">{profile.title}</td>
          <td className="text-graphite hidden py-2 pr-3 normal-case md:table-cell">
            {profile.kit.join(", ")}
          </td>
          <td className="text-graphite hidden py-2 text-right normal-case sm:table-cell">
            {profile.signatureActions.join(" · ")}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

const NameList = ({ names }: { names: readonly string[] }) => (
  <ul className="flex flex-wrap gap-2">
    {names.map((name) => (
      <li key={name}>
        <ClassTag>{name}</ClassTag>
      </li>
    ))}
  </ul>
);

export const AgentsSection = () => {
  const section = sectionById("agents");
  return (
    <DocumentSection
      aside={`${padCount(agentRoleSpecs.length)} roles`}
      id={section.id}
      index={section.index}
      jp={section.jp}
      label={section.label}
    >
      <div className="flex flex-col gap-3">
        <SubHeading
          aside={padCount(agentRoleSpecs.length)}
          jp="役割"
          label="Roles"
        />
        <RolesTable />
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="flex flex-col gap-3">
          <SubHeading
            aside={padCount(agentActionNames.length)}
            jp="動作"
            label="Actions"
          />
          <NameList names={agentActionNames} />
        </div>
        <div className="flex flex-col gap-3">
          <SubHeading
            aside={padCount(agentReactionNames.length)}
            jp="反応"
            label="Hover reactions"
          />
          <NameList names={agentReactionNames} />
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <SubHeading
          aside={padCount(agentSceneSpecs.length)}
          jp="場面"
          label="Scenes"
        />
        <SceneStage scenes={agentSceneSpecs} />
      </div>
      <div className="flex flex-col gap-3">
        <SubHeading jp="規約" label="Contract" />
        <ol className="border-rule border-t">
          {agentContract.map((rule, index) => (
            <li
              className="label border-rule flex items-baseline gap-3 border-b py-2"
              key={rule}
            >
              <span className="text-mist tabular-nums">
                C-{padCount(index + 1)}
              </span>
              <span className="text-graphite normal-case">{rule}</span>
            </li>
          ))}
        </ol>
      </div>
    </DocumentSection>
  );
};
