import { CombatantPTR2e, CombatantSystemPTR2e } from "@combat";
import { CombatantSystemSchema } from "../system.ts";
import { ItemPTR2e, SummonPTR2e } from "@item";

class SummonCombatantSystem extends CombatantSystemPTR2e {
  declare parent: CombatantPTR2e

  override get baseAV(): number {
    return this.item?.system.baseAV ?? 999;
  }

  get duration() {
    return this.item?.system.duration ?? 1;
  }

  get expired() {
    return this.activationsHad >= this.duration 
  }

  get name() {
    return `${this.parent.name} (${this.duration - this.activationsHad})`;
  }

  static override defineSchema(): SummonCombatantSchema {
    const fields = foundry.data.fields;
    return {
      ...super.defineSchema() as CombatantSystemSchema,
      owner: new fields.DocumentUUIDField({required: true, nullable: true}),
      item: new fields.JSONField({ required: true, nullable: false})
    }
  }

  override prepareBaseData(): void {
    super.prepareBaseData();
    
    this.item = (() => {
      if(!this._source.item) return null;
      try {
        return ItemPTR2e.fromJSON(this._source.item) as SummonPTR2e;
      }
      catch (error: unknown) {
        Hooks.onError("SummonCombatantSystem#prepareBaseData", error as Error, {
          log: "error",
        });
      }
      return null;
    })();
  }

  override async onStartActivation() {
    const messages = [];
    if(this.item?.system.actions?.size) {
      messages.push(game.i18n.localize("PTR2E.Combat.Summon.Messages.HasActions"));
      messages.push("<ul>")
      for(const action of this.item.system.actions) {
        messages.push(game.i18n.format("PTR2E.Combat.Summon.Messages.Action", {name: action.link}));
      }
      messages.push("</ul>")
    }
    else {
      messages.push(game.i18n.localize("PTR2E.Combat.Summon.Messages.NoActions"));
    }

    if(this.duration - this.activationsHad === 1) {
      messages.push(game.i18n.localize("PTR2E.Combat.Summon.Messages.LastActivation"));
    }

    ChatMessage.create({
      speaker: {
        alias: this.name,
      },
      content: messages.join(""),
    })

    return;
  }

  onEndActivation() {
    return;
  }

  override async _preCreate(data: this["parent"]["_source"], options: DocumentModificationContext<this["parent"]["parent"]>, user: User): Promise<boolean | void> {
    const result = await super._preCreate(data, options, user);
    if(result === false) return false;

    if(this.item?.name) {
      this.parent.updateSource({name: this.item.name});
    }
    if(this.item?.img) {
      this.parent.updateSource({img: this.item.img});
    }

    return result;
  }

  override _preUpdate(changed: DeepPartial<this["parent"]["_source"]>, options: DocumentUpdateContext<this["parent"]["parent"]>, user: User): Promise<boolean | void> {
    if (changed.defeated) {
      changed.defeated = false;
    }

    if(changed?.system?.item) {
      const item = typeof changed?.system?.item === "string" ? JSON.parse(changed.system.item) : changed.system.item;
      if(item?.name) {
        changed.name = item.name;
      }
      if(item?.img) {
        changed.img = item.img;
      }
    }

    return super._preUpdate(changed, options, user);
  }

  override _preDelete(
    _options: DocumentModificationContext<this["parent"]["parent"]>,
    _user: User
  ): Promise<boolean | void> {
    if (this.combat.combatant?.id === this.parent.id) return Promise.resolve(false);
    return super._preDelete(_options, _user);
  }

  override _onUpdate(changed: object, options: object, userId: string): void {
    super._onUpdate(changed, options, userId);
    if (
      "system" in changed &&
      changed.system &&
      typeof changed.system === "object" &&
      "activationsHad" in changed.system &&
      typeof changed.system.activationsHad === "number"
    ) {
      this.onEndActivation();
    }
  }
}

interface SummonCombatantSystem extends CombatantSystemPTR2e, ModelPropsFromSchema<SummonCombatantSchema> {
  _source: SourceFromSchema<SummonCombatantSchema>;
}

interface SummonCombatantSchema extends CombatantSystemSchema {
  
  owner: foundry.data.fields.DocumentUUIDField<string, true, true, false>;
  item: foundry.data.fields.JSONField<SummonPTR2e | null, true, false, false>;
}

export default SummonCombatantSystem;