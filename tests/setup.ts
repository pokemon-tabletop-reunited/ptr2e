import { MockActor } from "./mocks/actor.ts";
import { MockItem } from "./mocks/item.ts";
import { MockToken } from "./mocks/token.ts";

// @ts-expect-error - global augmentation
global.game = Object.freeze({
    settings: Object.freeze({
        get: (_module: string, settingKey: string) => {
            switch (settingKey) {
                default:
                    throw new Error("Undefined setting.");
            }
        },
    }),
    ptr: {  },
    user: {},
    i18n: {
        localize: (path: string) => path,
    },
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(global as any).Actor = MockActor;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(global as any).Item = MockItem;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(global as any).Token = MockToken;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(global as any).FormApplication = class {};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(global as any).Roll = class {};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(global as any).Application = class {};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(global as any).Hooks = class {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
    static on(..._args: any) {}
};

Math.clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);