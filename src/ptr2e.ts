import { PTRHooks } from "@scripts/hooks/index.ts";
import "nouislider/dist/nouislider.min.css";
import "./styles/index.less";
import Sortable, { MultiDrag } from "sortablejs";

Sortable.mount(new MultiDrag());

PTRHooks.listen();