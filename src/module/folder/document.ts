import { ActorPTR2e, ActorSystemPTR2e } from "@actor";
import PartySheetPTR2e from "@module/apps/party-sheet.ts";
import TeamSheetPTR2e from "@module/apps/team-sheet.ts";
import { LaxSchemaField } from "@module/data/fields/lax-schema-field.ts";
import FolderConfigPTR2e from "./sheet.ts";
import { FolderSchema } from "types/foundry/common/documents/folder.js";

class FolderPTR2e<
  TDocument extends EnfolderableDocument = EnfolderableDocument,
> extends Folder<TDocument> {
  static override defineSchema(): FolderSchema {
    const fields = foundry.data.fields;

    return {
      ...super.defineSchema(),
      //@ts-expect-error - Flags override
      flags: new LaxSchemaField({
        core: new fields.ObjectField({ required: false }),
        ptr2e: new LaxSchemaField({
          owner: new fields.DocumentUUIDField({ required: false }),
          party: new fields.ArrayField(new fields.DocumentUUIDField(), { initial: [] }),
          team: new fields.ArrayField(new fields.DocumentUUIDField(), { initial: [] }),
        }),
      }),
    };
  }

  get owner(): string {
    if (this.type !== "Actor") return '';
    return this.contents.find(actor => (actor as unknown as ActorPTR2e).system.party?.ownerOf == this.id)?.uuid ?? '';
  }

  get ownerActor(): ActorPTR2e | null {
    if (this.type !== "Actor") return null;
    return this.contents.find(actor => (actor as unknown as ActorPTR2e).system.party?.ownerOf == this.id) as unknown as ActorPTR2e | null;
  }

  get userFromAvatarIfOwner(): User | null {
    const owner = this.ownerActor;
    if (!owner) return null;
    return game.users.find(user => user.character?.uuid === owner.uuid) ?? null;
  }

  get party() {
    if (this.type !== "Actor") return [];
    return this.contents.filter(actor => (actor as unknown as ActorPTR2e).system.party?.partyMemberOf == this.id).map(actor => actor.uuid);
  }

  get team() {
    return game.actors.filter(actor => (actor as unknown as ActorPTR2e).system.party?.teamMemberOf.includes(this.id)).map(actor => actor.uuid);
  }

  get safeColor() {
    return typeof this.color === "string"
      ? this.color
      : //@ts-expect-error - This property exists
      this.color?.css ?? "#000000"
  }

  _partySet = new Set<string>();

  /**
   * The array of the Document instances which are contained within this Folder,
   * unless it's a Folder inside a Compendium pack, in which case it's the array
   * of objects inside the index of the pack that are contained in this Folder.
   * @type {(ClientDocument|object)[]}
   */
  override get contents() {
    if ( this._contents ) return this._contents;
    if ( this.pack ) return game.packs.get(this.pack)!.index.filter(d => d.folder === this.id ) as TDocument[];
    return this.documentCollection?.filter(d => d.folder === this) ?? [];
  }

  override set contents(value: TDocument[]) {
    this._contents = value;
  }

  private _contents: TDocument[] | null = null;

  isInParty(uuid: string) {
    return this._partySet.has(uuid);
  }

  isFolderOwner(uuid: string) {
    return this.owner === uuid;
  }

  override prepareBaseData(): void {
    super.prepareBaseData();

    try {
      this._partySet = new Set(this.party);
    }
    catch {
      this._partySet = new Set();
    }

    this._prepareOwnerData();
    this._preparePartyData();
  }

  _prepareOwnerData() {
    if (!this.owner) return;
    const owner = fromUuidSync(this.owner);
    if (!(owner instanceof this.documentClass)) return;

    // If the folder's owner is a document, update the document's folder property
    if (owner._source.folder !== this.id) owner.updateSource({ folder: this.id });

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
      if (member._source.folder !== this.id) member.updateSource({ folder: this.id });
    }
  }

  isActorFolder(): this is FolderPTR2e<ActorPTR2e<ActorSystemPTR2e, null>> {
    return this.documentClass.name === ActorPTR2e.name;
  }

  async renderPartySheet() {
    if (!this.isActorFolder()) return;

    return new PartySheetPTR2e({ folder: this }).render(true);
  }

  async renderTeamSheet() {
    if (!this.isActorFolder() || !this.team.length) return;

    return new TeamSheetPTR2e({ folder: this }).render(true);
  }

  static override createDialog<TDocument extends EnfolderableDocument>(
    data: Record<string, unknown> = {},
    options:
      | ({
        parent?: TDocument["parent"] | undefined;
        pack?: CompendiumCollection<TDocument> | null | string;
        resolve?: (result: TDocument | null) => void;
      } & Partial<FormApplicationOptions>)
      = {}
  ): Promise<TDocument | null> {
    const folder = new Folder.implementation(
      foundry.utils.mergeObject(
        {
          name: Folder.defaultName(),
          sorting: "a",
        },
        data
      ),
      { pack: options.pack}
    );
    return new Promise((resolve) => {
      options.resolve = resolve;
      const position = {
        top: options.top ?? undefined,
        left: options.left ?? undefined,
      }
      const appOptions = foundry.utils.mergeObject<Partial<FormApplicationOptions>, Partial<foundry.applications.api.DocumentSheetConfiguration>>(options, {
        document: folder,
        position,
      }, { inplace: false }) as Partial<foundry.applications.api.DocumentSheetConfiguration>;
      new FolderConfigPTR2e(appOptions).render(true);
    });
  }
}

export default FolderPTR2e;
