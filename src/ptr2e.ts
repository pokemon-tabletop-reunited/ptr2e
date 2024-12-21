import { PTRHooks } from "@scripts/hooks/index.ts";
import "./styles/index.less";
import "nouislider/dist/nouislider.min.css";
import Sortable, { MultiDrag } from "sortablejs";

Sortable.mount(new MultiDrag());

PTRHooks.listen();