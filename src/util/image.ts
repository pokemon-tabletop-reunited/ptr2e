class ImageResolver {

    private tree: foundry.utils.StringTree<string>;
    constructor(files: string[]) {
        this.tree = new fu.StringTree();

        for(const file of files) {
            const str = [...file.split('/').at(-1)?.split('.').at(0) ?? ""];
            this.tree.addLeaf(str, file);
        }
    }

    static async create(basePath: string, extensions: string[] = []) {
        const exts = Array.from(new Set([extensions, ".webp"].flat()));
        if(!basePath.endsWith('*')) {
            basePath = `${basePath}*`;
        }
        try {
            const result = await FilePicker.browse('data', basePath, {
                extensions: exts,
                wildcard: true,
            });
            if(!result.files?.length) return null;

            return new ImageResolver(result.files);
        }
        catch (error) {
            console.error(`PTR2E | ImageResolver | Error while creating ImageResolver`, error);
            return new ImageResolver([]);
        }
    }

    static async createFromSpeciesData(config: ImageSpeciesResolverConfig, speciesData: SpeciesImageData) {
        const {base, extensions} = {base: speciesData.data.base, extensions: Array.from(new Set([...speciesData.data.extensions ?? [], ".webp"]))};
        const suffixes = speciesData.suffixes ?? {};

        const resolver = await ImageResolver.create(base, extensions);
        if(!resolver) return null;

        const realConfig = {
            dexId: config.dexId,
            shiny: config.shiny ?? false,
            forms: (config.forms ?? []).map(f => suffixes[f] ?? f)
        }
        return {
            resolver,
            result: resolver.findSpecies(realConfig)
        }
    }

    static async createAndFindSpecies(config: ImageSpeciesResolverConfig, basePath: string, extensions: string[] = [] ) {
        const resolver = await ImageResolver.create(basePath, extensions);
        if(!resolver) return null;

        return {
            resolver,
            result: resolver.findSpecies(config)
        }
    }

    find(needle: string | string[]) {
        const realNeedle = Array.isArray(needle) ? needle : [...needle];

        const node = this.tree.nodeAtPrefix(realNeedle, {hasLeaves: true});

        const filePath = node?.[fu.StringTree.leaves];
        return Array.isArray(filePath) ? filePath.at(0) : filePath;
    }

    findSpecies(config: ImageSpeciesResolverConfig) {
        const {dexId, shiny, forms} = config;

        const baseNeedle = [...dexId.toString()];
        const formsNeedleSuffix = [...forms.flatMap(f => [...f])];

        function formMatch(result: string) {
            let count = 0;
            for(const form of forms) {
                if(result.includes(form)) {
                    count++;
                }
            }
            return {
                count,
                isMatch: count === forms.length
            }
        }
        
        if(shiny) {
            const shinyNeedle = [...baseNeedle, 's'];
            const shinyResult = this.find([...shinyNeedle, ...formsNeedleSuffix]);
            if(shinyResult) {
                const match = formMatch(shinyResult);
                // Full match on forms, return result
                if(match.isMatch) {
                    return shinyResult;
                }

                // No match on forms, try to find a better match
                if(!match.count) {
                    let result: string|undefined = undefined;
                    for(let i = 1; i < forms.length; i++) {
                        const sliced = forms.slice(i);
                        const slicedSuffix = [...sliced.flatMap(f => [...f])];
                        result = this.find([...shinyNeedle, ...slicedSuffix]);
                        if(result && formMatch(result).count) break;
                    }
                    if(result) {
                        return result;
                    }
                } // form matched partially, return shiny result
                else {
                    return shinyResult;
                }
            }
        }

        const result = this.find([...baseNeedle, ...formsNeedleSuffix]);
        if(!result) return null;

        const match = formMatch(result);
        // Full match on forms, return result
        if(match.isMatch) {
            return result;
        }

        // No match on forms, try to find a better match
        if(!match.count) {
            let result: string|undefined = undefined;
            for(let i = 1; i < forms.length; i++) {
                const sliced = forms.slice(i);
                const slicedSuffix = [...sliced.flatMap(f => [...f])];
                result = this.find([...baseNeedle, ...slicedSuffix]);
                if(result && formMatch(result).count) break;
            }
            if(result) {
                return result;
            }
        }

        return result;
    }
}

interface ImageSpeciesResolverConfig {
    /** Dex ID of mon to base search off of */
    dexId: number;
    /** Whether the target img art should be shiny */
    shiny?: boolean;
    /** Form suffix as in file path */
    forms: string[];
}

/**
 * SpeciesImageData is a type that represents the structure of the data that is used to resolve species images.
 * @example
 * ```
 * const sample: Record<string, SpeciesImageData> = {
 *  "rotom": {
 *      "data": {
 *          "base": "/systems/ptu/static/images/sprites/479",
 *          "extensions": [".webp"],
 *      },
 *      "suffixes": {
 *          "wash": "_Wash",
 *          "heat": "_Heat",
 *          "fan": "_Fan",
 *          "mow": "_Mow"
 *      }
 *  }
 * }
 * ```
 */
type SpeciesImageData = {
    data: {
        base: string;
        extensions: string[];
    }
    suffixes: Record<string, string> | null;
}

type SpeciesImageDataSource = {
    data: {
        base: string;
        extensions?: string[];
    }
    suffixes?: Record<string, string>;
}

type ModuleSpeciesImageDataSource = SpeciesImageDataSource & {
    _source: string
}

export { ImageResolver };
export type { ImageSpeciesResolverConfig, SpeciesImageData, SpeciesImageDataSource, ModuleSpeciesImageDataSource };