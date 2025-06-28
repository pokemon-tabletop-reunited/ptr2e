import { SettingsMenuPTR2e, SettingsPTR2e } from "./base.ts";

export class MetagameMenu extends SettingsMenuPTR2e {
  static override get settings(): SettingsPTR2e {
    return {
      "show-accuracy": {
        name: "PTR2E.Settings.Metagame.ShowAccuracy.Name",
        hint: "PTR2E.Settings.Metagame.ShowAccuracy.Hint",
        default: "allyOnlyResult",
        type: String,
        choices: {
          "full": "PTR2E.Settings.Metagame.ShowAccuracy.Full",
          "result": "PTR2E.Settings.Metagame.ShowAccuracy.Result",
          "allyOnlyResult": "PTR2E.Settings.Metagame.ShowAccuracy.AllyOnlyResult",
          "none": "PTR2E.Settings.Metagame.ShowAccuracy.None",
        },
        scope: "world",
        requiresReload: true
      },
      "show-damage": {
        name: "PTR2E.Settings.Metagame.ShowDamage.Name",
        hint: "PTR2E.Settings.Metagame.ShowDamage.Hint",
        default: "allyOnlyResult",
        type: String,
        choices: {
          "full": "PTR2E.Settings.Metagame.ShowDamage.Full",
          "result": "PTR2E.Settings.Metagame.ShowDamage.Result",
          "allyOnlyResult": "PTR2E.Settings.Metagame.ShowDamage.AllyOnlyResult",
          "none": "PTR2E.Settings.Metagame.ShowAccuracy.None",
        },
        scope: "world",
        requiresReload: true
      },
      "show-effect-rolls": {
        name: "PTR2E.Settings.Metagame.ShowEffectRolls.Name",
        hint: "PTR2E.Settings.Metagame.ShowEffectRolls.Hint",
        default: "allyOnlyResult",
        type: String,
        choices: {
          "full": "PTR2E.Settings.Metagame.ShowEffectRolls.Full",
          "result": "PTR2E.Settings.Metagame.ShowEffectRolls.Result",
          "allyOnlyResult": "PTR2E.Settings.Metagame.ShowEffectRolls.AllyOnlyResult",
          "none": "PTR2E.Settings.Metagame.ShowAccuracy.None",
        },
        scope: "world",
        requiresReload: true
      },
      "show-damage-taken": {
        name: "PTR2E.Settings.Metagame.ShowDamageTaken.Name",
        hint: "PTR2E.Settings.Metagame.ShowDamageTaken.Hint",
        default: "hide",
        type: String,
        choices: {
          "show": "PTR2E.Settings.Metagame.ShowDamageTaken.Show",
          "hide": "PTR2E.Settings.Metagame.ShowDamageTaken.Hide",
        },
        scope: "world"
      }
    }
  }

  static override get registrationSettings(): SettingSubmenuConfig {
    return {
      name: "PTR2E.Settings.Metagame.Name",
      label: "PTR2E.Settings.Metagame.Label",
      hint: "PTR2E.Settings.Metagame.Hint",
      icon: "fa fa-cog",
      type: MetagameMenu,
      restricted: false
    };
  }

  static override get prefix(): string {
    return "metagame";
  }
}