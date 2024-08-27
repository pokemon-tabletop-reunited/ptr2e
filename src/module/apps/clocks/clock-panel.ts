import Clock from "@module/data/models/clock.ts";
import { HandlebarsRenderOptions } from "types/foundry/common/applications/handlebars-application.ts";
import ClockEditor from "./clock-editor.ts";
import Sortable from "sortablejs";

export default class ClockPanel extends foundry.applications.api.HandlebarsApplicationMixin(
  foundry.applications.api.ApplicationV2
) {
  public refresh = fu.debounce(this.render, 100);

  static override DEFAULT_OPTIONS = fu.mergeObject(
    super.DEFAULT_OPTIONS,
    {
      classes: ["clock-panel sheet"],
      tag: "aside",
      position: {
        width: 300,
        height: "auto",
      },
      window: {
        minimizable: false,
        frame: false,
        positioned: false,
      },
      actions: {
        "add-clock": ClockPanel.#onAddClock,
      },
    },
    { inplace: false }
  );

  static override PARTS = {
    clocks: {
      id: "clocks",
      template: "/systems/ptr2e/templates/apps/clocks/clock-panel.hbs",
    },
  };

  get clocks() {
    return game.ptr.clocks.db.clocks;
  }

  _getClock(id: string): Clock | undefined {
    return game.ptr.clocks.db.get(id);
  }

  override async _renderFrame(options: HandlebarsRenderOptions) {
    const frame = await super._renderFrame(options);
    if (game.user.isGM) frame.classList.add("editable");
    this.window.close?.remove();
    return frame;
  }

  override async _prepareContext() {
    const context = (await super._prepareContext()) ?? {};
    const isGM = game.user.isGM;
    const clocks = isGM ? this.clocks : this.clocks.filter((c) => !c.private);

    return {
      ...context,
      clocks,
      editable: isGM,
    };
  }

  override _attachPartListeners(
    partId: string,
    htmlElement: HTMLElement,
    options: HandlebarsRenderOptions
  ): void {
    super._attachPartListeners(partId, htmlElement, options);
    if (partId === "clocks") {
      for (const clock of htmlElement.querySelectorAll(".clock")) {
        clock.addEventListener("click", (event) => {
          event.preventDefault();
          const id = (event.target as HTMLElement)
            .closest("[data-id]")
            ?.getAttribute("data-id");
          const clock = this._getClock(id as string);
          if (!clock) return;

          return game.ptr.clocks.db.updateClock(clock.id, {
            value: clock.value >= clock.max ? 0 : clock.value + 1,
          });
        });
        clock.addEventListener("contextmenu", (event) => {
          event.preventDefault();
          const id = (event.target as HTMLElement)
            .closest("[data-id]")
            ?.getAttribute("data-id");
          const clock = this._getClock(id as string);
          if (!clock) return;

          return game.ptr.clocks.db.updateClock(clock.id, {
            value: clock.value <= 0 ? clock.max : clock.value - 1,
          });
        });
      }
      for (const editButton of htmlElement.querySelectorAll("[data-action=edit-clock]")) {
        editButton.addEventListener("click", async (event) => {
          event.preventDefault();
          const id = (event.target as HTMLElement)
            .closest("[data-id]")
            ?.getAttribute("data-id");
          const clock = this._getClock(id as string);
          if (!clock) return;

          return ClockPanel.#onAddClock.bind(this)(event, clock);
        });
      }
      for (const deleteButton of htmlElement.querySelectorAll("[data-action=delete-clock]")) {
        deleteButton.addEventListener("click", async (event) => {
          event.preventDefault();
          const id = (event.target as HTMLElement)
            .closest("[data-id]")
            ?.getAttribute("data-id");
          const clock = this._getClock(id as string);
          if (!clock) return;

          return await foundry.applications.api.DialogV2.prompt({
            buttons: [
              {
                action: "ok",
                label: game.i18n.localize("PTR2E.Clocks.Global.Delete.Confirm"),
                icon: "fas fa-trash",
                callback: async () => {
                  game.ptr.clocks.db.deleteClock(clock.id);
                },
              },
              {
                action: "cancel",
                label: game.i18n.localize("PTR2E.Clocks.Global.Delete.Cancel"),
                icon: "fas fa-times",
              },
            ],
            content: `<p>${game.i18n.format("PTR2E.Clocks.Global.Delete.Message", {
              label: clock.label,
            })}</p>`,
            window: {
              title: game.i18n.localize("PTR2E.Clocks.Global.Delete.Title"),
            },
          });
        });
      }

      const element = htmlElement.querySelector(".clock-list");
      if (element)
        new Sortable(element as HTMLElement, {
          animation: 200,
          direction: "vertical",
          draggable: ".clock-entry",
          dragClass: "drag-preview",
          ghostClass: "drag-gap",
          onEnd: (event) => {
            const id = event.item.dataset.id!;
            const clock = game.ptr.clocks.db.get(id);
            if (!clock) return;
            const newIndex = event.newDraggableIndex;
            if (newIndex === undefined) return;
            const clocks = this.clocks;
            const targetClock = clocks[newIndex];
            if (!targetClock) return;

            // Don't sort on self
            if (clock.sort === targetClock.sort) return;
            const sortUpdates = SortingHelpers.performIntegerSort(clock, {
              target: targetClock,
              siblings: clocks,
            });
            game.ptr.clocks.db.updateClocks(
              sortUpdates.map((u) => ({ _id: u.target.id, sort: u.update.sort }))
            );
          },
        });
    }
  }

  //TODO: Implement the ability to move the panel freely
  // async enableMove() {
  //     await this.close();
  //     game.ptr.clocks.panel = new ClockPanel({
  //         window: {
  //             positioned: true,
  //             frame: true,
  //         },
  //     });
  //     return game.ptr.clocks.panel.render(true);
  // }
  //
  // override setPosition(position: Partial<ApplicationPosition>): ApplicationPosition {
  //     const newPosition = super.setPosition(position);
  //     game.settings.set("ptr2e", "clocksPosition", newPosition);
  //     return newPosition;
  // }
  // 
  // // The game setting in question
  // game.settings.register("ptr2e", "clocksPosition", {
  //     name: "PTR2E.Settings.ClocksPosition.Name",
  //     hint: "PTR2E.Settings.ClocksPosition.Hint",
  //     scope: "client",
  //     config: false,
  //     type: Object,
  //     default: {
  //         left: 0,
  //         top: "5px"
  //     }
  // });

  static #onAddClock(this: ClockPanel, event: Event, clock?: Clock) {
    event.preventDefault();
    return new ClockEditor({}, clock instanceof Clock ? clock : undefined).render(true);
  }
}
