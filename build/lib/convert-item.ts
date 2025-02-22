/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { PredicateStatement, sluggify, StatementValidator } from "./helpers.ts";

const categories = {
  "a-e": ["a", "b", "c", "d", "e"],
  "f-j": ["f", "g", "h", "i", "j"],
  "k-o": ["k", "l", "m", "n", "o"],
  "p-t": ["p", "q", "r", "s", "t"],
  "u-z": ["u", "v", "w", "x", "y", "z"],
};

function capitalize(input: string): string {
  if (!input?.length) return input;
  return input.charAt(0).toUpperCase() + input.slice(1);
}

function formatSlug(slug: Maybe<string>) {
  return capitalize(slug!)?.replaceAll("-", " ");
}

function getCategory(title: string): keyof typeof categories {
  const firstLetter = title.toLowerCase()[0];
  if (firstLetter >= "a" && firstLetter <= "e") return "a-e";
  if (firstLetter >= "f" && firstLetter <= "j") return "f-j";
  if (firstLetter >= "k" && firstLetter <= "o") return "k-o";
  if (firstLetter >= "p" && firstLetter <= "t") return "p-t";
  if (firstLetter >= "u" && firstLetter <= "z") return "u-z";
  return "a-e";
}

function getMarkdownPath({
  type,
  subtype,
  category,
  title,
  extension = true,
}: {
  type: "abilities" | "effects" | "items" | "moves" | "perks" | "species" | "traits" | "lists";
  subtype?: "consumables" | "equipment" | "gear" | "weapons" | "tutor";
  category?: keyof typeof categories;
  title: string;
  extension?: boolean;
}): string {
  const path = `data/${type}/${subtype ? `${subtype}/` : ""}${category ? `${category}/` : ""}${sluggify(title)}${extension ? ".md" : ""
    }`;
  return path;
}

function traitsToTags(traits: string[], actions: any[]): string {
  if (!traits) {
    if (actions?.length > 0) {
      if (actions[0].traits?.length > 0) {
        return actions[0].traits
          .map((t: string) => t.trim())
          .filter((s: string) => s)
          .join(", ");
      }
    }
    return "";
  }
  return traits
    .map((t) => t.trim())
    .filter((s) => s)
    .join(", ");
}

function traitsToTraitsList(traits: string[], actions: any[]): string {
  if (!traits || traits.length === 0) {
    if (actions?.length > 0) {
      if (actions[0].traits?.length > 0) {
        traits = actions[0].traits;
      }
      else return "";
    }
    else return "";
  }
  return traits
    .map(t => t.trim())
    .filter(s => s)
    .map(t => `- [${formatSlug(t)}](https://2e.ptr.wiki/${getMarkdownPath({
      type: "traits",
      category: getCategory(t),
      title: t,
      extension: false
    })})`)
    .join("\n");
}

function replaceAtLinks(entireMessage: string): string {
  if (!entireMessage) return "";

  if (entireMessage.match(TraitEnricher)) {
    entireMessage = entireMessage.replace(TraitEnricher, (_match, _type, slug, _, label) => {
      return `[${label ?? formatSlug(slug)}](https://2e.ptr.wiki/${getMarkdownPath({
        type: "traits",
        category: getCategory(slug),
        title: slug,
        extension: false
      })})`;
    });
  }

  if (entireMessage.match(AfflictionEnricher)) {
    entireMessage = entireMessage.replace(AfflictionEnricher, (_match, _type, slug, _, label) => {
      // return `[${label ?? formatSlug(slug)}](https://2e.ptr.wiki/${getMarkdownPath({
      //   type: "effects",
      //   category: getCategory(slug),
      //   title: slug,
      //   extension: false
      // })})`;
      return label ?? formatSlug(slug);
    });
  }

  return entireMessage;
}

const TraitEnricher = /@(?<type>Trait)\[(?<slug>[-a-z]+)(\s+)?](?:{(?<label>[^}]+)})?/gi;
const AfflictionEnricher = /@(?<type>Affliction)\[(?<slug>[-a-z]+)(\s+)?](?:{(?<label>[^}]+)})?/gi;

function actionsToActionsStrings(actions: any[]): string[] {
  return (
    actions
      ?.map((action: any) =>
        action
          ? `### ${action.name}\n- **Type**: ${formatSlug(action.type)}\n${action.types ? `- **Types**: ${action.types}\n` : ""
          }${action.category ? `- **Category**: ${action.category}\n` : ""}${action.power ? `- **Power**: ${action.power}\n` : ""
          }${action.accuracy ? `- **Accuracy**: ${action.accuracy}\n` : ""}${action.range?.target ? `- **Target**: ${action.range.target}\n` : ""
          }${action.range?.distance
            ? `- **Range Increment**: ${action.range.distance}m\n`
            : ""
          }${action.cost?.activation
            ? `- **Action Cost**: ${action.cost.activation}\n`
            : ""
          }${action.cost?.powerPoints
            ? `- **PP Cost**: ${action.cost.powerPoints}\n`
            : ""
          }\n### Effect\n${action.description}`
          : ""
      )
      .filter((a: string) => a) ?? []
  );
}

function abilityToMarkdown(ability: any): MarkdownResult {
  const path = getMarkdownPath({
    type: "abilities",
    category: getCategory(ability.name),
    title: ability.name,
  });
  const metadata: MetaData = {
    title: formatSlug(ability.name),
    description: `An auto-generated markdown file for the ${ability.name} ability.`,
    published: "true",
    editor: "markdown",
    tags: traitsToTags(ability.system.traits, ability.system.actions),
  };

  const actionStrings = actionsToActionsStrings(ability.system.actions);
  const traitsString = traitsToTraitsList(ability.system.traits, ability.system.actions);

  return {
    metadata,
    markdown: `\n\n${traitsString ? `### Traits\n${traitsString}\n\n` : ""}### Effect\n${ability.system.description}${actionStrings.length > 0 ? `\n\n## Ability Actions\n${actionStrings.join("\n\n\n")}` : ""
      }`,
    path,
  };
}

function consumableToMarkdown(consumable: any): MarkdownResult | null {
  const path = getMarkdownPath({
    type: "items",
    subtype: "consumables",
    category: getCategory(consumable.name),
    title: consumable.name,
  });
  const metadata: MetaData = {
    title: formatSlug(consumable.name),
    description: `An auto-generated markdown file for the ${consumable.name} consumable item.`,
    published: "true",
    editor: "markdown",
    tags: traitsToTags(consumable.system.traits, consumable.system.actions),
  };

  const actionStrings = actionsToActionsStrings(consumable.system.actions);
  const flingString = `\n### Fling\n- **Power**: ${consumable.system.fling.power}\n- **Accuracy**: ${consumable.system.fling.accuracy}\n- **Type**: ${consumable.system.fling.type}`;
  const craftingString =
    consumable.system.crafting?.skill && consumable.system.crafting.spans
      ? `\n### Crafting\n- **Skill**: ${consumable.system.crafting.skill}\n- **Time**: ${consumable.system.crafting.spans} spans\n- **Materials**: ${consumable.system.crafting.materials}`
      : "";
  const traitsString = traitsToTraitsList(consumable.system.traits, consumable.system.actions);

  return {
    metadata,
    markdown: `- **Grade**: ${consumable.system.grade}\n- **Rarity**: ${consumable.system.rarity
      }\n- **IP Cost**: ${consumable.system.cost}\n${flingString}\n${craftingString ? `${craftingString}\n` : ""
      }\n${traitsString ? `### Traits\n${traitsString}\n\n` : ""}### Description\n${consumable.system.description}${actionStrings.length > 0
        ? `\n\n## Consumable Actions\n${actionStrings.join("\n\n\n")}`
        : ""
      }`,
    path,
  };
}

function effectToMarkdown(_effect: any): MarkdownResult | null {
  return null;
}

function equipmentToMarkdown(equipment: any): MarkdownResult {
  const path = getMarkdownPath({
    type: "items",
    subtype: "equipment",
    category: getCategory(equipment.name),
    title: equipment.name,
  });
  const metadata: MetaData = {
    title: formatSlug(equipment.name),
    description: `An auto-generated markdown file for the ${equipment.name} equipment item.`,
    published: "true",
    editor: "markdown",
    tags: traitsToTags(equipment.system.traits, equipment.system.actions),
  };

  const actionStrings = actionsToActionsStrings(equipment.system.actions);
  const flingString = `\n### Fling\n- **Power**: ${equipment.system.fling.power}\n- **Accuracy**: ${equipment.system.fling.accuracy}\n- **Type**: ${equipment.system.fling.type}`;
  const craftingString =
    equipment.system.crafting?.skill && equipment.system.crafting.spans
      ? `\n### Crafting\n- **Skill**: ${equipment.system.crafting.skill}\n- **Time**: ${equipment.system.crafting.spans} spans\n- **Materials**: ${equipment.system.crafting.materials}`
      : "";
  const traitsString = traitsToTraitsList(equipment.system.traits, equipment.system.actions);

  return {
    metadata,
    markdown: `- **Grade**: ${equipment.system.grade}\n- **Rarity**: ${equipment.system.rarity
      }\n${flingString}\n${craftingString ? `${craftingString}\n` : ""}\n${traitsString ? `### Traits\n${traitsString}\n\n` : ""}### Description\n${equipment.system.description
      }${actionStrings.length > 0
        ? `\n\n## Equipment Actions\n${actionStrings.join("\n\n\n")}`
        : ""
      }`,
    path,
  };
}

function gearToMarkdown(gear: any): MarkdownResult {
  const path = getMarkdownPath({
    type: "items",
    subtype: "gear",
    category: getCategory(gear.name),
    title: gear.name,
  });
  const metadata: MetaData = {
    title: formatSlug(gear.name),
    description: `An auto-generated markdown file for the ${gear.name} gear item.`,
    published: "true",
    editor: "markdown",
    tags: traitsToTags(gear.system.traits, gear.system.actions),
  };

  const actionStrings = actionsToActionsStrings(gear.system.actions);
  const flingString = `\n### Fling\n- **Power**: ${gear.system.fling.power}\n- **Accuracy**: ${gear.system.fling.accuracy}\n- **Type**: ${gear.system.fling.type}`;
  const craftingString =
    gear.system.crafting?.skill && gear.system.crafting.spans
      ? `\n### Crafting\n- **Skill**: ${gear.system.crafting.skill}\n- **Time**: ${gear.system.crafting.spans} spans\n- **Materials**: ${gear.system.crafting.materials}`
      : "";
  const traitsString = traitsToTraitsList(gear.system.traits, gear.system.actions);

  return {
    metadata,
    markdown: `- **Grade**: ${gear.system.grade}\n- **Rarity**: ${gear.system.rarity
      }\n${flingString}\n${craftingString ? `${craftingString}\n` : ""}\n${traitsString ? `### Traits\n${traitsString}\n\n` : ""}### Description\n${gear.system.description
      }${actionStrings.length > 0 ? `\n\n## Gear Actions\n${actionStrings.join("\n\n\n")}` : ""}`,
    path,
  };
}

function moveToMarkdown(move: any): MarkdownResult | null {
  const path = getMarkdownPath({
    type: "moves",
    category: getCategory(move.name),
    title: move.name,
  });
  const metadata: MetaData = {
    title: formatSlug(move.name),
    description: `An auto-generated markdown file for the ${move.name} move.`,
    published: "true",
    editor: "markdown",
    tags: traitsToTags(move.system.traits, move.system.actions),
  };

  const action = move.system.actions[0];
  if (!action) return null;

  const actions = move.system.actions.slice(1);
  const actionStrings = actions
    .map((action: any) =>
      action
        ? `### ${action.name}\n\n- **Type**: ${formatSlug(action.type)}\n${action.types ? `- **Types**: ${action.types}\n` : ""
        }${action.category ? `- **Category**: ${action.category}\n` : ""}${action.power ? `- **Power**: ${action.power}\n` : ""
        }${action.accuracy ? `- **Accuracy**: ${action.accuracy}\n` : ""}${action.range?.target ? `- **Target**: ${action.range.target}\n` : ""
        }${action.range?.distance
          ? `- **Range Increment**: ${action.range.distance}m\n`
          : ""
        }${action.cost?.activation
          ? `- **Action Cost**: ${action.cost.activation}\n`
          : ""
        }${action.cost?.powerPoints ? `- **PP Cost**: ${action.cost.powerPoints}\n` : ""
        }\n\n#### Effect\n${action.description}`
        : ""
    )
    .filter((a: string) => a);

  const traitsString = traitsToTraitsList(move.system.traits, move.system.actions);

  return {
    metadata,
    markdown: `${action.types !== undefined ? `- **Types**: ${action.types}\n` : ''}${action.category !== undefined ? `- **Category**: ${action.category}\n` : ''}${action.power !== undefined ? `- **Power**: ${action.power
      }\n` : ''}${action.accuracy !== undefined ? `- **Accuracy**: ${action.accuracy}\n` : ''}- **Target**: ${action.range.target
      }\n${action.range.distance ? `- **Range Increment**: ${action.range.distance}m\n` : ''}- **Action Cost**: ${action.cost.activation
      }\n- **PP Cost**: ${action.cost.powerPoints}\n- **Grade**: ${move.system.grade}\n\n${traitsString ? `### Traits\n${traitsString}\n\n` : ""}### Effect\n${action.description}${actionStrings.length > 0 ? `\n\n## Other Move Actions\n${actionStrings.join("\n\n")}` : ""
      }`,
    path,
  };
}

function getPredicateStrings(prerequisites: PredicateStatement[]): string[] {
  function handlePredicate(predicate: PredicateStatement | PredicateStatement[] | number): string | string[] {
    // if (predicate instanceof Predicate) {
    //   return Array.from(predicate.flatMap(handlePredicate));
    // }

    // Handle roll-option array
    if (Array.isArray(predicate)) {
      return Array.from(new Set(predicate.flatMap(handlePredicate)));
    }

    // Handle string
    if (typeof predicate === "string") {
      const number = Number(predicate);
      if (!isNaN(number)) {
        return handlePredicate(number);
      }

      if (predicate.trim().startsWith("#")) {
        return `${predicate.replace("#", "")} (Not Automated)`;
      }

      const itemRollOption = predicate.trim().match(/^(item):(?<type>[-a-z]+):(?<slug>[-a-z0-9]+)$/);
      if (itemRollOption) {
        return `${formatSlug(itemRollOption.groups?.slug)} (${formatSlug(itemRollOption.groups?.type)})`;
      }

      const traitRollOption = predicate.trim().match(/^(trait):(?<slug>[-a-z0-9]+)$/);
      if (traitRollOption) {
        return `[${formatSlug(traitRollOption.groups?.slug)}]`;
      }

      const injected = predicate.trim().match(/^{(?<type>actor|item|effect|change)\|(?<path>[\w.-]+)}$/);
      if (injected) {
        const path = injected.groups?.path;
        if (!path) return predicate.toString();

        if (path.startsWith("skills.") && path.endsWith(".mod")) {
          return `${formatSlug(path.slice(7, -4))}`;
        }
        switch (path) {
          case "level":
          case "system.advancement.level":
            return "Level";
        }

        return `'${path}'`;
      }

      return predicate.toString();
    }

    if (typeof predicate === "number") {
      return predicate.toString();
    }

    // Handle object
    if (predicate && typeof predicate === "object" && Object.keys(predicate).length > 0) {
      const statement = predicate as object
      if (StatementValidator.isBinaryOp(statement)) {
        if ('eq' in statement) {
          //@ts-expect-error - Could be attempting to evaluate truthy value
          if (statement.eq[1] == true) {
            return handlePredicate(statement.eq[0]);
          }
          //@ts-expect-error - Could be attempting to evaluate falsey value
          if (statement.eq[1] == false) {
            return `Not: ${handlePredicate(statement.eq[0])}`;
          }
          return `${handlePredicate(statement.eq[0])} == ${handlePredicate(statement.eq[1])}`;
        }
        if ('gt' in statement) {
          return `${handlePredicate(statement.gt[0])} > ${handlePredicate(statement.gt[1])}`;
        }
        if ('gte' in statement) {
          return `${handlePredicate(statement.gte[0])} >= ${handlePredicate(statement.gte[1])}`;
        }
        if ('lt' in statement) {
          return `${handlePredicate(statement.lt[0])} < ${handlePredicate(statement.lt[1])}`;
        }
        if ('lte' in statement) {
          return `${handlePredicate(statement.lte[0])} <= ${handlePredicate(statement.lte[1])}`;
        }
      }
      if (StatementValidator.isAnd(statement)) {
        const and = handlePredicate(statement.and);
        if (Array.isArray(and) && and.length === 1) {
          return and[0];
        }

        return `All of: ${Array.isArray(and) ? `<ul><li>${and.join('</li><li>')}</li></ul>` : and}`;
      }
      if (StatementValidator.isOr(statement)) {
        const or = handlePredicate(statement.or);
        if (Array.isArray(or) && or.length === 1) {
          return or[0];
        }
        return `One of: ${Array.isArray(or) ? `<ul><li>${or.join('</li><li>')}</li></ul>` : or}`;
      }
      if (StatementValidator.isNand(statement)) {
        const nand = handlePredicate(statement.nand);
        if (Array.isArray(nand) && nand.length === 1) {
          return `Not: ${nand[0]}`;
        }
        return `None of: ${Array.isArray(nand) ? `<ul><li>${nand.join('</li><li>')}</li></ul>` : nand}`;
      }
      if (StatementValidator.isXor(statement)) {
        const xor = handlePredicate(statement.xor);
        if (Array.isArray(xor) && xor.length === 1) {
          return xor[0];
        }
        return `Exactly one of: ${Array.isArray(xor) ? `<ul><li>${xor.join('</li><li>')}</li></ul>` : xor}`;
      }
      if (StatementValidator.isNor(statement)) {
        const nor = handlePredicate(statement.nor);
        if (Array.isArray(nor) && nor.length === 1) {
          return `Not: ${nor[0]}`;
        }
        return `Not all of: ${Array.isArray(nor) ? `<ul><li>${nor.join('</li><li>')}</li></ul>` : nor}`;
      }
      if (StatementValidator.isNot(statement)) {
        return `Not: ${handlePredicate(statement.not)}`;
      }
      if (StatementValidator.isIf(statement)) {
        return `If: ${handlePredicate(statement.if)} then ${handlePredicate(statement.then)}`;
      }
      if (StatementValidator.isXOf(statement)) {
        if (statement.x === 1) return handlePredicate(statement.xof);
        const xof = handlePredicate(statement.xof);
        return `${statement.x} of: ${Array.isArray(xof) ? `<ul><li>${xof.join('</li><li>')}</li></ul>` : xof}`;
      }
    }

    return predicate.toString();
  }

  return prerequisites.flatMap(handlePredicate);
}

function perkToMarkdown(perk: any): MarkdownResult | null {
  const path = getMarkdownPath({
    type: "perks",
    category: getCategory(perk.name),
    title: perk.name,
  });
  const metadata: MetaData = {
    title: formatSlug(perk.name),
    description: `An auto-generated markdown file for the ${perk.name} perk.`,
    published: "true",
    editor: "markdown",
    tags: traitsToTags(perk.system.traits, perk.system.actions),
  };

  const actionStrings = actionsToActionsStrings(perk.system.actions);
  const traitsString = traitsToTraitsList(perk.system.traits, perk.system.actions);

  const connections = [];
  for (const connection of perk.system.node?.connected ?? []) {
    connections.push(
      `[${formatSlug(connection)}](/${getMarkdownPath({
        type: "perks",
        category: getCategory(connection),
        title: connection,
        extension: false,
      })})`
    );
  }

  const nodesString = perk.system.nodes.map((node: { x: number, y: number, connected: string[] }, index: number) => {
    return `#### Node ${index + 1}\n- **X**: ${node.x}\n- **Y**: ${node.y}\n- **Connections**: ${node.connected.map(c => `[${formatSlug(c)}](/${getMarkdownPath({
      type: "perks",
      category: getCategory(c),
      title: c,
      extension: false
    })})`).join(", ")}`;
  }).join("\n\n");

  return {
    metadata,
    markdown: `- **AP Cost**: ${perk.system.cost}\n\n### Prerequisites\n${getPredicateStrings(perk.system.prerequisites)?.join("\n")}\n\n${traitsString ? `### Traits\n${traitsString}\n\n` : ""}### Effect\n${perk.system.description}${actionStrings.length > 0 ? `\n\n## Perk Actions\n${actionStrings.join("\n\n\n")}` : ""
      }\n\n### Nodes\n${nodesString}`,
    path,
  };
}

function speciesToMarkdown(species: any): MarkdownResult | null {
  if (species.folder) return null;
  const path = getMarkdownPath({
    type: "species",
    category: getCategory(species.name),
    title: species.name,
  });
  const metadata: MetaData = {
    title: formatSlug(species.name),
    description: `An auto-generated markdown file for the ${species.name} species.`,
    published: "true",
    editor: "markdown",
    tags: traitsToTags(species.system.traits, species.system.actions),
  };

  // const baseStats = `\n### Base Stats\n| Stat | Value |\n| --- | --- |\n${Object.entries(species.system.stats).reduce(
  //     (acc, [key, value]) => `${acc}| **${key.toUpperCase()}** | ${value} |\n`,
  //     ""
  // )}\n`;

  const baseStats = `\n### Base Stats\n| ${Object.keys(species.system.stats).reduce(
    (acc, key) => `${acc} **${key.toUpperCase()}** |`,
    ""
  )}\n| ${Object.keys(species.system.stats).reduce((acc) => `${acc} --- |`, "")}\n| ${Object.values(species.system.stats).reduce(
    (acc, value) => `${acc} ${value} |`,
    ""
  )}\n`;

  const movements =
    `\n### Movements\n` +
    `| Type | Value |\n| --- | --- |\n` +
    (species.system.movement.primary?.length > 0
      ? species.system.movement.primary
        .map((movement: any) => `| **${capitalize(movement.type)}** | ${movement.value}m |`)
        .join("\n")
      : "") +
    (species.system.movement.secondary?.length > 0
      ? "\n" +
      species.system.movement.secondary
        .map((movement: any) => `| **${capitalize(movement.type)}** | ${movement.value}m |`)
        .join("\n")
      : "") +
    "\n";

  const baseInfo = `\n### Base Info\n- **Dex ID**: #${species.system.number}\n- **Types**: ${species.system.types?.join(', ') ?? "untyped"}\n- **Capture Rate**: ${species.system.captureRate}\n- **Diet**: ${species.system.diet}\n- **Size Category**: ${species.system.size.category}\n- **Measurement Type**: ${species.system.size.type}\n- **Height**: ${species.system.size.height}\n- **Weight**: ${species.system.size.weight}\n- **Gender Ratio**: ${species.system.genderRatio}\n- **Egg Groups**: ${species.system.eggGroups?.join(', ') ?? ""}\n- **Habitats**: ${species.system.habitats?.join(', ') ?? "n/a"}\n`;

  const abilities =
    `\n### Abilities\n` +
    `| Tier | Ability 1 | Ability 2 |\n| --- | --- | --- |\n` +
    Object.entries(species.system.abilities).reduce<string>( //@ts-expect-error
      (acc, [type, abilities]: [string, string[]]) => {
        return `${acc}| ${capitalize(type)} | ${abilities
          .map((a: any) => `[${formatSlug(a?.slug)}](/${getMarkdownPath({
            type: "abilities",
            category: getCategory(a?.slug),
            title: a?.slug,
            extension: false,
          })}) |`)
          .join("")}\n`;
      },
      ""
    );

  const skills = Array.isArray(species.system.skills)
    ? `\n### Skills\n` +
    `| Skill | Value |\n| --- | --- |\n` +
    species.system.skills
      ?.map((skill: any) => `| **${formatSlug(skill.slug)}** | ${skill.value} |`)
      .join("\n") +
    "\n"
    : "";

  const addEvolution = (evolution: any): string => {
    let result = "";

    if (evolution?.name) {
      result += `- [${formatSlug(evolution.name)}](/${getMarkdownPath({
        type: "species",
        category: getCategory(evolution.name),
        title: evolution.name,
        extension: false,
      })})\n${evolution.methods?.length > 0
          ? `${evolution.methods.map((method: any) => {
            switch (method.type) {
              case "level":
                return `\t- **Level**: ${method.level}\n`;
              case "item":
                return `\t- **Item**: ${method.item}${method.held ? ` (Held)` : ""
                  }\n`;
              case "gender":
                return `\t- **Gender**: ${method.gender}\n`;
              case "move":
                return `\t- **Move**: ${method.move}\n`;
            }
            return "";
          }).join(' *(or)*\n')}`
          : ""
        }`;
    }

    for (const evo of evolution?.evolutions ?? []) {
      result += addEvolution(evo);
    }

    return result;
  };

  const evolutions = "\n### Evolutions\n" + addEvolution(species.system.evolutions);

  const moves =
    "\n### Moves\n#### Level Up\n" +
    `| Move | Level learned |\n| --- | --- |\n` +
    (species.system.moves.levelUp
      ?.map(
        (move: any) =>
          `| [${formatSlug(move.name)}](/${getMarkdownPath({
            type: "moves",
            category: getCategory(move.name),
            title: move.name,
            extension: false,
          })}) | ${move.level || "Upon Evolution"} |`
      )
      .join("\n") ?? "") +
    "\n\n#### Tutor\n" +
    (species.system.moves.tutor
      ?.map(
        (move: any) =>
          `- [${formatSlug(move.name)}](/${getMarkdownPath({
            type: "moves",
            category: getCategory(move.name),
            title: move.name,
            extension: false,
          })})`
      )
      .join("\n") ?? "");

  const traitsString = traitsToTraitsList(species.system.traits, []);

  return {
    metadata,
    markdown: `${baseStats}${movements}${baseInfo}${traitsString ? `\n### Traits\n${traitsString}\n\n` : ""}${abilities}${evolutions}${skills}${moves}`,
    path,
  };
}

function weaponToMarkdown(weapon: any): MarkdownResult {
  const path = getMarkdownPath({
    type: "items",
    subtype: "weapons",
    category: getCategory(weapon.name),
    title: weapon.name,
  });
  const metadata: MetaData = {
    title: formatSlug(weapon.name),
    description: `An auto-generated markdown file for the ${weapon.name} weapon item.`,
    published: "true",
    editor: "markdown",
    tags: traitsToTags(weapon.system.traits, weapon.system.actions),
  };

  const actionStrings = actionsToActionsStrings(weapon.system.actions);
  const flingString = `\n### Fling\n- **Power**: ${weapon.system.fling.power}\n- **Accuracy**: ${weapon.system.fling.accuracy}\n- **Type**: ${weapon.system.fling.type}`;
  const craftingString =
    weapon.system.crafting?.skill && weapon.system.crafting.spans
      ? `\n### Crafting\n- **Skill**: ${weapon.system.crafting.skill}\n- **Time**: ${weapon.system.crafting.spans} spans\n- **Materials**: ${weapon.system.crafting.materials}`
      : "";

  const traitsString = traitsToTraitsList(weapon.system.traits, weapon.system.actions);

  return {
    metadata,
    markdown: `- **Grade**: ${weapon.system.grade}\n- **Rarity**: ${weapon.system.rarity
      }\n${flingString}\n${craftingString ? `${craftingString}\n` : ""}\n${traitsString ? `### Traits\n${traitsString}\n\n` : ""}### Description\n${weapon.system.description
      }${actionStrings.length > 0 ? `\n\n## Weapon Actions\n${actionStrings.join("\n\n\n")}` : ""}`,
    path,
  };
}

function tutorListToMarkdown(data: {
  slug: string;
  type: string;
  moves: string[];
}): MarkdownResult {
  const path = getMarkdownPath({
    type: "lists",
    subtype: "tutor",
    title: `${data.slug}-${data.type}`,
  });
  const metadata: MetaData = {
    title: formatSlug(`${data.slug}-${data.type}`),
    description: `An auto-generated markdown file for the ${data.slug} tutor list.`,
    published: "true",
    editor: "markdown",
    tags: `tutor list, move, ${data.slug}, ${data.type}`,
  };

  const markdown = data.moves.length ? data.moves.map(move =>
    `- [${formatSlug(move)}](/${getMarkdownPath({
      type: "moves",
      category: getCategory(move),
      title: move,
      extension: false
    })})`
  ).join("\n") : `This tutor list is planned, but no moves have been added yet!`;

  return {
    metadata,
    path,
    markdown
  }
}

interface MarkdownResult {
  metadata: MetaData;
  markdown: string;
  path: string;
}

interface MetaData {
  title: string;
  description: string;
  published: "true";
  tags: string;
  editor: string;
}

export {
  abilityToMarkdown,
  consumableToMarkdown,
  effectToMarkdown,
  equipmentToMarkdown,
  gearToMarkdown,
  moveToMarkdown,
  perkToMarkdown,
  speciesToMarkdown,
  tutorListToMarkdown,
  weaponToMarkdown,
  getMarkdownPath,
  getCategory,
  replaceAtLinks,
  type MarkdownResult,
};
