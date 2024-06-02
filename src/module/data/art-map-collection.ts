import {
    ModuleSpeciesImageDataSource,
    sluggify,
    SpeciesImageData,
    SpeciesImageDataSource,
} from "@utils";

export default class PTR2eArtMaps extends Collection<SpeciesImageData> {
    static create() {
        return new PTR2eArtMaps();
    }

    async refresh() {
        this.clear();

        // Allow modules to add and override Traits
        const toAdd: Record<string, ModuleSpeciesImageDataSource> = {};

        // Add based on module flags
        const modules = [...game.modules.entries()]
            .filter(([moduleKey, module]) => {
                if (!module.active) return false;
                if (!module.flags[moduleKey]?.["ptr2e-species-art"]) return false;
                return true;
            })
            .sort(
                ([aKey, a], [bKey, b]) =>
                    (Number(a.flags[aKey]?.["ptr2e-species-art-priority"]) || Infinity) -
                    (Number(b.flags[bKey]?.["ptr2e-species-art-priority"]) || Infinity)
            );

        for (const [moduleKey, foundryModule] of modules) {
            const moduleArt = foundryModule.flags[moduleKey]!["ptr2e-species-art"];
            if(typeof moduleArt !== "string") continue;
            
            const map = await (async (): Promise<Maybe<Record<string, ModuleSpeciesImageDataSource>>> => {
                try {
                    const response = await fetch(moduleArt);
                    if(!response.ok) {
                        console.warn(`PTR2E | Art Map Collection | Module ${foundryModule.id} | Failed to fetch art map from ${moduleArt}`);
                        return null;
                    }
                    return await response.json();
    
                } catch (error) {
                    if(error instanceof Error) {
                        console.warn(`PTR2E | Art Map Collection | Module ${foundryModule.id} | Error while fetching art map`, error.message);
                    }
                    return null;
                }
            })();
            if(!map) continue;

            for (const k in map) {
                toAdd[k] = {
                    ...map[k],
                    _source: foundryModule.id,
                };
            }
        }

        // Allow modules to manipulate data as needed
        Hooks.callAll("ptr2e.prepareArtMaps", toAdd);

        // Add the data
        for (const k in toAdd) {
            const [key, data] = this._initializeSource(toAdd[k], k);
            if (!key || !data) continue;
            this.set(key, data);
        }

        // Allow custom-defined user Art Settings from the world
        const settingArt = game.settings.get<Record<string, SpeciesImageDataSource>>(
            "ptr2e",
            "artmap"
        );
        for (const k in settingArt) {
            const [key, data] = this._initializeSource(settingArt[k], k);
            if (!key || !data) continue;
            this.set(key, data);
        }

        return this;
    }

    _initializeSource(
        source: SpeciesImageDataSource | ModuleSpeciesImageDataSource,
        key: string
    ): [string?, SpeciesImageData?] {
        const data: SpeciesImageData = {
            data: {
                base: source.data.base.trim(),
                extensions: source.data.extensions ?? [],
            },
            suffixes: source.suffixes ?? null,
        };

        // If base path is not defined, skip
        if (!data.data.base) {
            console.error(
                `PTR2E | Art Map Collection ${
                    "_source" in source ? `| Module ${source._source} |` : "|"
                } No base path defined for ${key}`
            );
            return [];
        }
        // If base path does not end with a number, skip
        if (!data.data.base.match(/\d+$/)) {
            console.error(
                `PTR2E | Art Map Collection ${
                    "_source" in source ? `| Module ${source._source} |` : "|"
                } Base path for ${key} does not end with a number`
            );
            return [];
        }
        //TODO: Consider making this a setting
        // If extensions are not defined, default to .webp
        if (data.data.extensions.length === 0) data.data.extensions.push(".webp");

        const sluggedKey = sluggify(key);
        if (key != sluggedKey) {
            console.warn(
                `PTR2E | Art Map Collection ${
                    "_source" in source ? `| Module ${source._source} |` : "|"
                } Key ${key} is not sluggified. Automatically converting to ${sluggedKey}`
            );
            return [sluggedKey, data];
        }

        return [key, data];
    }
}
