export * as api from "./api.js";
export * as elements from "./elements.js";
export * as fields from "./fields.js";
export * as sheets from "./sheets.js";
export * as hud from "./hud/_module.mts";
export {instances} from "./instances.ts";
export {parseHTML} from "./parse-html.ts";
//V13 aliases
export const ux: {DragDrop: typeof DragDrop, TextEditor: typeof TextEditor}
export const handlebars: {renderTemplate: typeof renderTemplate}
export const sidebar: {
  tabs: {
    Settings: typeof Settings
    RollTableDirectory: typeof RollTableDirectory
    CompendiumDirectory: typeof CompendiumDirectory
    ActorDirectory: typeof ActorDirectory
    ItemDirectory: typeof ItemDirectory
    CombatTracker: typeof CombatTracker

  }
}
export const ui: {
  Hotbar: typeof Hotbar
}