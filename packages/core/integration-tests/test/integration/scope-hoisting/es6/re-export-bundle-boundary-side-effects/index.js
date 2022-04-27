import { OPERATIONAL_EVENT_TYPE } from "./types";

globalThis.output = import("./async").then(({default: v}) => [OPERATIONAL_EVENT_TYPE, v])
