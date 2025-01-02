import type { CheckModifier} from "@module/effects/modifiers.ts";
import { ModifierPTR2e } from "@module/effects/modifiers.ts";
import type { CheckRollContext } from "@system/rolls/data.ts";
import { ModifierPopup } from "./modifier-popup.ts";
import type { ActorPTR2e } from "@actor";
import type { CheckContext } from "@system/data.ts";
import { htmlQueryAll, htmlQuery, tupleHasValue } from "@utils";
import type { AttackPTR2e } from "@data";

export class AttackModifierPopup extends ModifierPopup {
  static override DEFAULT_OPTIONS = foundry.utils.mergeObject(
    super.DEFAULT_OPTIONS,
    {
      classes: ["attack"],
      position: {
        width: 440,
      },
      form: {
        handler: AttackModifierPopup.#onSubmit,
      },
    },
    { inplace: false }
  );

  static override PARTS: Record<string, foundry.applications.api.HandlebarsApplicationMixin.HandlebarsTemplatePart> = {
    modifiers: {
      id: "modifiers",
      template: "systems/ptr2e/templates/apps/attack-modifier-popup.hbs",
    },
  };

  override get title() {
    return `Attack Modifiers: ${this.context.title?.trim() || this.check.slug}`;
  }

  sharedModifiers: Collection<ModifierPTR2e>;
  targets: ActorUUID[];
  ppCost: number | null;

  constructor(
    check: CheckModifier,
    sharedModifiers: Collection<ModifierPTR2e>,
    context: Omit<CheckRollContext, "target" | "targets"> & {
      contexts: Record<ActorUUID, CheckContext>;
    },
    options: DeepPartial<ApplicationConfigurationExpanded> = {}
  ) {
    super(check, context, options);

    this.targets = Object.keys(context.contexts) as ActorUUID[];
    this.ppCost = context.ppCost ?? null;

    this.sharedModifiers = sharedModifiers;
    this.originallyEnabled = new Set(
      [
        check.modifiers.filter((m) => !m.ignored),
        sharedModifiers.filter((m) => !m.ignored),
      ].flat()
    );
  }

  override async _prepareContext() {
    const modifiers = (() => {
      const selectOption = (type: ModifierPTR2e["type"], method: ModifierPTR2e["method"]) => {
        switch (type) {
          case "accuracy":
            return method === "stage"
              ? "accuracy-stage"
              : method === "flat"
                ? "accuracy-flat"
                : method === "percentile"
                  ? "accuracy-percentile"
                  : "invalid";
          case "crit":
            return method === "stage" ? "crit-stage" : "invalid";
          case "power":
            return method === "percentile" ? "power-percentile" : method === "flat" ? "power-flat" : "invalid";
          case "damage":
            return method === "percentile" ? "damage-percentile" : method === "flat" ? "damage-flat" : "invalid";
          case "stat":
            return method === "flat" ? "stat-flat" : "invalid";
          case "effectiveness":
            return method === "stage" ? "effectiveness-stage" : "invalid";
          default:
            return "invalid";
        }
      };

      const sortOrder = {
        "accuracy-stage": 1,
        "accuracy-flat": 2,
        "accuracy-percentile": 3,
        "crit-stage": 4,
        "power-percentile": 5,
        "power-flat": 6,
        "damage-percentile": 7,
        "damage-flat": 8,
        "effectiveness-stage": 9,
        invalid: 10,
      };

      const checkModifiers = this.check.modifiers.map((m) => {
        const modifier = {
          ...m,
          hideIfDisabled: !this.originallyEnabled.has(m) && m.hideIfDisabled,
          collection: "check",
          select: selectOption(m.type, m.method),
          appliesToAll: false,
          appliesTo: (() => {
            if (!m.appliesTo || m.appliesTo.size === 0) {
              return this.targets.map((target) => {
                const actor = fromUuidSync(target) as ActorPTR2e;
                return {
                  name: actor?.name ?? "",
                  img: actor?.img ?? "",
                  uuid: target,
                  value: true,
                };
              });
            }

            const seen = new Set();
            const output = [];
            for (const [key, value] of m.appliesTo.entries()) {
              seen.add(key);
              const actor = fromUuidSync(key) as ActorPTR2e;
              output.push({
                name: actor?.name ?? "",
                img: actor?.img ?? "",
                uuid: key as ActorUUID,
                value,
              });
            }
            for (const target of this.targets) {
              if (seen.has(target)) continue;
              const actor = fromUuidSync(target) as ActorPTR2e;
              output.push({
                name: actor?.name ?? "",
                img: actor?.img ?? "",
                uuid: target,
                value: true,
              });
            }
            return output;
          })(),
        };
        if (modifier.appliesTo.every((entry) => entry.value)) modifier.appliesToAll = true;
        if (modifier.select === "invalid") modifier.hidden = true;
        return modifier;
      });
      const sharedModifiers = this.sharedModifiers.map((m) => {
        const modifier = {
          ...m,
          hideIfDisabled: !this.originallyEnabled.has(m) && m.hideIfDisabled,
          collection: "shared",
          select: selectOption(m.type, m.method),
          appliesToAll: false,
          appliesTo: (() => {
            const seen = new Set();
            const output = [];
            for (const [key, value] of m.appliesTo.entries()) {
              seen.add(key);
              const actor = fromUuidSync(key) as ActorPTR2e;
              output.push({
                name: actor?.name ?? "",
                img: actor?.img ?? "",
                uuid: key as ActorUUID,
                value,
              });
            }
            for (const target of this.targets) {
              if (seen.has(target)) continue;
              const actor = fromUuidSync(target) as ActorPTR2e;
              output.push({
                name: actor?.name ?? "",
                img: actor?.img ?? "",
                uuid: target,
                value: false,
              });
            }
            return output;
          })(),
        };
        if (modifier.appliesTo.every((entry) => entry.value)) modifier.appliesToAll = true;
        if (modifier.select === "invalid") modifier.hidden = true;
        return modifier;
      });

      return checkModifiers.concat(sharedModifiers).sort((a, b) => {
        // Sort in order of select options.
        // First accuracy stage, then accuracy flat, then crit stage, then damage percentile.
        // Within each group, sort by label alphabetically.
        if (a.select === b.select) {
          return a.label.localeCompare(b.label);
        }
        return (
          sortOrder[a.select as keyof typeof sortOrder] -
          sortOrder[b.select as keyof typeof sortOrder]
        );
      });
    })();

    const variants = (() => {
      if(!this.context.variants?.length || !this.context.actor) return null;

      interface AttackVariant {
        slug: string;
        label: string;
        category: string;
        uuid: string;
        selected?: boolean;
      }
      const variantMap = new Map<string, AttackVariant>();
      let original = false;
      let selected = false;

      for(const variant of this.context.variants) {
        const action = this.context.actor.actions.attack.get(variant);
        if(!action) continue;
        if(!action.variant) original = true;
        if(this.context.action === variant) {
          variantMap.set(variant, {slug: variant, uuid: action.uuid, label: action.name, category: action.category, selected: true });
          selected = true;
        }
        else {
          variantMap.set(variant, {slug: variant, uuid: action.uuid, label: action.name, category: action.category});
        }  
      }

      const variants = Array.from(variantMap.values()).sort((a, b) => a.label.localeCompare(b.label));
      if(!original) {
        const original = this.context.actor.actions.attack.get(variants[0].slug)!.original as AttackPTR2e;
        if(!original) return null;
        variants.unshift({
          slug: original.slug,
          label: original.slug === 'fling' ? `${original.name} (No Item)` :`${original.name} (Original)`,
          category: original.category,
          uuid: original.uuid,
          ...(!selected ? {selected: true} : {})
        })
      }
      return variants;
    })();

    //TODO: Turn into game setting
    const consumePP = this.ppCost ? true : false;

    const isNoRollStatus = this.context.attack && this.context.attack.category === "status" && !this.context.attack.power && !this.context.attack.accuracy;

    return {
      modifiers,
      rollModes: CONFIG.Dice.rollModes,
      rollMode:
        this.context.rollMode === "roll"
          ? game.settings.get("core", "rollMode")
          : this.context.rollMode,
      avatarScroll: this.targets.length > 9,
      consumePP,
      ppCost: this.ppCost,
      variants,
      isNoRollStatus
    };
  }

  override _attachPartListeners(
    _partId: string,
    htmlElement: HTMLElement
  ): void {
    const getModifier = (collection?: string, slug?: string): Maybe<ModifierPTR2e> => {
      return !collection || !slug
        ? null
        : collection === "shared"
          ? this.sharedModifiers.find((s) => s.slug === slug)
          : this.check.modifiers.find((s) => s.slug === slug);
    };

    for (const element of htmlQueryAll(htmlElement, "div.modifier")) {
      const { collection, slug } = element.dataset;

      const modifier = getModifier(collection, slug);
      if (!modifier) continue;

      const checkbox = htmlQuery<HTMLInputElement>(element, "input[type=checkbox]");

      checkbox?.addEventListener("click", () => {
        modifier.ignored = !checkbox.checked;
        this.render({});
      });
    }

    for (const element of htmlQueryAll(htmlElement, "span.appliesTo")) {
      const { collection, slug } = element.dataset;

      const modifier = getModifier(collection, slug);
      if (!modifier) continue;

      const checkbox = htmlQuery<HTMLInputElement>(element, "input[type=checkbox]");

      checkbox?.addEventListener("click", () => {
        const checked = checkbox.checked;
        for (const key of this.targets) {
          modifier.appliesTo.set(key, checked);
        }
        this.render({});
      });

      for (const avatar of htmlQueryAll(element, ".avatars span.avatar")) {
        const uuid = avatar.dataset.uuid as ActorUUID;
        if (!uuid) continue;

        avatar.addEventListener("contextmenu", () => {
          const checked = avatar.classList.contains("unapplicable");
          modifier.appliesTo.set(uuid, checked);
          this.render({});
        });

        avatar.addEventListener("dblclick", async () => {
          const actor = (await fromUuid(uuid)) as ActorPTR2e;
          if (!actor) return;

          const token = actor.getActiveTokens(false)[0];
          if (!token) return;

          token.control({ releaseOthers: true });
          canvas.animatePan({ x: token.x, y: token.y });
        });

        let highlights: Token[] = [];
        avatar.addEventListener("mouseover", async (event) => {
          event.preventDefault();
          if (!canvas.ready) return;

          const actor = (await fromUuid(uuid)) as ActorPTR2e;
          if (!actor) return;

          const tokens = actor.getActiveTokens(false);
          if (!tokens?.length) return;

          if (tokens.every((t) => t.isVisible)) {
            //@ts-expect-error ignore protected clause.
            tokens.forEach((t) => t._onHoverIn(event));
            highlights = tokens;
          }
        });

        avatar.addEventListener("mouseout", async (event) => {
          event.preventDefault();
          if (!canvas.ready) return;

          if (!highlights.length) return;

          //@ts-expect-error ignore protected clause.
          highlights.forEach((t) => t._onHoverOut(event));
          highlights = [];
        });
      }
    }

    const addModifierButton = htmlQuery<HTMLButtonElement>(htmlElement, "button.add-modifier");
    addModifierButton?.addEventListener("click", () => {
      const parent = addModifierButton.parentElement as HTMLDivElement;
      const modifierType = parent.querySelector<HTMLInputElement>(".add-modifier-type")
        ?.value as ModifierPTR2e["type"];
      const value = Number(
        parent.querySelector<HTMLInputElement>(".add-modifier-value")?.value || 1
      );
      let name = String(parent.querySelector<HTMLInputElement>(".add-modifier-name")?.value);
      const errors: string[] = [];
      if (Number.isNaN(value)) {
        errors.push("Modifier value must be a number.");
      } else if (value === 0) {
        errors.push("Modifier value must not be zero.");
      }
      if (
        ![
          "accuracy-stage",
          "accuracy-flat",
          "accuracy-percent",
          "crit-stage",
          "power-percent",
          "power-flat",
          "damage-percent",
          "damage-flat",
          "stat-flat",
          "effectiveness-stage"
        ].includes(modifierType)
      ) {
        errors.push("Invalid modifier type. Please select a valid modifier type.");
      }
      if (!name || !name.trim()) {
        name = game.i18n.localize(value < 0 ? `Penalty` : `Bonus`);
      }
      if (errors.length > 0) {
        ui.notifications.error(errors.join(" "));
      } else {
        const { method, type } = ((
          type: string
        ): { method?: ModifierPTR2e["method"]; type?: ModifierPTR2e["type"] } => {
          switch (type) {
            case "accuracy-stage":
              return { method: "stage", type: "accuracy" };
            case "accuracy-flat":
              return { method: "flat", type: "accuracy" };
            case "accuracy-percent":
              return { method: "percentile", type: "accuracy" };
            case "crit-stage":
              return { method: "stage", type: "crit" };
            case "power-percent":
              return { method: "percentile", type: "power" };
            case "power-flat":
              return { method: "flat", type: "power" };
            case "damage-percent":
              return { method: "percentile", type: "damage" };
            case "damage-flat":
              return { method: "flat", type: "damage" };
            case "stat-flat":
              return { method: "flat", type: "stat" };
            case "effectiveness-stage":
              return { method: "stage", type: "effectiveness" };
          }
          return {};
        })(modifierType);
        this.check.push(new ModifierPTR2e({ label: name, modifier: value, method, type }));
        this.render({ window: { title: this.title } });
      }
    });

    const rollModeInput = htmlQuery<HTMLSelectElement>(htmlElement, "select[name='rollmode']");
    rollModeInput?.addEventListener("change", () => {
      const rollMode = rollModeInput.value;
      if (!tupleHasValue(Object.values(CONST.DICE_ROLL_MODES), rollMode)) {
        throw Error("Unexpected roll mode");
      }
      this.context.rollMode = rollMode;
    });

    const variantSelector = htmlQuery<HTMLSelectElement>(htmlElement, "select[name='variant']");
    variantSelector?.addEventListener("change", this.selectAlternative.bind(this, variantSelector));
  }

  static async #onSubmit(
    this: AttackModifierPopup,
    event: SubmitEvent | Event,
    _form: HTMLFormElement,
    formData: FormDataExtended
  ) {
    if (!this.resolve) return;
    if (!event) {
      this.resolve(null);
      this.promise = null;
      this.resolve = undefined;
      return;
    }

    const sharedModifiers: ModifierPTR2e[] = [];
    for (const modifier of this.check.modifiers) {
      if ([...modifier.appliesTo.values()].some((value) => !value)) {
        sharedModifiers.push(modifier);
        this.check.delete(modifier);
      }
    }
    for (const [slug, modifier] of this.sharedModifiers.entries()) {
      if (
        modifier.appliesTo.size === this.targets.length &&
        [...modifier.appliesTo.values()].every((value) => value)
      ) {
        this.check.push(modifier);
        this.sharedModifiers.delete(slug);
      }
    }

    for (const modifier of sharedModifiers) {
      if (this.sharedModifiers.has(modifier.slug)) continue;

      for (const target of this.targets) {
        if (modifier.appliesTo.has(target)) continue;
        modifier.appliesTo.set(target, true);
      }
      this.sharedModifiers.set(modifier.slug, modifier);
    }

    const result = formData.object;
    const rollMode = result.rollMode as RollMode;

    const consumePP = result["consume-pp"] == true;
    this.context.consumePP = consumePP;

    this.resolve({ rollMode });
    this.promise = null;
    this.resolve = undefined;
  }

  async selectAlternative(select: HTMLSelectElement, event: Event) {
    event.preventDefault();
    const variantSlug = select.value;

    const uuid = this.context.actor?.uuid ?? this.context.attack?.actor?.uuid;
    const origin = await fromUuid<ActorPTR2e>(uuid);
    if(!origin) return;

    const variant = origin.actions.attack.get(variantSlug);
    if(!variant) return void ui.notifications.error(`Unable to find variant ${variantSlug}`);

    this.resolve?.(null);
    this.promise = null;
    this.resolve = undefined;

    variant.roll({modifierDialog: this});
  }

  updateDetails(
    check: CheckModifier,
    sharedModifiers: Collection<ModifierPTR2e>,
    context: Omit<CheckRollContext, "target" | "targets"> & {
      contexts: Record<ActorUUID, CheckContext>;
    }) {
    this.check = check;
    this.context = context;
    this.targets = Object.keys(context.contexts) as ActorUUID[];
    this.ppCost = context.ppCost ?? null;

    this.sharedModifiers = sharedModifiers;
    this.originallyEnabled = new Set(
      [
        check.modifiers.filter((m) => !m.ignored),
        sharedModifiers.filter((m) => !m.ignored),
      ].flat()
    );

    return this;
  }
}

export interface ModifierPopupResult {
  modifiers: ModifierPTR2e[];
  rollMode: RollMode;
}