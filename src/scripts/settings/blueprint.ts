import { natures } from "@scripts/config/natures.ts";
import { SettingsMenuPTR2e, SettingsPTR2e } from "./base.ts";

export class BlueprintDefaultsMenu extends SettingsMenuPTR2e {
  static override get settings(): SettingsPTR2e {
    return {
      "level": {
        name: "PTR2E.Settings.Blueprint.Level.Name",
        hint: "PTR2E.Settings.Blueprint.Level.Hint",
        config: true,
        default: null,
        type: new foundry.data.fields.StringField({
          required: true,
          nullable: true,
          initial: null,
          validate: (value) => {
            // Level can be either a integer value, a range in the format `a-b`, a Rolltable UUID or null
            if (value === null) return true;

            // Check if the value is a number
            const number = Number(value);
            if (!isNaN(number)) {
              if (Number.isInteger(number) && number >= 1) return true;
              throw new Error("The level must be a positive integer.");
            }
            if (typeof value !== "string") return false;

            // Check if the value is a range
            if (value.match(/^\d+-\d+$/)) {
              const [min, max] = value.split("-").map(Number);
              if (min >= 1 && max >= min) return true;

              throw new Error("The range must be in the format `a-b` where `a` and `b` are integers and `a` is less than or equal to `b`.");
            }

            // Check if the value is a Rolltable UUID
            const uuid = fu.parseUuid(value);
            if (uuid && uuid.documentId) {
              if (uuid.documentType === "RollTable") return true;
              throw new Error("The UUID must point to a Rolltable.");
            }

            return false;
          },
        }),
        scope: "world"
      },
      "nature": {
        name: "PTR2E.Settings.Blueprint.Nature.Name",
        hint: "PTR2E.Settings.Blueprint.Nature.Hint",
        config: true,
        default: null,
        type: new foundry.data.fields.StringField({
          required: true, initial: null, nullable: true, trim: true, validate: (value) => {
            //Natures can either be a valid nature typed out, a UUID to a Rolltable or null
            if (value === null) return true;
            if (typeof value !== "string") return false;

            // Check if the value is a valid nature
            const nature = value.toLowerCase();
            if (natures[nature] !== undefined) return true;

            // Check if the value is a Rolltable UUID
            const uuid = fu.parseUuid(value);
            if (uuid && uuid.documentId) {
              if (uuid.documentType === "RollTable") return true;
              throw new Error("The UUID must point to a Rolltable.");
            }

            return false;
          }, validationError: "The nature must be a valid nature, a UUID to a Rolltable or null."
        }),
        scope: "world"
      },
      "gender": {
        name: "PTR2E.Settings.Blueprint.Gender.Name",
        hint: "PTR2E.Settings.Blueprint.Gender.Hint",
        config: true,
        default: null,
        type: new foundry.data.fields.StringField({
          required: true,
          initial: null,
          nullable: true,
          trim: true,
          choices: ["random", "male", "female", "genderless"].reduce((acc, val) => ({ ...acc, [val]: val }), {}),
        }),
        scope: "world"
      },
      "shiny": {
        name: "PTR2E.Settings.Blueprint.Shiny.Name",
        hint: "PTR2E.Settings.Blueprint.Shiny.Hint",
        config: true,
        default: 1,
        type: new foundry.data.fields.NumberField({
          required: true,
          initial: 1,
          nullable: false,
          min: 0,
          max: 100,
          step: 1
        }),
        scope: "world"
      },
      "perk": {
        name: "PTR2E.Settings.Blueprint.Perk.Name",
        hint: "PTR2E.Settings.Blueprint.Perk.Hint",
        config: true,
        default: null,
        type: String,
        scope: "world"
      }
    }
  }

  static override get registrationSettings(): SettingSubmenuConfig {
    return {
      name: "PTR2E.Settings.Blueprint.Name",
      label: "PTR2E.Settings.Blueprint.Label",
      hint: "PTR2E.Settings.Blueprint.Hint",
      icon: "fa fa-cog",
      type: BlueprintDefaultsMenu,
      restricted: true
    };
  }

  static override get prefix(): string {
    return "blueprint";
  }
}