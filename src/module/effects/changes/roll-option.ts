import { ActorPTR2e } from "@actor";
import { ChangeModel } from "@data";
import { RollOptionDomains } from "@module/data/roll-option-manager.ts";

export default class RollOptionChangeSystem extends ChangeModel {
    static override TYPE = "roll-option";

    static override defineSchema() {
        const fields = foundry.data.fields;
        return {
            ...super.defineSchema(),
            domain: new fields.StringField({required: true, initial: "all", choices: Object.values(RollOptionDomains)}),
        }
    }

    override apply(actor: ActorPTR2e, _rollOptions?: string[] | Set<string> | null): void {
        actor.rollOptions.addOption(this.domain, this.key);
    }
}

export default interface RollOptionChangeSystem {
    domain: keyof typeof RollOptionDomains;
}