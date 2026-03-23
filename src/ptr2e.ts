import { PTRHooks } from "@scripts/hooks/index.ts";
import "nouislider/dist/nouislider.min.css";
import "./styles/index.less";
import Sortable, { MultiDrag } from "sortablejs";

//@ts-expect-error - V14 Compatability
ActiveEffect.baseDocument._shimChanges = () => {}

Sortable.mount(new MultiDrag());

PTRHooks.listen();