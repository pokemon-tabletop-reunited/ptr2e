import FolderPTR2e from "@module/folder/document.ts";
import { MigrationBase } from "../base.ts"
import { ActorPTR2e } from "@actor";

export class Migration104FolderUpdate extends MigrationBase {
  static override version = 0.104;

  static _data: Map<string, {
    owner: string;
    party: string;
    team: Set<string>;
    folder: string;
  }>;

  static lock = Promise.resolve();

  async getData() {
    return Migration104FolderUpdate._data ?? (Migration104FolderUpdate._data = await (async () => {

      await Migration104FolderUpdate.lock;
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      const lock: { release: () => void } = { release: () => { } };
      Migration104FolderUpdate.lock = new Promise(resolve => lock.release = resolve);

      try {
        const folders = game.folders.filter(folder => folder.type === "Actor") as FolderPTR2e[];
        return folders.reduce((map, folder) => {
          const { owner, party, team } = folder.flags.ptr2e as { owner: ActorUUID, party: ActorUUID[], team: ActorUUID[] } ?? { owner: "", party: [], team: [] };

          if (owner) {
            const id  =owner.split(".").at(-1)!;
            const entry = map.get(id) ?? { owner: "", party: "", team: new Set(), folder: folder.id };
            entry.owner = folder.id;
            entry.folder ||= folder.id;
            map.set(id, entry);
          }

          if (party?.length) {
            for (const uuid of party) {
              const id = uuid.split(".").at(-1)!;
              const entry = map.get(id) ?? { owner: "", party: "", team: new Set(), folder: folder.id };
              entry.party = folder.id;
              entry.folder ||= folder.id;
              map.set(id, entry);
            }
          }

          if (team?.length) {
            for (const uuid of team) {
              const id = uuid.split(".").at(-1)!;
              const entry = map.get(id) ?? { owner: "", party: "", team: new Set(), folder: "" };
              entry.team.add(folder.id);
              map.set(id, entry);
            }
          }

          return map;
        }, new Map<string, { owner: string, party: string, team: Set<string>, folder: string; }>());
      // eslint-disable-next-line no-useless-catch
      } catch (error) {
        throw error;
      } finally {
        lock.release();
      }
    })());
  }

  override async updateActor(actor: ActorPTR2e["_source"]): Promise<void> {
    const data = await this.getData();

    const actorData = data.get(actor._id!);
    if(!actorData) return;
    
    actor.system.party.ownerOf = actorData.owner;
    actor.system.party.partyMemberOf = actorData.party;
    actor.system.party.teamMemberOf = Array.from(actorData.team);
    if(actorData.folder && actor.folder !== actorData.folder) actor.folder = actorData.folder;
  }
}