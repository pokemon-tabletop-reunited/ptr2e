import type { ActorPTR2e } from "@actor";
import type { ChangeModelOptions, ChangeSource } from "@data";
import { ChangeModel } from "@data";
import type { AbilityPTR2e } from "@item";
import { UUIDUtils } from "src/util/uuid.ts";

export default class SuppresAbilityChangeSystem extends ChangeModel {
  static override TYPE = "suppress-ability";

  get selector() {
    return this.key;
  }

  constructor(source: ChangeSource, options: ChangeModelOptions) {
    super(source, options);

    this.priority ??= -1;
  }

  override apply(actor: ActorPTR2e): void {
    if (!this.test(actor.getRollOptions())) return;

    const slug = this.resolveValue(this.selector);
    if (!slug || !(typeof slug === "string")) return;

    //@ts-expect-error - V12/13 compatability
    const ability = (UUIDUtils.isItemUUID(slug) ? fromUuidSync(slug, { relative: this.actor }) : this.actor?.itemTypes.ability.find(a => a.slug === this.selector)) as AbilityPTR2e;
    if (!ability) return;

    ability.system.suppress = true;
    ability.actions.forEach(action => {
      this.actor?.actions.delete(action.slug);
    })
  }
}