import { localizer, sluggify } from "@utils";
import { CompendiumBrowserSources } from "./data.ts";
import { Progress } from "src/util/progress.ts";

export class PackLoader {
  loadedSources: string[] = [];
  sourcesSettings: CompendiumBrowserSources;

  constructor() {
    this.sourcesSettings = game.settings.get("ptr2e", "compendiumBrowserSources");
  }

  async *loadPacks(
    documentType: "Actor" | "Item",
    packs: string[],
    indexFields: string[],
  ): AsyncGenerator<{ pack: CompendiumCollection<CompendiumDocument>; index: CompendiumIndex }, void, unknown> {
    const localize = localizer("PTR2E.ProgressBar");
    const sources = this.#getSources();

    const progress = new Progress({ steps: packs.length });
    for (const packId of packs) {
      const pack = game.packs.get(packId);
      if (!pack) {
        progress.advance();
        continue;
      }
      progress.advance({ label: localize("LoadingPack", { pack: pack.metadata.label }) });
      if (pack.documentName === documentType) {
        const index = await pack.getIndex({ fields: indexFields });
        const firstResult: Partial<CompendiumIndexData> = index.contents.at(0) ?? {};
        // Every result should have the "system" property otherwise the indexFields were wrong for that pack
        if (firstResult.system) {
          const filteredIndex = this.#createFilteredIndex(index, sources);
          yield { pack, index: filteredIndex };
        } else {
          ui.notifications.warn(game.i18n.format("PTR2E.BrowserWarnPackNotLoaded", { pack: pack.collection }));
        }
      }
    }
    progress.close(localize("LoadingComplete"));
  }

  #getSources(): Set<string> {
    const sources = new Set<string>();
    for (const source of Object.values(this.sourcesSettings.sources)) {
      if (source?.load) {
        sources.add(source.name);
      }
    }
    return sources;
  }

  #createFilteredIndex(index: CompendiumIndex, sources: Set<string>): CompendiumIndex {
    if (sources.size === 0) {
      // Make sure everything works as before as long as the settings are not yet defined
      return index;
    }

    if (game.user.isGM && this.sourcesSettings.ignoreAsGM) {
      return index;
    }

    const filteredIndex = new Collection<CompendiumIndexData>();
    const knownSources = Object.values(this.sourcesSettings.sources).map((value) => value?.name);

    for (const data of index) {
      const source = this.#getSourceFromIndexData(data);

      if (
        (!source && this.sourcesSettings.showEmptySources) ||
        sources.has(source) ||
        (this.sourcesSettings.showUnknownSources && !!source && !knownSources.includes(source))
      ) {
        filteredIndex.set(data._id, fu.deepClone(data));
      }
    }
    return filteredIndex;
  }

  async updateSources(packs: string[]): Promise<void> {
    await this.#loadSources(packs);

    for (const source of this.loadedSources) {
      const slug = sluggify(source);
      if (this.sourcesSettings.sources[slug] === undefined) {
        this.sourcesSettings.sources[slug] = {
          load: this.sourcesSettings.showUnknownSources,
          name: source,
        };
      }
    }

    // Make sure it can be easily displayed sorted
    this.sourcesSettings.sources = Object.fromEntries(
      Object.entries(this.sourcesSettings.sources).sort((a, b) => a[0].localeCompare(b[0], game.i18n.lang)),
    );
  }

  async #loadSources(packs: string[]): Promise<void> {
    const localize = localizer("PTR2E.ProgressBar");
    const progress = new Progress({ steps: packs.length });

    const loadedSources = new Set<string>();
    const indexFields = ["system.publication.title", "system.source.value"];
    const knownDocumentTypes = ["Actor", "Item"];

    for (const packId of packs) {
      const pack = game.packs.get(packId);
      if (!pack || !knownDocumentTypes.includes(pack.documentName)) {
        progress.advance();
        continue;
      }
      progress.advance({ label: localize("LoadingPack", { pack: pack?.metadata.label ?? "" }) });
      const index = await pack.getIndex({ fields: indexFields });

      for (const element of index) {
        const source = this.#getSourceFromIndexData(element);
        if (source && source !== "") {
          loadedSources.add(source);
        }
      }
    }

    progress.close(localize("LoadingComplete"));
    const loadedSourcesArray = Array.from(loadedSources).sort();
    this.loadedSources = loadedSourcesArray;
  }

  #getSourceFromIndexData(indexData: CompendiumIndexData): string {
    const system = indexData.system;
    if (!system) return "";

    // Handle unmigrated data
    return (
      system.publication?.title ??
      system.details?.publication?.title ??
      system.source?.value ??
      system.details?.source?.value ??
      ""
    );
  }

  reset(): void {
    this.loadedSources = [];
  }

  async hardReset(packs: string[]): Promise<void> {
    this.reset();
    this.sourcesSettings = {
      ignoreAsGM: true,
      showEmptySources: true,
      showUnknownSources: true,
      sources: {},
    };
    await this.updateSources(packs);
  }
}