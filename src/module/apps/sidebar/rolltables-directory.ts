//TODO: Refactor this file & functionality to be not only AppV2 compatible, but also less hacky.
import { HabitatRollTable } from "@system/habitat-table.ts";

export class RollTableDirectoryPTR2e extends foundry.applications.sidebar.tabs.RollTableDirectory {
  // static DEFAULT_OPTIONS = {
  //   actions: {
  //     "open-habitat": RollTableDirectoryPTR2e.#onHabitatClick
  //   }
  // }

  static PARTS = {
    header: {
      template: "templates/sidebar/directory/header.hbs"
    },
    habitat: {
      template: "systems/ptr2e/templates/sidebar/habitat-tables.hbs",
      scrollable: [""],
    },
    directory: {
      template: "templates/sidebar/directory/directory.hbs",
      scrollable: [""]
    },
    footer: {
      template: "templates/sidebar/directory/footer.hbs"
    }
  }

  map = new Map<string, HabitatRollTable>();

  async _preparePartContext(partId: string, context: foundry.applications.api.ApplicationRenderContext, options: foundry.applications.api.HandlebarsRenderOptions) {
    // @ts-expect-error - Missing types for this function
    super._preparePartContext(partId, context, options);

    if (partId === "habitat") {
      // @ts-expect-error - Missing types for this function
      super._preparePartContext("directory", context, options);

      const folder = new Folder.implementation({ name: "Habitat Tables", type: "RollTable", _id: "trolltablefolder" }, { temporary: true });
      const tables = Object.keys(CONFIG.PTR.data.habitats).map(habitat => new HabitatRollTable({ habitat }, { folder: folder }));
      for(const table of tables) {
        this.map.set(table._id!, table);
      }
      context.habitat = {
        children: [],
        depth: 1,
        entries: tables,
        folder,
        root: false,
        visible: true
      }
    }
    return context;
  }

  _getEntryDragData(entryId: string) {
    // @ts-expect-error - Missing types for this function
    if(!entryId.startsWith("phtid0")) return super._getEntryDragData(entryId);
    ui.notifications.warn("Drag and drop is not supported for habitat tables.");
    return this.map.get(entryId)?.toDragData() ?? null;
  }

  async _onClickEntry(event: PointerEvent, target: HTMLElement, options: Record<string, unknown>) {
    event.preventDefault();
    const { entryId } = target.closest<HTMLElement>("[data-entry-id]")?.dataset ?? {};
    if (!entryId) return;
    // @ts-expect-error - Missing types for this function
    if(!entryId.startsWith("phtid0")) return super._onClickEntry(event, target, options);
    
    const table = this.map.get(entryId);
    if(!table) return void ui.notifications.error("Table not found!");
    await table.init();
    // @ts-expect-error - Outdated Types
    table.sheet.render( {force: true, editable: false });
  }

  // protected override _getEntryContextOptions(): EntryContextOption[] {
  //   const options = super._getEntryContextOptions().map(option => {
  //     const oldCondition = option.condition;

  //     option.condition = (header) => {
  //       try {
  //         const isDynamicTable = !!(header.closest("li[data-habitat]")[0] as HTMLLIElement)?.dataset.habitat;
  //         if (isDynamicTable && ["OWNERSHIP.Configure", "SIDEBAR.Delete", "SIDEBAR.Duplicate"].includes(option.name)) {
  //           return false;
  //         }
  //         return oldCondition(header);
  //       }
  //       catch {
  //         return false;
  //       }
  //     }
  //     return option;
  //   })

  //   return [
  //     {
  //       name: "PTR2E.DynamicTableRefresh",
  //       icon: '<i class="fas fa-sync"></i>',
  //       condition: header => {
  //         const li = header.closest("li[data-habitat]")[0] as HTMLLIElement;
  //         return HabitatRollTable.canRefresh(li?.dataset.habitat as keyof typeof CONFIG.PTR.data.habitats);
  //       },
  //       callback: header => {
  //         const li = header.closest("li[data-habitat]")[0] as HTMLLIElement;
  //         const habitat = li?.dataset.habitat as keyof typeof CONFIG.PTR.data.habitats;
  //         HabitatRollTable.refresh(habitat);
  //       }
  //     },
  //     {
  //       name: "PTR2E.DynamicTableCopy",
  //       icon: '<i class="fas fa-copy"></i>',
  //       condition: header => {
  //         const li = header.closest("li[data-habitat]")[0] as HTMLLIElement;
  //         return !!CONFIG.PTR.data.habitats[li?.dataset.habitat as keyof typeof CONFIG.PTR.data.habitats];
  //       },
  //       callback: async header => {
  //         const li = header.closest("li[data-habitat]")[0] as HTMLLIElement;
  //         const habitat = li.dataset.habitat as keyof typeof CONFIG.PTR.data.habitats;
  //         const table = new HabitatRollTable({ habitat });
  //         await table.init();
  //         const data = table.toObject();
  //         data.name = `Copy of ${data.name}`
  //         RollTable.create(data);
  //       }
  //     },
  //     ...options,
  //   ]
  // }
}