import { GrantItemChangeSystem } from "@data";
import { ItemPTR2e } from "@item";
import ActiveEffectPTR2e from "../document.ts";

export default class GrantEffectChangeSystem extends GrantItemChangeSystem {
    static override TYPE = "grant-effect";

    static override defineSchema() {
        const schema = super.defineSchema();
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        schema.value.validate = () => {};
        schema.value.options.choices = CONFIG.PTR.statusEffects.reduce((choices, status) => {
            choices[status.id] = status.name;
            return choices;
        }, {} as Record<string, string>);
        return schema;
    }

    override apply(): void {
        // TODO: Implement createInMemoryCondition
    }

    override async getItem(key: string = this.resolveInjectedProperties(this.uuid)): Promise<Maybe<ItemPTR2e>> {
        try {
            const effect = await ActiveEffectPTR2e.fromStatusEffect(key)
            
            return new ItemPTR2e({
                name: effect.name,
                type: "effect",
                effects: [effect.toObject()],
                img: effect.img || "icons/svg/item-bag.svg"
            })
        }
        catch (error) {
            console.error(error);
            return null;
        }
    }
}