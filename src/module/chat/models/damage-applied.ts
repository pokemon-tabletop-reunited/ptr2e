import { ActorPTR2e } from "@actor";
import { ChatMessagePTR2e } from "@chat";

abstract class DamageAppliedMessageSystem extends foundry.abstract.TypeDataModel {
    declare parent: ChatMessagePTR2e<DamageAppliedMessageSystem>;

    /**
     * The target to which the damage was applied
    */
    abstract target: ActorPTR2e | null;
    /**
     * The applied damage
     */
    abstract damageApplied: number;
    /**
     * Whether the damage was undone
     */
    abstract undone: boolean;

    declare _source: foundry.abstract.TypeDataModel['_source'] & {
        target: string;
        damageApplied: number;
        undone: boolean;
    }

    /**
     * Define the schema for the DamageAppliedMessageSystem data model
     */
    static override defineSchema() {
        const fields = foundry.data.fields;
        return {
            target: new fields.DocumentUUIDField({ required: true, type: 'Actor' }),
            damageApplied: new fields.NumberField({ required: true, validate: (d) => d as number >= 0 }),
            undone: new fields.BooleanField({ required: true, initial: false }),
        }
    }

    override prepareBaseData(): void {
        this.target = (() => {
            const actor = fromUuidSync(this._source.target) as ActorPTR2e | null;
            return actor;
        })();
    }

    async getHTMLContent(_content: string) {
        return renderTemplate('systems/ptr2e/templates/chat/damage-applied.hbs', this);
    }

    async undoDamage() {
        if (this.undone) return;
        if (!this.target) return;

        await this.parent.update({ "system.undone": true });
        await this.target.applyDamage(-this.damageApplied);
    }

    activateListeners(html: JQuery<HTMLElement>) {
        html.find(".revert-damage").on('click', this.undoDamage.bind(this));
    }
}

export default DamageAppliedMessageSystem