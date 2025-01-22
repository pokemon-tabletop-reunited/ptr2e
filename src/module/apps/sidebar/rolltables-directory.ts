import { HabitatRollTable } from "@system/habitat-table.ts";

/** TODO: Extend CompendiumDirectory to support a search bar */
export class RollTableDirectoryPTR2e extends RollTableDirectory {
  static override get defaultOptions() {
    return {
      ...super.defaultOptions,
      template: "systems/ptr2e/templates/sidebar/table-directory.hbs",
    }
  }

  override async getData(options: Partial<ApplicationOptions> = {}) {
    return {
      ...(await super.getData(options)),
      habitats: CONFIG.PTR.data.habitats,
    }
  }

  override activateListeners(html: JQuery): void {
    super.activateListeners(html)

    for (const liElement of html[0].querySelectorAll<HTMLLIElement>("li.dynamic-habitat")) {
      liElement.addEventListener("click", this._onHabitatClick.bind(this))
    }
  }

  private async _onHabitatClick(event: MouseEvent) {
    event.preventDefault();
    event.stopImmediatePropagation();
    event.stopPropagation();

    const habitat = (event.currentTarget as HTMLLIElement).dataset.habitat as keyof typeof CONFIG.PTR.data.habitats
    const table = new HabitatRollTable({ habitat })
    await table.init()
    table.sheet.render(true, { editable: false });
  }

  protected override _getEntryContextOptions(): EntryContextOption[] {
    const options = super._getEntryContextOptions().map(option => {
      const oldCondition = option.condition;

      option.condition = (header) => {
        try {
          const isDynamicTable = !!(header.closest("li[data-habitat]")[0] as HTMLLIElement)?.dataset.habitat;
          if(isDynamicTable && ["OWNERSHIP.Configure", "SIDEBAR.Delete", "SIDEBAR.Duplicate"].includes(option.name)) {
            return false;
          }
          return oldCondition(header);
        }
        catch {
          return false;
        }
      }
      return option;
    })

    return [
      {
        name: "PTR2E.DynamicTableRefresh",
        icon: '<i class="fas fa-sync"></i>',
        condition: header => {
          const li = header.closest("li[data-habitat]")[0] as HTMLLIElement;
          return HabitatRollTable.canRefresh(li?.dataset.habitat as keyof typeof CONFIG.PTR.data.habitats);
        },
        callback: header => {
          const li = header.closest("li[data-habitat]")[0] as HTMLLIElement;
          const habitat = li?.dataset.habitat as keyof typeof CONFIG.PTR.data.habitats;
          HabitatRollTable.refresh(habitat);
        }
      },
      {
        name: "PTR2E.DynamicTableCopy",
        icon: '<i class="fas fa-copy"></i>',
        condition: header => {
          const li = header.closest("li[data-habitat]")[0] as HTMLLIElement;
          return !!CONFIG.PTR.data.habitats[li?.dataset.habitat as keyof typeof CONFIG.PTR.data.habitats];
        },
        callback: async header => {
          const li = header.closest("li[data-habitat]")[0] as HTMLLIElement;
          const habitat = li.dataset.habitat as keyof typeof CONFIG.PTR.data.habitats;
          const table = new HabitatRollTable({ habitat });
          await table.init();
          const data = table.toObject();
          data.name = `Copy of ${data.name}`
          RollTable.create(data);
        }
      },
      ...options,
    ]
  }
}