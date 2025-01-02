import PartySheetPTR2e from "@module/apps/party-sheet.ts";
import TeamSheetPTR2e from "@module/apps/team-sheet.ts";
import { LaxSchemaField } from "@module/data/fields/lax-schema-field.ts";
import FolderConfigPTR2e from "./sheet.ts";
import type { DeepPartial, InexactPartial } from "fvtt-types/utils";

const folderSchema = {
  flags: new LaxSchemaField({
    core: new foundry.data.fields.ObjectField({ required: false }),
    ptr2e: new LaxSchemaField({
      owner: new foundry.data.fields.DocumentUUIDField({ required: false }),
      party: new foundry.data.fields.ArrayField(new foundry.data.fields.DocumentUUIDField(), { initial: [] }),
      team: new foundry.data.fields.ArrayField(new foundry.data.fields.DocumentUUIDField(), { initial: [] }),
    }),
  }) as unknown as foundry.data.fields.ObjectField.FlagsField<"Folder">
}

export type FolderSchema = typeof folderSchema & Folder.Schema;

class FolderPTR2e extends Folder {
  static override defineSchema(): FolderSchema {
    return {
      ...super.defineSchema() as Folder.Schema,
      ...folderSchema
    };
  }

  get owner(): string {
    if (this.type !== "Actor") return '';
    return this.contents.find(actor => (actor as unknown as Actor.ConfiguredInstance).system.party?.ownerOf == this.id)?.uuid ?? '';
  }

  get ownerActor(): Actor.ConfiguredInstance | null {
    if (this.type !== "Actor") return null;
    return this.contents.find(actor => (actor as unknown as Actor.ConfiguredInstance).system.party?.ownerOf == this.id) as unknown as Actor.ConfiguredInstance | null;
  }

  get userFromAvatarIfOwner(): User | null {
    const owner = this.ownerActor;
    if (!owner) return null;
    return game.users.find(user => user.character?.uuid === owner.uuid) ?? null;
  }

  get party(): ActorUUID[] {
    if (this.type !== "Actor") return [];
    return this.contents.filter(actor => (actor as unknown as Actor.ConfiguredInstance).system.party?.partyMemberOf == this.id).map(actor => actor.uuid);
  }

  get team(): ActorUUID[] {
    return game.actors.filter(actor => (actor as unknown as Actor.ConfiguredInstance).system.party?.teamMemberOf.includes(this.id)).map(actor => actor.uuid);
  }

  get safeColor() {
    return typeof this.color === "string"
      ? this.color
      : this.color?.css ?? "#000000"
  }

  _partySet = new Set<string>();

  /**
   * The array of the Document instances which are contained within this Folder,
   * unless it's a Folder inside a Compendium pack, in which case it's the array
   * of objects inside the index of the pack that are contained in this Folder.
   * @type {(ClientDocument|object)[]}
   */
  override get contents(): FolderableDocuments[] {
    if (this._contents) return this._contents;
    if (this.pack) return game.packs.get(this.pack)!.index.filter(d => d.folder === this.id)
    //@ts-expect-error - fvtt-types issue
    return this.documentCollection?.filter(d => d.folder === this) ?? [];
  }

  override set contents(value: FolderableDocuments[]) {
    this._contents = value;
  }

  private _contents: FolderableDocuments[] | null = null;

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
    const owner = fromUuidSync<FolderableDocuments>(this.owner);
    if (!owner || !(owner instanceof this.documentClass)) return;

    // If the folder's owner is a document, update the document's folder property
    if (owner._source.folder !== this.id) owner.updateSource({ folder: this.id });

    // Change the label of this folder to match the owner's name
    if (this.name !== owner.name) this.updateSource({ name: owner.name });
  }

  _preparePartyData() {
    if (!("ptr2e" in this.flags && this.flags.ptr2e && "party" in this.flags.ptr2e)) return;
    const party = this.flags.ptr2e.party as string[];
    for (const uuid of party) {
      const member = fromUuidSync<FolderableDocuments>(uuid);
      if (!member || !(member instanceof this.documentClass)) continue;

      // If the folder's party member is a document, update the document's folder property
      if (member._source.folder !== this.id) member.updateSource({ folder: this.id });
    }
  }

  isActorFolder(): this is FolderPTR2e & { type: "Actor" } {
    return this.documentClass.name === CONFIG.Actor.documentClass.name;
  }

  async renderPartySheet() {
    if (!this.isActorFolder()) return;

    return new PartySheetPTR2e({ folder: this }).render(true);
  }

  async renderTeamSheet() {
    if (!this.isActorFolder() || !this.team.length) return;

    return new TeamSheetPTR2e({ folder: this }).render(true);
  }

  static override createDialog<T extends foundry.abstract.Document.AnyConstructor>(
    this: T,
    data?: DeepPartial<foundry.abstract.Document.ConstructorDataFor<T>>,
    options: InexactPartial<Omit<FolderConfig.Options, "resolve">> & {
      parent?: foundry.abstract.Document.Any;
      pack?: null | string;
      resolve?: (result: foundry.abstract.Document.ToConfiguredInstance<T> | null | undefined) => void;
    } = {}
  ): Promise<foundry.abstract.Document.ToConfiguredInstance<T> | null | undefined> {
    const folder = new Folder.implementation(
      foundry.utils.mergeObject(
        {
          name: Folder.defaultName(),
          sorting: "a",
        },
        data
      ) as Folder.ConstructorData,
      { pack: options.pack }
    );
    return new Promise((resolve) => {
      options.resolve = resolve;
      const position = {
        top: options.top ?? undefined,
        left: options.left ?? undefined,
      }
      const appOptions = foundry.utils.mergeObject(options, {
        document: folder,
        position,
      }, { inplace: false }) as Partial<foundry.applications.api.DocumentSheetV2.Configuration>;
      new FolderConfigPTR2e(appOptions).render(true);
    });
  }
}

export default FolderPTR2e;
