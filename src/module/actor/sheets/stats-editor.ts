import { ApplicationV2Expanded } from "@module/apps/appv2-expanded.ts";
import { StatsChart } from "./stats-chart.ts";
import ActorPTR2e from "@actor/base.ts";
import { HandlebarsRenderOptions } from "types/foundry/common/applications/api.js";
import noUiSlider from "nouislider";
import { Attribute } from "@actor/data.ts";
import { Stat } from "@data";

class StatsEditor extends foundry.applications.api.HandlebarsApplicationMixin(ApplicationV2Expanded) {
  _statsChart: StatsChart;
  actor: ActorPTR2e;

  constructor(options: Partial<foundry.applications.api.DocumentSheetConfiguration<ActorPTR2e>>) {
    const actor = options.document;
    if (!actor) throw new Error("StatsEditor requires an actor");
    options.id = `stats-editor-${actor.id}`;
    super(options);
    this.actor = actor;
    this._statsChart = new StatsChart(this, {});
  }

  get document(): ActorPTR2e {
    return this.actor;
  }

  static override DEFAULT_OPTIONS = {
    classes: ["stats-editor", "sheet", "default-sheet", "standard-form"],
    position: {
      height: 660,
      width: 685
    },
    window: {
      resizable: true
    }
  }

  static override PARTS = {
    base: {
      id: "base-stats",
      template: "systems/ptr2e/templates/actor/stats/base.hbs",
    },
    evs: {
      id: "ev-stats",
      template: "systems/ptr2e/templates/actor/stats/evs.hbs",
    },
    ivs: {
      id: "iv-stats",
      template: "systems/ptr2e/templates/actor/stats/ivs.hbs",
    },
    underdog: {
      id: "underdog-stats",
      template: "systems/ptr2e/templates/actor/stats/underdog.hbs",
    },
    chart: {
      id: "stats-chart",
      template: "systems/ptr2e/templates/actor/stats/chart.hbs",
    }
  }

  override get title(): string {
    return `${this.actor.name}'s ${game.i18n.localize("PTR2E.ActorSheet.StatsFormTitle")}`;
  }

  override _configureRenderOptions(options: foundry.applications.api.HandlebarsRenderOptions): void {
    super._configureRenderOptions(options);
    const hidden = new Set<string>(["underdog", "ivs"]);

    options.parts = options.parts?.filter(part => !hidden.has(part));
  }

  override async _prepareContext(options?: foundry.applications.api.HandlebarsRenderOptions | undefined) {
    const context = await super._prepareContext(options) as Record<string, unknown>;

    context.stats = this.actor.system.attributes
    context.isPokemon = this.actor.isPokemon();

    return context;
  }

  override async _preparePartContext(partId: string, _context: foundry.applications.api.ApplicationRenderContext) {
    const context = await super._preparePartContext(partId, _context);

    return context;
  }

  debouncedBaseStatUpdate = foundry.utils.debounce(this.updateBaseStats.bind(this), 800);
  debouncedEVsUpdate = foundry.utils.debounce(this.updateEVs.bind(this), 800);

  sliders: {
    base: Record<Stat, noUiSlider.API>,
    ev: Record<Stat, noUiSlider.API>,
    updates: {
      base: boolean,
      ev: boolean
    }
  } = {
      //@ts-expect-error - Don't initialize.
      base: {},
      //@ts-expect-error - Don't initialize.
      ev: {},
      updates: {
        base: false,
        ev: false
      }
    };

  override _attachPartListeners(partId: string, htmlElement: HTMLElement, options: HandlebarsRenderOptions): void {
    super._attachPartListeners(partId, htmlElement, options);

    if (partId === "base") {
      const totalElement = htmlElement.querySelector<HTMLSpanElement>(".total-stats")!;

      const attributes = this.actor.system._source.attributes as unknown as Record<Stat, Attribute>;
      for (const key in attributes) {
        const stat: Attribute = attributes[key as Stat] as Attribute;
        const element = htmlElement.querySelector<HTMLElement>(`.form-fields.${key}`)
        if (!element) continue;
        const base = stat.base ?? this.actor.species?.stats[key as Stat] ?? 40;
        const slider = this.sliders.base[key as Stat] = noUiSlider.create(element, {
          range: {
            min: 0,
            "15%": base < 40 ? base : 40,
            ...(base > 100 ? { "85%": 100 } : {}),
            max: base > 100 ? base + 10 : 100
          },
          start: base,
          step: 1,
          connect: "lower",
          padding: [base < 40 ? base : 40, base > 90 && base <= 100 ? Math.abs(base-100) : 10],
          tooltips: true,
          behaviour: "snap",
          format: { to(value) { return Math.floor(value) }, from(value) { return Number(value) } },
          animate: true,
          animationDuration: 900,
        })
        if (base > 90 || this.actor.isPokemon()) {
          slider.disable();
          continue;
        }
        slider.on("update", this.updateLimit.bind(this, {
          sliderKey: "base",
          isBaseStat: true,
          limit: 110,
          min: base < 40 ? base : 40,
          max: 100,
          totalElement,
          updateMethod: this.debouncedBaseStatUpdate.bind(this)
        }));
      }
    }

    if (partId === "evs") {
      const totalElement = htmlElement.querySelector<HTMLSpanElement>(".total-stats")!;
      const attributes = this.actor.system._source.attributes;
      for (const key in attributes) {
        const stat: Attribute = attributes[key as Stat] as unknown as Attribute;
        const element = htmlElement.querySelector<HTMLElement>(`.form-fields.${key}`)
        if (!element) continue;
        const slider = this.sliders.ev[key as Stat] = noUiSlider.create(element, {
          range: {
            min: 0,
            max: 200
          },
          start: stat.evs,
          step: 4,
          padding: [0, 0],

          connect: "lower",
          tooltips: true,
          behaviour: "snap",
          format: { to(value) { return Math.floor(value) }, from(value) { return Number(value) } },
          animate: true,
          animationDuration: 900,
        })
        slider.on("update", this.updateLimit.bind(this, {
          sliderKey: "ev",
          isBaseStat: false,
          limit: 512,
          max: 200,
          min: 0,
          totalElement,
          updateMethod: this.debouncedEVsUpdate.bind(this)
        }));
      }
    }

    if(partId === "chart") {
      this._statsChart.render();
    }
  }

  updateLimit(
    {
      sliderKey,
      isBaseStat = false,
      limit,
      min,
      max,
      totalElement,
      updateMethod
    }: {
      sliderKey: keyof Omit<StatsEditor["sliders"], 'updates'>,
      isBaseStat: boolean,
      limit: number,
      min: number,
      max: number,
      totalElement: HTMLSpanElement,
      updateMethod: (this: StatsEditor) => void
    }) {
    const sliders = this.sliders[sliderKey]
    const sliderValues = Object.entries(sliders);
    if (this.sliders.updates[sliderKey] || sliderValues.length !== 6) return;
    const attributes = this.actor.system._source.attributes;
    //@ts-expect-error - Don't initialize.
    const speciesAttributes: Record<Stat, number> = this.actor.species?.stats || {}

    const total = sliderValues.reduce((acc, [stat, slider]) => acc + Number(slider.get()) - (isBaseStat ? (speciesAttributes[stat as Stat] ?? 40) : 0), 0);
    const available = limit - total;
    this.sliders.updates[sliderKey] = true;
    for (const key in sliders) {
      const s = sliders[key as Stat];
      const value = Number(s.get());

      const stat = attributes[key as Stat] as unknown as Attribute;
      const speciesBase = this.actor.species?.stats[key as Stat] ?? 40;
      const base = (stat.base ?? 40);
      const realMax = isBaseStat ? (base > max ? base + 10 : max) : max;
      s.updateOptions({
        padding: [min === 0 ? min : speciesBase, Math.clamp(Math.abs(value - realMax) - available, isBaseStat ? 10 : 0, realMax - min)]
      }, false)
    }
    this.sliders.updates[sliderKey] = false;
    totalElement.textContent = total.toString();
    updateMethod.call(this);
  }

  async updateBaseStats() {
    const attributes = this.actor.system.attributes;
    const updates: Record<string, number> = {}
    for (const key in attributes) {
      const slider = this.sliders.base[key as Stat]
      if (!slider) continue;
      const value = Number(slider.get());
      updates[`system.attributes.${key}.base`] = value;
    }
    await this.actor.update(updates, { render: false });
    this._statsChart.render();
  }

  async updateEVs() {
    const attributes = this.actor.system.attributes;
    const updates: Record<string, number> = {}
    for (const key in attributes) {
      const slider = this.sliders.ev[key as Stat]
      if (!slider) continue;
      const value = Number(slider.get());
      updates[`system.attributes.${key}.evs`] = value;
    }
    await this.actor.update(updates, { render: false });
    this._statsChart.render();
  }

  override _onClose(options: HandlebarsRenderOptions): void {
    super._onClose(options);
    if (this.actor.sheet.rendered) {
      this.actor.sheet.render(true, { focus: true });
    }
  }
}

export { StatsEditor }