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

    /**
     * Notes about the damage
     */
    abstract notes: string[];

    _notesHTML: string | undefined;

    declare _source: foundry.abstract.TypeDataModel['_source'] & {
        target: string;
        damageApplied: number;
        undone: boolean;
        notes: string[][];
    }

    /**
     * Define the schema for the DamageAppliedMessageSystem data model
     */
    static override defineSchema() {
        const fields = foundry.data.fields;
        return {
            target: new fields.DocumentUUIDField({ required: true, type: 'Actor' }),
            damageApplied: new fields.NumberField({ required: true }),
            undone: new fields.BooleanField({ required: true, initial: false }),
            notes: new fields.ArrayField(new fields.ArrayField(new fields.HTMLField({blank: false, nullable: false})), { required: true, initial: [] }),
        }
    }

    override prepareBaseData(): void {
        this.target = (() => {
            const actor = fromUuidSync(this._source.target) as ActorPTR2e | null;
            return actor;
        })();

        const notesElement = document.createElement('div');
        for(let i = 0; i < this.notes.length; i++) {
            const element = document.createElement('article');
            element.classList.add('note', `note-${i}`);
            for(let j = 0; j < this.notes[i].length; j++) {
                const note = document.createElement('figure');
                note.innerHTML = this.notes[i][j];
                // The last figure will contain the damage applied note
                // This figure should get the class 'damage'
                if (j === this.notes[i].length - 1) note.classList.add('damage');
                element.appendChild(note);
            }
            notesElement.appendChild(element);
        }
        this._notesHTML = notesElement.innerHTML;
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