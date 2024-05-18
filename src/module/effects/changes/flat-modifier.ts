import { ActorPTR2e, DeferredValueParams } from "@actor";
import { ChangeModel } from "@data";
import { ModifierPTR2e } from "../modifiers.ts";

export default class FlatModifierChangeSystem extends ChangeModel {
    static override TYPE = "flat-modifier";

    static override defineSchema() {
        const fields = foundry.data.fields;
        return {
            ...super.defineSchema(),
            hideIfDisabled: new fields.BooleanField(),
        };
    }

    get selector() {
        return this.key;
    }

    override apply(actor: ActorPTR2e): void {
        this.beforePrepareData(actor);
    }

    override beforePrepareData(
        actor: ActorPTR2e | null = this.actor,
        method: ModifierPTR2e["method"] = "flat"
    ): void {
        if (this.ignored) return;
        if (!actor) return;

        const label = this.getReducedLabel();

        const resolvedSelector = this.resolveInjectedProperties(this.key);
        if (!resolvedSelector) return;

        const { selector, type } = ((): { selector: string; type: ModifierPTR2e["type"] } => {
            const suffixes = ["accuracy", "evasion", "damage", "crit"] as const;

            for (const suffix of suffixes) {
                if (resolvedSelector.endsWith("-" + suffix)) {
                    return {
                        selector: resolvedSelector.replace("-" + suffix, ""),
                        type: suffix,
                    };
                }
            }
            return { selector: resolvedSelector, type: "any" };
        })();

        const slug = `${this.slug}-${type}-${method}`;

        const construct = (options: DeferredValueParams = {}): ModifierPTR2e | null => {
            const resolvedValue = Number(this.resolveValue(this.value, 0, options));
            if (this.ignored || isNaN(resolvedValue)) return null;

            const predicate = this.predicate.clone();

            const modifier = new ModifierPTR2e({
                slug,
                label,
                modifier: resolvedValue,
                predicate: this.resolveInjectedProperties(predicate),
                change: this,
                hideIfDisabled: this.hideIfDisabled,
                method,
                type,
                //TODO: Add method of application
            });
            if (options.test) modifier.test(options.test);

            return modifier;
        };

        const modifiers = (actor.synthetics.modifiers[selector] ??= []);
        modifiers.push(construct);
    }
}

export default interface FlatModifierChangeSystem {
    hideIfDisabled: boolean;
}
