import esbuild from "esbuild";
import fs from "fs-extra";
import path from "path";
import * as Vite from "vite";
import checker from "vite-plugin-checker";
import { viteStaticCopy } from "vite-plugin-static-copy";
import tsconfigPaths from "vite-tsconfig-paths";
import packageJSON from "./package.json" assert { type: "json" };

const EN_JSON = JSON.parse(fs.readFileSync("./static/lang/en.json", { encoding: "utf-8" }));

const config = Vite.defineConfig(({ command, mode }): Vite.UserConfig => {
    const buildMode = mode === "production" ? "production" : "development";
    const outDir = "dist";

    const plugins = [checker({ typescript: true }), tsconfigPaths()];

    if (buildMode === "production") {
        plugins.push(
            {
                name: "minify",
                renderChunk: {
                    order: "post",
                    async handler(code, chunk) {
                        return chunk.fileName.endsWith(".mjs")
                            ? esbuild.transform(code, {
                                keepNames: true,
                                minifyIdentifiers: true,
                                minifySyntax: true,
                                minifyWhitespace: true
                            })
                            : code;
                    }
                }
            },
            ...viteStaticCopy({
                targets: [
                    { src: "README.md", dest: "." },
                ]
            })
        )
    }
    else {
        plugins.push(
            {
                name: "touch-vendor-mjs",
                apply: "build",
                writeBundle: {
                    async handler() {
                        fs.closeSync(fs.openSync(path.resolve(outDir, "vendor.mjs"), "w"));
                    },
                },
            },
            {
                name: "hmr-handler",
                apply: "serve",
                handleHotUpdate(context) {
                    if (context.file.startsWith(outDir)) return;

                    if (context.file.endsWith("en.json")) {
                        const basePath = context.file.slice(context.file.indexOf("lang/"));
                        console.log(`Updating lang file at ${basePath}`);
                        fs.promises.copyFile(context.file, `${outDir}/${basePath}`).then(() => {
                            context.server.ws.send({
                                type: "custom",
                                event: "lang-update",
                                data: { path: `systems/ptr2e/${basePath}` },
                            });
                        });
                    } else if (context.file.endsWith(".hbs")) {
                        const basePath = context.file.slice(context.file.indexOf("templates/"));
                        console.log(`Updating template file at ${basePath}`);
                        fs.promises.copyFile(context.file, `${outDir}/${basePath}`).then(() => {
                            context.server.ws.send({
                                type: "custom",
                                event: "template-update",
                                data: { path: `systems/ptr2e/${basePath}` },
                            });
                        });
                    }
                },
            }
        )
    }

    if (command === "serve") {
        const message = "This file is for a running vite dev server and is not copied to a build";
        fs.writeFileSync("./index.html", `<h1>${message}</h1>\n`);
        if (!fs.existsSync("./styles")) fs.mkdirSync("./styles");
        fs.writeFileSync("./styles/ptr2e.css", `/** ${message} */\n`);
        fs.writeFileSync("./ptr2e.mjs", `/** ${message} */\n\nimport "./src/ptr2e.ts";\n`);
        fs.writeFileSync("./vendor.mjs", `/** ${message} */\n`);
    }

    return {
        base: command === "build" ? "./" : "/systems/ptr2e/",
        publicDir: "static",
        define: {
            BUILD_MODE: JSON.stringify(buildMode),
            EN_JSON: JSON.stringify(EN_JSON),
            fu: "foundry.utils"
        },
        esbuild: { keepNames: true },
        build: {
            outDir,
            assetsDir: "static",
            emptyOutDir: false,
            minify: false,
            cssMinify: buildMode === "production",
            sourcemap: buildMode === "development",
            lib: {
                name: "ptr2e",
                entry: "src/ptr2e.ts",
                formats: ["es"],
                fileName: "ptr2e",
            },
            rollupOptions: {
                output: {
                    assetFileNames: ({ name }): string => (name === "style.css" ? "styles/ptr2e.css" : name ?? ""),
                    chunkFileNames: "[name].mjs",
                    entryFileNames: "ptr2e.mjs",
                    manualChunks: {
                        vendor: buildMode === "production" ? Object.keys(packageJSON.dependencies) : [],
                    },
                },
                watch: { buildDelay: 100 },
            },
            target: "es2022"
        },
        server: {
            port: 30001,
            open: "/game",
            proxy: {
                "/socket.io": {
                    target: "ws://localhost:30000",
                    ws: true,
                },
                "^(?!/systems/ptr2e/)": "http://localhost:30000/",
            }
        },
        plugins,
        css: {
            devSourcemap: buildMode === "development",
        }
    }
});

export default config;