import { ActorPTR2e, DeferredValueParams } from "@actor";
import { ChangeModel } from "@data";
import { ModifierPTR2e } from "../modifiers.ts";

export default class FlatModifierChangeSystem extends ChangeModel {
    static override TYPE = "flat-modifier";

    static override defineSchema() {
        const fields = foundry.data.fields;
        return {
            ...super.defineSchema(),
            hideIfDisabled: new fields.BooleanField()
        }
    }

    override apply(actor: ActorPTR2e): void {
        this.beforePrepareData(actor);
    }

    override beforePrepareData(actor: ActorPTR2e | null = this.actor): void {
        if(this.ignored) return;
        if(!actor) return;

        const label = this.getReducedLabel();
        const slug = this.slug;

        const selector = this.resolveInjectedProperties(this.key);
        if(!selector) return;

        const construct = (options: DeferredValueParams = {}): ModifierPTR2e | null => {
            const resolvedValue = Number(this.resolveValue(this.value, 0, options));
            if(this.ignored || isNaN(resolvedValue)) return null;

            const predicate = this.predicate.clone();

            const modifier = new ModifierPTR2e({
                slug,
                label,
                modifier: resolvedValue,
                predicate: this.resolveInjectedProperties(predicate),
                change: this,
                hideIfDisabled: this.hideIfDisabled,
                source: this.effect.uuid,
            })
            if(options.test) modifier.test(options.test);

            return modifier;
        }

        const modifiers = (actor.synthetics.modifiers[selector] ??= []);
        modifiers.push(construct);
    } 
}

export default interface FlatModifierChangeSystem {
    hideIfDisabled: boolean;
}