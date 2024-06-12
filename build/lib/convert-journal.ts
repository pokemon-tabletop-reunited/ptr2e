import fs from "fs";
import showdown from "showdown";

/**
 * Generate a random alphanumeric string ID of a given requested length using `crypto.getRandomValues()`.
 * @param {number} length    The length of the random string to generate, which must be at most 16384.
 * @return {string}          A string containing random letters (A-Z, a-z) and numbers (0-9).
 */
export function randomID(length: number = 16): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const cutoff = 0x100000000 - (0x100000000 % chars.length);
    const random = new Uint32Array(length);
    do {
        crypto.getRandomValues(random);
    } while (random.some((x) => x >= cutoff));
    let id = "";
    for (let i = 0; i < length; i++) id += chars[random[i] % chars.length];
    return id;
}

class JournalConverter {
    static readonly journalRoots = ["rules"] as const;
    static readonly extension = ".md" as const;

    readonly root: Page;
    pages: Map<string, Page> = new Map();

    get entries(): JournalEntryPage<JournalEntry>["_source"][] {
        function toData(page: Page, depth = 1): JournalEntryPage<JournalEntry>["_source"] {
            const data: Partial<JournalEntryPage<JournalEntry>["_source"]> = {
                _id: randomID(),
                name: page.title,
                flags: {
                    core: {
                        sheetClass: "core.MarkdownJournalPageSheet",
                    },
                    ptr2e: {
                        metadata: page.metadata,
                    },
                },
                title: {
                    level: depth,
                    show: true,
                },
                text: {
                    content: page.content,
                    markdown: page.markdown,
                    format: 2,
                },
            };
            return data as JournalEntryPage<JournalEntry>["_source"];
        }

        function recurr(page: Page, depth = 1): JournalEntryPage<JournalEntry>["_source"][] {
            const entries: JournalEntryPage<JournalEntry>["_source"][] = [toData(page, depth)];
            if (page.pages.size > 1) {
                for (const subPage of page.pages.values()) {
                    entries.push(...recurr(subPage, depth + 1));
                }
            }

            return entries;
        }

        const entries: JournalEntryPage<JournalEntry>["_source"][] = [toData(this.root)];

        for (const page of this.pages.values()) {
            entries.push(...recurr(page));
        }
        return entries;
    }

    constructor({ root, pages }: { root: Page; pages: Map<string, Page> }) {
        this.root = root;
        this.pages = pages;
    }

    static fromPaths(root: string, paths: string[]) {
        const rootPage = Page.fromPath(root);
        const pages = new Map<string, Page>();

        const rootWithoutExtension = root.slice(0, -JournalConverter.extension.length);
        for (const path of paths) {
            if (path.startsWith(rootWithoutExtension)) {
                if (!path.endsWith(JournalConverter.extension)) continue;
                if (path === root) continue; // Skip the root page (it's already been added)

                // If the page is in a sub directory, it should be added as a sub page of another page
                if (path.split("\\").length > rootWithoutExtension.split("\\").length + 1) {
                    const parentTitle = path
                        .slice(rootWithoutExtension.length, -JournalConverter.extension.length)
                        .split("\\")
                        .at(-2)!;
                    const parent = pages.get(parentTitle);
                    if (parent) {
                        const title = path
                            .slice(rootWithoutExtension.length, -JournalConverter.extension.length)
                            .split("\\")
                            .at(-1)!;
                        parent.pages.set(title, Page.fromPath(path));
                        parent.pages.get(title)!.metadata.parent = parent.metadata.slug;
                    }
                    continue;
                }

                const title = path
                    .slice(rootWithoutExtension.length, -JournalConverter.extension.length)
                    .split("\\")
                    .at(-1)!;
                pages.set(title, Page.fromPath(path));
                pages.get(title)!.metadata.parent = rootPage.metadata.slug;
            }
        }
        return new JournalConverter({ root: rootPage, pages });
    }

    static *pathsToJournalRoots(paths: string[]) {
        for (const path of paths) {
            const journalRoot = JournalConverter.journalRoots.find((root) =>
                path.includes(root + JournalConverter.extension)
            );
            if (journalRoot) {
                yield JournalConverter.fromPaths(path, paths);
            }
        }
    }

    static fromEntry(entry: JournalEntry["_source"]): JournalConverter {
        const pages = new Map<string, Page>();
        const getPage = (slug: string) => {
            function getSubPage(slug: string, current: Page): Page | null {
                if(current.metadata.slug === slug) return current;
                if(current.pages.has(slug)) return current.pages.get(slug)!;
                for(const page of current.pages.values()) {
                    const subPage = getSubPage(slug, page);
                    if(subPage) return subPage;
                }
                return null;
            }

            if(pages.has(slug)) return pages.get(slug)!;
            for(const page of pages.values()) {
                const subPage = getSubPage(slug, page);
                if(subPage) return subPage;
            }
            return null;
        }
        const deferred = new Map<string, {
            title: string;
            markdown: string;
            metadata: Record<string, string>;
            parent: string;
        }>();
        for (const page of entry.pages) {
            const markdown = page.text.markdown;
            const metadata = page.flags["ptr2e"]?.metadata as Maybe<MetaData>;
            if (!markdown || !metadata) continue;

            if (metadata.parent) {
                const parent = pages.get(metadata.parent);
                if (parent) {
                    const path =
                        parent.path.replace(JournalConverter.extension, "") +
                        "/" +
                        metadata.slug +
                        JournalConverter.extension;
                    parent.pages.set(
                        metadata.slug,
                        new Page({ title: metadata.title, path, markdown, metadata })
                    );
                    continue;
                }
                else {
                    deferred.set(metadata.slug, {
                        title: metadata.title,
                        markdown,
                        metadata,
                        parent: metadata.parent,
                    });
                    continue;
                }
            }

            pages.set(
                metadata.slug,
                new Page({
                    title: metadata.title,
                    path: metadata.slug + JournalConverter.extension,
                    markdown,
                    metadata,
                })
            );
        }

        let retryCount = 5;
        while(deferred.size > 0 ) {
            for (const [slug, { title, markdown, metadata, parent }] of deferred) {
                const parentPage = getPage(parent);
                if (parentPage) {
                    const path = parentPage.path.replace(JournalConverter.extension, "") + "/" + slug + JournalConverter.extension;
                    parentPage.pages.set(slug, new Page({ title, path, markdown, metadata }));
                    deferred.delete(slug);
                }
            }
            if(--retryCount == 0) break;
        }

        const root = pages.get(entry.name)!;
        return new JournalConverter({ root, pages });
    }
}

class Page {
    readonly title: string;
    readonly path: string;
    readonly markdown: string;

    get content(): string {
        return new showdown.Converter({
            disableForced4SpacesIndentedSublists: true,
            noHeaderId: true,
            parseImgDimensions: true,
            strikethrough: true,
            tables: true,
            tablesHeaderId: true,
        }).makeHtml(this.markdown);
    }

    get wikiContent(): string {
        return `---\n${Object.entries(this.metadata)
            .filter(([key]) => key !== "slug" && key !== "parent")
            .map(([key, value]) => `${key}: ${value}`)
            .join("\n")}\n---\n\n# ${this.metadata.title}\n${this.markdown}`;
    }

    metadata: Record<string, string> = {};
    pages: Map<string, Page> = new Map();

    constructor({
        title,
        path,
        markdown,
        metadata,
    }: {
        title: string;
        path: string;
        markdown: string;
        metadata?: Record<string, string>;
    }) {
        this.title = title;
        this.path = path;
        this.markdown = markdown;
        if (metadata) this.metadata = metadata;
    }

    static fromPath(path: string) {
        let title: string = "";
        let metadata: Record<string, string> = {};

        const content = fs.readFileSync(path, "utf8").trim();

        // Every page has a comment at the top holding the title, as well as any tags.
        const comment = content.match(/---\s+?((.|\s)+?)\s+?---/m);
        if (comment) {
            const md = comment[1].split("\r\n");
            for (const data of md) {
                const [key, value] = data.split(": ");
                if (key) metadata[key.replace("\n", "")] = value;
            }
            metadata.slug = path.split("\\").at(-1)!.slice(0, -JournalConverter.extension.length);
            if (metadata["title"]) {
                title = metadata["title"];
            }
        }
        let markdown = content.replace(/---\s+?((.|\s)+?)\s+?---/m, "").trim();

        // If the first line is a h1 title, remove it
        const firstLine = markdown.split("\n")[0];
        if (firstLine.startsWith("# ")) {
            if (!title) title = firstLine.slice(2).trim();
            markdown = markdown.replace(firstLine, "").trim();
        }

        if (!title) {
            title = path.split("\\").at(-1)!.slice(0, -JournalConverter.extension.length);
        }

        return new Page({ title, path, markdown, metadata });
    }
}

type MetaData = {
    title: string;
    description: string;
    published: string;
    date: string;
    tags: string;
    editor: string;
    dateCreated: string;
    slug: string;
    parent?: string;
};

export { JournalConverter, Page };
