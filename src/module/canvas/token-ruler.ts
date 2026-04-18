import { TokenPTR2e } from "./token/object.ts";

//@ts-expect-error - Incomplete types
export class TokenRulerPTR2e extends foundry.canvas.placeables.tokens.TokenRuler {
  declare token: TokenPTR2e;

  static WAYPOINT_LABEL_TEMPLATE = "systems/ptr2e/templates/hud/waypoint-label.hbs";

  // @ts-expect-error - Incomplete types
  override _getWaypointLabelContext(waypoint: Readonly<TokenRulerWaypoint>, state: object) {
    const context = super._getWaypointLabelContext(waypoint, state)
    if(!context) return context;

    Object.assign(context, {
      isOverextended: ((waypoint as unknown as { availableMovement?: number }).availableMovement ?? 0) < 0,
    })

    return context;
  }

  // @ts-expect-error - Incomplete types
  override refresh({ passedWaypoints, pendingWaypoints, plannedMovement }: TokenRulerData) {
    const options = this.getMovementInfo({ passedWaypoints, pendingWaypoints, plannedMovement });

    return super.refresh(options);
  }

  getMovementInfo({ passedWaypoints, pendingWaypoints, plannedMovement }: TokenRulerData) {
    if (!this.token.document?.actor) return { passedWaypoints: passedWaypoints ?? [], pendingWaypoints: pendingWaypoints ?? [], plannedMovement: plannedMovement ?? {} };

    const movements = fu.duplicate(this.token.document.actor.system.movement);
    let highest: typeof movements[string][] = []
    for (const movement in movements) {
      //@ts-expect-error - Unused property so delete it for performance benefit.
      delete movements[movement].type;
      if (!highest.length) {
        highest.push(movements[movement]);
      }
      else if (movements[movement].value > highest[0].value) {
        highest = [movements[movement]];
      } else if (movements[movement].value === highest[0].value) {
        highest.push(movements[movement]);
      }
      movements[movement].available = movements[movement].value;
    }

    let exceededTotal = false;

    passedWaypoints = execute(passedWaypoints) as typeof passedWaypoints;
    pendingWaypoints = execute(pendingWaypoints) as typeof pendingWaypoints;
    const planned: Record<string, TokenPlannedMovement> = {};
    for (const user in plannedMovement) {
      const waypoint = plannedMovement[user];
      if (!waypoint) continue;
      planned[user] = fu.duplicate(waypoint);
      planned[user].foundPath = execute(waypoint.foundPath);
    }

    return {
      passedWaypoints: passedWaypoints ?? [],
      pendingWaypoints: pendingWaypoints ?? [],
      plannedMovement: planned ?? {}
    }

    function execute(array: Omit<TokenMeasuredMovementWaypoint, "userId" | "movementId">[]) {
      array = array.map(w => fu.duplicate(w));
      for (const waypoint of array) {
        const move = movements[waypoint.action];
        if (!move) { Object.assign(waypoint, { availableMovement: 0 }); continue; }
        if (exceededTotal || waypoint.forced || !waypoint.cost) { Object.assign(waypoint, { availableMovement: fu.duplicate(move.available) }); continue; }

        if (!highest.find(m => m.method === waypoint.action)) {
          move.available -= waypoint.cost;
        }

        for (const m of highest) {
          m.available -= waypoint.cost;
        }

        Object.assign(waypoint, { availableMovement: fu.duplicate(move.available) });

        const newHighest: typeof highest = [];
        for (const m in movements) {
          movements[m].available = Math.min(movements[m].available, highest[0].available);
          if (movements[m].available == highest[0].available) newHighest.push(movements[m]);
        }
        highest = newHighest;
        if (highest[0].available < 0) {
          exceededTotal = true;
        }
      }
      return array;
    }
  }

  getMovement(type: string) {
    const move = this.token.document?.actor?.getMovement(type);
    if (!move) return null;

    return move;
  }

  colors = {
    immobile: { color: 0x4d0000 }, // Immobile
    start: { color: 0x73ff73 }, // Start square
    overland: { color: 0x43a343 },
    burrow: { color: 0xad6a26 },
    swim: { color: 0x345f94 },
    flight: { color: 0x4ac7c7 },
    threaded: { color: 0x89b848 },
    teleport: { color: 0x9c9c9c },
    exceed: { color: 0x822727 }, // Exceeding move limits
  } as const

  //@ts-expect-error - Incomplete types
  override _getWaypointStyle(waypoint: Readonly<Omit<TokenRulerWaypoint, "index" | "center" | "size" | "ray">>): { radius: number, color?: Color, alpha?: number } {
    const result = super._getWaypointStyle(waypoint) as { radius: number, color?: Color, alpha?: number };
    if (!this.token.actor) return result;

    const move = this.getMovement(waypoint.action);
    if (!move) return result;

    const cost = waypoint.measurement.cost;
    if (cost === 0) {
      if (move.value === 0) return fu.mergeObject(result, this.colors.immobile, { inplace: false });
      return fu.mergeObject(result, this.colors.start, { inplace: false });
    }

    const availableMovement = (waypoint as unknown as { availableMovement?: number }).availableMovement ?? 0;
    if (availableMovement < 0) {
      return fu.mergeObject(result, this.colors.exceed, { inplace: false });
    }

    const colors = this.colors[waypoint.action as keyof typeof this.colors];
    return fu.mergeObject(result, colors ?? this.colors.overland, { inplace: false });
  }

  //@ts-expect-error - Incomplete types
  override _getSegmentStyle(waypoint: Readonly<Omit<TokenRulerWaypoint, "index" | "center" | "size" | "ray">>): { width: number, color?: Color, alpha?: number } {
    const result = super._getSegmentStyle(waypoint) as { width: number, color?: Color, alpha?: number };
    if (!this.token.actor) return result;

    const move = this.getMovement(waypoint.action);
    if (!move) return result;

    const cost = waypoint.measurement.cost;
    if (cost === 0) {
      if (move.value === 0) return fu.mergeObject(result, this.colors.immobile, { inplace: false });
      return fu.mergeObject(result, this.colors.start, { inplace: false });
    }

    const availableMovement = (waypoint as unknown as { availableMovement?: number }).availableMovement ?? 0;
    if (availableMovement < 0) {
      return fu.mergeObject(result, this.colors.exceed, { inplace: false });
    }

    const colors = this.colors[waypoint.action as keyof typeof this.colors];
    return fu.mergeObject(result, colors ?? this.colors.overland, { inplace: false });
  }

  //@ts-expect-error - Incomplete types
  override _getGridHighlightStyle(waypoint: Readonly<Omit<TokenRulerWaypoint, "index" | "center" | "size" | "ray">>, offset: Readonly<GridOffset3D>): {
    color?: Color;
    alpha?: number;
    texture?: PIXI.Texture;
    matrix?: PIXI.Matrix | null;
  } {
    if (!this.token.actor) return super._getGridHighlightStyle(waypoint, offset);

    const move = this.getMovement(waypoint.action);
    if (!move) return super._getGridHighlightStyle(waypoint, offset);

    const cost = waypoint.measurement.cost;

    if (cost === 0) {
      if (move.value === 0) return this.colors.immobile;
      return this.colors.start;
    }

    const availableMovement = (waypoint as unknown as { availableMovement?: number }).availableMovement ?? 0;
    if (availableMovement < 0) {
      return this.colors.exceed;
    }

    const colors = this.colors[waypoint.action as keyof typeof this.colors];
    return colors ?? this.colors.overland;
  }
}