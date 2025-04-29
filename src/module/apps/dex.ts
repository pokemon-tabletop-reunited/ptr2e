import { ActorPTR2e } from "@actor";
import { ApplicationV2Expanded } from "./appv2-expanded.ts";
import { sluggify } from "@utils";
import { HandlebarsRenderOptions } from "types/foundry/common/applications/handlebars-application.ts";
import { ChoiceSetPrompt } from "@module/effects/changes/choice-set/prompt.ts";
import FolderPTR2e from "@module/folder/document.ts";

export class DexApp extends foundry.applications.api.HandlebarsApplicationMixin(ApplicationV2Expanded) {
  static override DEFAULT_OPTIONS = fu.mergeObject(
    super.DEFAULT_OPTIONS,
    {
      tag: "aside",
      classes: ["ptr2e", "sheet", "dex-sheet"],
      position: {
        height: 620,
        width: 455,
      },
      window: {
        minimizable: true,
        resizable: true,
        controls: [
          {
            action: "sync",
            icon: "fas fa-sync",
            label: "PTR2E.ActorSheet.DexSync",
            visible: () => game.user.isGM,
          }
        ]
      },
      actions: {
        "sync": async function(this: DexApp) {
          const teams = this.actor.system.party?.teamMemberOf ?? [];
          const players = game.users.contents.flatMap(u => u.character ?? []).filter(u => u !== this.actor);
          const options = [
            ...teams.flatMap(t => {
              const folder = game.folders.get(t);
              if(!folder) return [];
              return {label: `Team: ${folder.name}`, value: folder.id};
            }),
            ...players.map(p => ({ label: p.name, value: p.id, img: p.img }))
          ]

          const prompt = new ChoiceSetPrompt({
            choices: options, 
            title: game.i18n.localize("PTR2E.ActorSheet.DexSyncPrompt.Title"),
            prompt: "PTR2E.ActorSheet.DexSyncPrompt.Prompt", 
            containsItems: false,
            allowedDrops: null,
            item: null
          });

          const result = await prompt.resolveSelection(true);
          if(!result || typeof result.value !== "string") return;

          const toUpdate: string[] = [];
          if(teams.includes(result.value)) {
            const team = game.folders.get(result.value) as FolderPTR2e
            if(team) {
              const members = team.team;
              for(const member of members) {
                const actor = await fromUuid<ActorPTR2e>(member);
                if(!actor || actor.pack) continue;

                toUpdate.push(actor.id);
              }
            }
          }
          else {
            toUpdate.push(result.value);
          }

          if(!toUpdate.length) return void ui.notifications.warn("PTR2E.ActorSheet.DexSyncPrompt.NoResult", {localize: true});

          const dex = this.actor.toObject().system.details.dex;
          await Actor.updateDocuments(toUpdate.map(id => ({_id: id, "system.details.dex": dex})));
          ui.notifications.info("PTR2E.ActorSheet.DexSyncPrompt.Success", {localize: true});
        }
      }
    },
    { inplace: false }
  );

  static override PARTS: Record<string, foundry.applications.api.HandlebarsTemplatePart> = {
    search: {
      id: "search",
      template: "systems/ptr2e/templates/apps/dex-search.hbs",
    },
    dex: {
      id: "dex",
      template: "systems/ptr2e/templates/apps/dex.hbs",
      scrollable: [".scroll"],
    },
  };

  actor: ActorPTR2e;
  filter: SearchFilter;

  constructor(actor: ActorPTR2e, options: Partial<foundry.applications.api.ApplicationConfiguration> = {}) {
    options.id = `dex-${actor.id || fu.randomID()}`;
    super(options);
    this.actor = actor;
    this.filter = new SearchFilter({
      inputSelector: "input[name='search']",
      contentSelector: ".dex.scroll",
      callback: this._onSearchFilter.bind(this),
    })
  }

  override get title() {
    return `${this.actor.name} - ${game.i18n.localize("PTR2E.ActorSheet.Dex")}`;
  }

  override async _prepareContext() {
    const data = Array.from(await game.packs.get("ptr2e.core-species")?.getIndex({ fields: ["system.slug", "system.number", "system.form"] }) ?? []).flatMap(i => {
      const form = i.system.form;
      const slug = i.system.slug || sluggify(i.name)
      const fullSlug = slug + (form?.length ? `-${form}` : "");
      const data = game.ptr.data.artMap.get(slug);
      if (!data || !data.data.extensions?.length) return []
      const state = this.actor.system.details.dex.get(fullSlug)?.state || "unknown";

      const img = form && data.suffixes && data.suffixes[form]
        ? state === "shiny"
          ? data.data.base + "s" + data.suffixes[form] + data.data.extensions[0]
          : data.data.base + data.suffixes[form] + data.data.extensions[0]
        : state === "shiny"
          ? data.data.base + "s" + data.data.extensions[0]
          : data.data.base + data.data.extensions[0];

      return {
        name: i.name,
        slug,
        img,
        state,
        form,
        tooltip: `${i.name}<hr>${state}`,
        number: i.system.number
      }
    }).sort((a, b) => a.number === b.number ? a.name.localeCompare(b.name) : a.number - b.number);

    if (data.length === 0) {
      throw new Error("No species found in the compendium.");
    }

    return {
      id: this.options.id,
      data
    };
  }

  override _attachPartListeners(partId: string, htmlElement: HTMLElement, options: HandlebarsRenderOptions): void {
    super._attachPartListeners(partId, htmlElement, options);
    if (partId === "dex") {
      htmlElement.querySelectorAll<HTMLElement>(".entry").forEach(e => {
        e.addEventListener("click", (event) => DexApp.#handleClick.call(this, event as PointerEvent, e));
        e.addEventListener("contextmenu", (event) => DexApp.#handleClick.call(this, event as PointerEvent, e));
      });
    }
    this.filter.bind(this.element);
  }

  _onSearchFilter(_event: KeyboardEvent, query: string, rgx: RegExp, html: HTMLElement) {
    for (const entry of html.querySelectorAll<HTMLAnchorElement>("div.entry")) {
      if (!query) {
        entry.classList.remove("hidden");
        continue;
      }
      const { slug } = entry.dataset;
      const match = (slug && rgx.test(SearchFilter.cleanQuery(slug)));
      entry.classList.toggle("hidden", !match);
    }
  }

  static #handleClick(this: DexApp, event: PointerEvent, element: HTMLElement) {
    const isLeftClick = event.button === 0;
    const target = element;
    if (target.className !== "entry") return;

    const { slug, state, form } = target.dataset;
    if (!slug || !state) return;
    const fullSlug = slug + (form?.length ? `-${form}` : "");

    const current = this.actor.system.details.dex.get(fullSlug);
    if (!current) {
      const source = this.actor.toObject().system.details.dex as unknown as { slug: string, state: "unknown" | "seen" | "caught" | "shiny" }[];
      source.push({ slug: fullSlug, state: isLeftClick ? "seen" : "shiny" });
      this.actor.update({ system: { details: { dex: source } } });
      target.dataset.state = isLeftClick ? "seen" : "shiny";
      target.dataset.tooltip = `${target.dataset.slug}<hr>${isLeftClick ? "seen" : "shiny"}`;

      if(!isLeftClick) {
        const img = target.querySelector("img");
        if (img) {
          const data = game.ptr.data.artMap.get(slug);
          if (!data || !data.data.extensions?.length) return

          img.src = form && data.suffixes && data.suffixes[form]
            ? data.data.base + "s" + data.suffixes[form] + data.data.extensions[0]
            : data.data.base + "s" + data.data.extensions[0];
        }
      }
      return;
    }

    const source = this.actor.toObject().system.details.dex as unknown as { slug: string, state: "unknown" | "seen" | "caught" | "shiny" }[];
    const index = source.findIndex(i => i.slug === fullSlug);

    const newState = isLeftClick
      ? state === "seen"
        ? "caught"
        : state === "caught"
          ? "shiny"
          : state === "shiny"
            ? "unknown"
            : "seen"
      : state === "seen"
        ? "unknown"
        : state === "caught"
          ? "seen"
          : state === "shiny"
            ? "caught"
            : "shiny";
    if(newState === "unknown") source.splice(index, 1);
    else source[index].state = newState;
    this.actor.update({ system: { details: { dex: source } } });
    target.dataset.state = newState;
    target.dataset.tooltip = `${target.dataset.slug}<hr>${newState}`;

    if (newState === "shiny") {
      const img = target.querySelector("img");
      if (img) {
        const data = game.ptr.data.artMap.get(slug);
        if (!data || !data.data.extensions?.length) return

        img.src = form && data.suffixes && data.suffixes[form]
          ? data.data.base + "s" + data.suffixes[form] + data.data.extensions[0]
          : data.data.base + "s" + data.data.extensions[0];
      }
    }
  }
}