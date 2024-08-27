import { ActorSystemPTR2e } from "@actor";
import Clock, { ClockSchema } from "@module/data/models/clock.ts";
import { HandlebarsRenderOptions } from "types/foundry/common/applications/handlebars-application.ts";

const CLOCK_MAX_SIZE = 16;
const CLOCK_SIZES = [2, 3, 4, 5, 6, 8, 10, 12, 16];

export default class ClockEditor extends foundry.applications.api.HandlebarsApplicationMixin(
  foundry.applications.api.ApplicationV2
) {
  private clock?: Clock;
  constructor(
    options: Partial<foundry.applications.api.HandlebarsDocumentSheetConfiguration>,
    clock?: Clock
  ) {
    super(options);
    this.clock = clock;
  }

  static override DEFAULT_OPTIONS = fu.mergeObject(
    super.DEFAULT_OPTIONS,
    {
      id: "clock-editor-{id}",
      classes: ["clock-editor"],
      tag: "form",
      window: {
        frame: true,
        positioned: true,
        minimizable: false,
      },
      form: {
        handler: ClockEditor.#submit,
        closeOnSubmit: true,
        submitOnChange: false,
      },
    },
    { inplace: false }
  );

  static override PARTS = {
    clocks: {
      id: "clocks",
      template: "/systems/ptr2e/templates/apps/clocks/clock-editor.hbs",
    },
  };

  override async _renderFrame(options: HandlebarsRenderOptions) {
    options.window!.title = this.clock
      ? game.i18n.format("PTR2E.Clocks.Global.Editor.TitleEdit", { label: this.clock.label })
      : game.i18n.localize("PTR2E.Clocks.Global.Editor.TitleAdd");
    return super._renderFrame(options);
  }

  override async _prepareContext() {
    const context = (await super._prepareContext()) ?? {};
    const fields = (
      game.ptr.clocks.db.schema.fields.clocks as foundry.data.fields.ArrayField<
        foundry.data.fields.EmbeddedDataField<Clock>
      >
    ).element.fields;
    const clock = this.clock ?? new Clock();

    return {
      ...context,
      clock,
      maxSize: CLOCK_MAX_SIZE,
      presetSizes: CLOCK_SIZES,
      fields,
    };
  }

  static #submit(
    this: ClockEditor,
    event: Event,
    _form: HTMLFormElement,
    formData: FormDataExtended
  ) {
    event.preventDefault();

    if (this.clock) {
      if(this.clock.parent instanceof ActorSystemPTR2e) {
        const clocks = fu.duplicate(this.clock.parent._source.clocks);
        const index = clocks.findIndex((c) => c.id === this.clock!.id);
        if (index === -1) {
          clocks.push(formData.object as SourceFromSchema<ClockSchema>);
        }
        else {
          clocks[index] = fu.mergeObject(clocks[index], formData.object as SourceFromSchema<ClockSchema>);
        }
        return this.clock.parent.parent.update({"system.clocks": clocks});
      }

      return game.ptr.clocks.db.updateClock(
        this.clock.id,
        formData.object as Partial<SourceFromSchema<ClockSchema>>
      );
    }
    return game.ptr.clocks.db.createClock(formData.object as SourceFromSchema<ClockSchema>);
  }
}
