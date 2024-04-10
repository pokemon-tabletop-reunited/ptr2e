import { ActorPTR2e, ActorSystemPTR2e } from "@actor";
import PartySheetPTR2e from "@module/apps/party-sheet.ts";
import TeamSheetPTR2e from "@module/apps/team-sheet.ts";
import { LaxSchemaField } from "@module/data/fields/lax-schema-field.ts";
import { FolderSchema } from "types/foundry/common/documents/folder.js";

class FolderPTR2e<
    TDocument extends EnfolderableDocument = EnfolderableDocument,
> extends Folder<TDocument> {
    static override defineSchema(): FolderSchema {
        const fields = foundry.data.fields;

        return {
            ...super.defineSchema(),
            //@ts-expect-error
            flags: new LaxSchemaField({
                core: new fields.ObjectField({ required: false }),
                ptr2e: new LaxSchemaField({
                    owner: new fields.DocumentUUIDField({ required: false }),
                    party: new fields.ArrayField(new fields.DocumentUUIDField(), {initial: []}),
                    team: new fields.ArrayField(new fields.DocumentUUIDField(), {initial: []}),
                }),
            }),
        };
    }

    get owner() {
        return "ptr2e" in this.flags && this.flags.ptr2e && "owner" in this.flags.ptr2e
            ? (this.flags.ptr2e.owner as string)
            : null;
    }

    get party() {
        return "ptr2e" in this.flags && this.flags.ptr2e && "party" in this.flags.ptr2e
            ? (this.flags.ptr2e.party as string[])
            : [];
    }

    get team() {
        return "ptr2e" in this.flags && this.flags.ptr2e && "team" in this.flags.ptr2e
            ? (this.flags.ptr2e.team as string[])
            : [];
    }

    _partySet: Set<string> = new Set();

    isInParty(uuid: string) {
        return this._partySet.has(uuid);
    }

    isFolderOwner(uuid: string) {
        return this.owner === uuid;
    }    

    override prepareBaseData(): void {
        super.prepareBaseData();

        this._partySet = new Set(this.party);
        
        this._prepareOwnerData();
        this._preparePartyData();
    }

    _prepareOwnerData() {
        if (!this.owner) return;
        const owner = fromUuidSync(this.owner);
        if (!(owner instanceof this.documentClass)) return;

        // If the folder's owner is a document, update the document's folder property
        if(owner._source.folder !== this.id) owner.updateSource({ folder: this.id });

        // Change the label of this folder to match the owner's name
        if (this.name !== owner.name) this.updateSource({ name: owner.name });
    }

    _preparePartyData() {
        if (!("ptr2e" in this.flags && this.flags.ptr2e && "party" in this.flags.ptr2e)) return;
        const party = this.flags.ptr2e.party as string[];
        for (const uuid of party) {
            const member = fromUuidSync(uuid);
            if (!(member instanceof this.documentClass)) continue;

            // If the folder's party member is a document, update the document's folder property
            if(member._source.folder !== this.id) member.updateSource({ folder: this.id });
        }
    }

    isActorFolder(): this is FolderPTR2e<ActorPTR2e<ActorSystemPTR2e, null>> {
        return this.documentClass.name === ActorPTR2e.name;
    }

    async renderPartySheet() {
        if(!this.isActorFolder()) return;

        return new PartySheetPTR2e(this).render(true);
    }
    
    async renderTeamSheet() {
        if(!this.isActorFolder() || !this.team.length) return;

        return new TeamSheetPTR2e(this).render(true);
    }
}

export default FolderPTR2e;
