import { PerkWebApp } from "@module/apps/perk-web/perk-web-v2.ts";

export function initializeKeybindings() {
  function getPerkWeb() {
    return foundry.applications.instances.get("perk-web-app") as PerkWebApp | undefined;
  }

  game.keybindings.register("ptr2e", "perk-zoom-in", {
    name: "PTR2E.Keybindings.PerkZoomIn.Name",
    hint: "PTR2E.Keybindings.PerkZoomIn.Hint",
    restricted: false,
    uneditable: [{ key: game.i18n.localize("Left-Click") }, { key: "NumpadAdd" }],
    editable: [],
    onDown: () => getPerkWeb()?.zoomIn(),
  });

  game.keybindings.register("ptr2e", "perk-zoom-out", {
    name: "PTR2E.Keybindings.PerkZoomOut.Name",
    hint: "PTR2E.Keybindings.PerkZoomOut.Hint",
    restricted: false,
    uneditable: [{ key: game.i18n.localize("Right-Click") }, { key: "NumpadSubtract" }],
    editable: [],
    onDown: () => getPerkWeb()?.zoomOut(),
  });

  game.keybindings.register("ptr2e", "panUp", {
    name: "PTR2E.Keybindings.PanUp.Name",
    hint: "PTR2E.Keybindings.PanUp.Hint",
    uneditable: [
      { key: "ArrowUp" },
      { key: "Numpad8" }
    ],
    editable: [
      { key: "KeyW" }
    ],
    onUp: context => getPerkWeb()?.onPan(context, [ClientKeybindings.MOVEMENT_DIRECTIONS.UP]),
    onDown: context => getPerkWeb()?.onPan(context, [ClientKeybindings.MOVEMENT_DIRECTIONS.UP]),
    repeat: true
  });

  game.keybindings.register("ptr2e", "panLeft", {
    name: "PTR2E.Keybindings.PanLeft.Name",
    hint: "PTR2E.Keybindings.PanLeft.Hint",
    uneditable: [
      { key: "ArrowLeft" },
      { key: "Numpad4" }
    ],
    editable: [
      { key: "KeyA" }
    ],
    onUp: context => getPerkWeb()?.onPan(context, [ClientKeybindings.MOVEMENT_DIRECTIONS.LEFT]),
    onDown: context => getPerkWeb()?.onPan(context, [ClientKeybindings.MOVEMENT_DIRECTIONS.LEFT]),
    repeat: true
  });

  game.keybindings.register("ptr2e", "panDown", {
    name: "PTR2E.Keybindings.PanDown.Name",
    hint: "PTR2E.Keybindings.PanDown.Hint",
    uneditable: [
      { key: "ArrowDown" },
      { key: "Numpad2" }
    ],
    editable: [
      { key: "KeyS" }
    ],
    onUp: context => getPerkWeb()?.onPan(context, [ClientKeybindings.MOVEMENT_DIRECTIONS.DOWN]),
    onDown: context => getPerkWeb()?.onPan(context, [ClientKeybindings.MOVEMENT_DIRECTIONS.DOWN]),
    repeat: true
  });

  game.keybindings.register("ptr2e", "panRight", {
    name: "PTR2E.Keybindings.PanRight.Name",
    hint: "PTR2E.Keybindings.PanRight.Hint",
    uneditable: [
      { key: "ArrowRight" },
      { key: "Numpad6" }
    ],
    editable: [
      { key: "KeyD" }
    ],
    onUp: context => getPerkWeb()?.onPan(context, [ClientKeybindings.MOVEMENT_DIRECTIONS.RIGHT]),
    onDown: context => getPerkWeb()?.onPan(context, [ClientKeybindings.MOVEMENT_DIRECTIONS.RIGHT]),
    repeat: true
  });

  game.keybindings.register("ptr2e", "panUpLeft", {
    name: "PTR2E.Keybindings.PanUpLeft.Name",
    hint: "PTR2E.Keybindings.PanUpLeft.Hint",
    uneditable: [
      { key: "Numpad7" }
    ],
    onUp: context => getPerkWeb()?.onPan(context,
      [ClientKeybindings.MOVEMENT_DIRECTIONS.UP, ClientKeybindings.MOVEMENT_DIRECTIONS.LEFT]),
    onDown: context => getPerkWeb()?.onPan(context,
      [ClientKeybindings.MOVEMENT_DIRECTIONS.UP, ClientKeybindings.MOVEMENT_DIRECTIONS.LEFT]),
    repeat: true
  });

  game.keybindings.register("ptr2e", "panUpRight", {
    name: "PTR2E.Keybindings.PanUpRight.Name",
    hint: "PTR2E.Keybindings.PanUpRight.Hint",
    uneditable: [
      { key: "Numpad9" }
    ],
    onUp: context => getPerkWeb()?.onPan(context,
      [ClientKeybindings.MOVEMENT_DIRECTIONS.UP, ClientKeybindings.MOVEMENT_DIRECTIONS.RIGHT]),
    onDown: context => getPerkWeb()?.onPan(context,
      [ClientKeybindings.MOVEMENT_DIRECTIONS.UP, ClientKeybindings.MOVEMENT_DIRECTIONS.RIGHT]),
    repeat: true
  });

  game.keybindings.register("ptr2e", "panDownLeft", {
    name: "PTR2E.Keybindings.PanDownLeft.Name",
    hint: "PTR2E.Keybindings.PanDownLeft.Hint",
    uneditable: [
      { key: "Numpad1" }
    ],
    onUp: context => getPerkWeb()?.onPan(context,
      [ClientKeybindings.MOVEMENT_DIRECTIONS.DOWN, ClientKeybindings.MOVEMENT_DIRECTIONS.LEFT]),
    onDown: context => getPerkWeb()?.onPan(context,
      [ClientKeybindings.MOVEMENT_DIRECTIONS.DOWN, ClientKeybindings.MOVEMENT_DIRECTIONS.LEFT]),
    repeat: true
  });

  game.keybindings.register("ptr2e", "panDownRight", {
    name: "PTR2E.Keybindings.PanDownRight.Name",
    hint: "PTR2E.Keybindings.PanDownRight.Hint",
    uneditable: [
      { key: "Numpad3" }
    ],
    onUp: context => getPerkWeb()?.onPan(context,
      [ClientKeybindings.MOVEMENT_DIRECTIONS.DOWN, ClientKeybindings.MOVEMENT_DIRECTIONS.RIGHT]),
    onDown: context => getPerkWeb()?.onPan(context,
      [ClientKeybindings.MOVEMENT_DIRECTIONS.DOWN, ClientKeybindings.MOVEMENT_DIRECTIONS.RIGHT]),
    repeat: true
  });
}