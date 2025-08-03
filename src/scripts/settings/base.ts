/**
 * This class is used to define whether a menu should display as a settings category rather then a menu.
 * Therefore no actual implementation for AppV2 is present.
 */
export abstract class SettingsMenuPTR2e extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.api.ApplicationV2) {
  static get settings(): SettingsPTR2e {
    throw new Error("SettingsMenuPTR2e must implement the static settings getter.");
  }

  get settings(): SettingsPTR2e {
    return (this.constructor as typeof SettingsMenuPTR2e).settings;
  }

  static get registrationSettings(): SettingSubmenuConfig {
    throw new Error("SettingsMenuPTR2e must implement the static registrationSettings method.");
  }

  static get prefix(): string {
    throw new Error("SettingsMenuPTR2e must implement the static prefix getter.");
  }

  get prefix(): string {
    return (this.constructor as typeof SettingsMenuPTR2e).prefix;
  }
}

export type SettingsPTR2e<TChoices extends Record<string, unknown> = Record<string, unknown>> = Record<string, SettingPTR2e<TChoices>>;

export interface SettingPTR2e<TChoices extends Record<string, unknown> = Record<string, unknown>> {
  name: SettingRegistration<TChoices>["name"];
  hint: SettingRegistration<TChoices>["hint"];
  scope: SettingRegistration<TChoices>["scope"];
  type: SettingRegistration<TChoices>["type"];
  config?: true;
  default: SettingRegistration<TChoices>["default"];
  choices?: SettingRegistration<TChoices>["choices"];
  requiresReload?: SettingRegistration<TChoices>["requiresReload"];
  onChange?: SettingRegistration<TChoices>["onChange"];
}