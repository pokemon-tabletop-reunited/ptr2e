//@ts-nocheck
/**
 * Monkey patches the SettingsConfig class to customize the categorization and sorting of settings.
 * This way we can display Settings Menus as categories in the Core Settings Menu, rather than as separate menus.
 */
import { SettingsMenuPTR2e } from "./base.ts";

export function monkeyPatchSettings() {
  const core = foundry.applications.settings.SettingsConfig;
  core.prototype._sortCategories = function(a: { id: string, label: string }, b: { id, string, label: string }) {
    const categoryOrder = { core: 0, system: 1, systemMenu: 2 };
    const indexOfA = categoryOrder[a.id.startsWith("systemMenu") ? "systemMenu" : a.id] ?? 3;
    const indexOfB = categoryOrder[b.id.startsWith("systemMenu") ? "systemMenu" : b.id] ?? 3;
    return (indexOfA - indexOfB) || a.label.localeCompare(b.label, game.i18n.lang);
  }

  core.prototype._categorizeEntry = function(namespace: string, { menu }: { menu?: { key: string, label: string } } = {}) {
    switch (namespace) {
      case "core":
        return { id: "core", label: game.i18n.localize("PACKAGECONFIG.TABS.core") };
      case game.system.id: {
        return menu ? { id: `systemMenu${menu.key.replace("ptr2e.", "")}`, label: `${game.system.title} - ${game.i18n.localize(menu.label)}` } : { id: "system", label: game.system.title };
      }
      default: {
        const module = game.modules.get(namespace);
        return module
          ? { id: module.id, label: module.title }
          : { id: "unmapped", label: game.i18n.localize("PACKAGECONFIG.TABS.unmapped") };
      }
    }
  }

  core.prototype._prepareCategoryData = function()  {
    const categories = {};
    const getCategory = (namespace: string, options?: { setting?: string, menu?: { key: string, label: string } }) => {
      const { id, label } = this._categorizeEntry(namespace, options);

      if (options?.setting && id === "system") {
        for (const cat in categories) {
          if (!cat.startsWith("systemMenu")) continue;
          if (options.setting.startsWith(cat.replace("systemMenu", ""))) {
            return categories[cat]
          }
        }
      }

      return categories[id] ??= { id, label, entries: [] };
    };

    // Classify all menus
    const canConfigure = game.user.can("SETTINGS_MODIFY");
    for (const menu of game.settings.menus.values()) {
      if (menu.restricted && !canConfigure) continue;
      if ((menu.key === "core.permissions") && !game.user.hasRole("GAMEMASTER")) continue;
      const category = getCategory(menu.namespace, { menu: { key: menu.key, label: menu.label } });
      category.entries.push({
        key: menu.key,
        icon: menu.icon,
        label: menu.name,
        hint: menu.hint,
        menu: true,
        buttonText: menu.label
      });
    }

    // Classify all settings
    for (const setting of game.settings.settings.values()) {
      if (!setting.config || (!canConfigure && (setting.scope === CONST.SETTING_SCOPES.WORLD))) continue;
      const data = {
        label: setting.value,
        value: game.settings.get(setting.namespace, setting.key),
        menu: false
      };

      // Define a DataField for each setting not originally defined with one
      const fields = foundry.data.fields;
      if (setting.type instanceof fields.DataField) {
        data.field = setting.type;
      }
      else if (setting.type === Boolean) {
        data.field = new fields.BooleanField({ initial: setting.default ?? false });
      }
      else if (setting.type === Number) {
        const { min, max, step } = setting.range ?? {};
        data.field = new fields.NumberField({
          required: true,
          choices: setting.choices,
          initial: setting.default,
          min,
          max,
          step
        });
      }
      else if (setting.filePicker) {
        const categories = {
          audio: ["AUDIO"],
          folder: [],
          font: ["FONT"],
          graphics: ["GRAPHICS"],
          image: ["IMAGE"],
          imagevideo: ["IMAGE", "VIDEO"],
          text: ["TEXT"],
          video: ["VIDEO"]
        }[setting.filePicker] ?? Object.keys(CONST.FILE_CATEGORIES).filter(c => c !== "HTML");
        if (categories.length) {
          data.field = new fields.FilePathField({ required: true, blank: true, categories });
        }
        else {
          data.field = new fields.StringField({ required: true }); // Folder paths cannot be FilePathFields
          data.folderPicker = true;
        }
      }
      else {
        data.field = new fields.StringField({ required: true, choices: setting.choices });
      }
      data.field.name = `${setting.namespace}.${setting.key}`;
      data.field.label ||= game.i18n.localize(setting.name ?? "");
      data.field.hint ||= game.i18n.localize(setting.hint ?? "");

      // Categorize setting
      const category = getCategory(setting.namespace, { setting: setting.key });
      category.entries.push(data);
    }

    const isSettingsMenu = (type) => {
      if(!type || !('inheritanceChain' in type)) return false;
      try {
        for(const entry of type.inheritanceChain()) {
          if(entry == SettingsMenuPTR2e) return true;
        }
      } catch { /* empty */ }
      return false;
    }

    for(const [ id, category ] of Object.entries(categories)) {
      if(!id.startsWith("systemMenu")) continue; // only system menus
      if(category.entries?.length === 1 && !isSettingsMenu(category.entries[0].type)) {
        if(categories["system"]) categories["system"].entries.unshift(...category.entries);
        delete categories[id]; // remove empty system menu categories
      }
      else {
        // remove first entry which is the menu itself
        category.entries.shift();
      }
    }

    return categories;
  }
}