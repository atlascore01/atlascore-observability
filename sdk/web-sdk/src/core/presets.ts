import type { AtlasPlugin } from "./plugin";
import { PageLoad } from "../plugins/page-load";
import { Network } from "../plugins/network";
import { Errors } from "../plugins/errors";
import { Sessions } from "../plugins/sessions";

export type AtlasPresetName = "frontend-standard" | "none";

/**
 * Retorna la lista de plugins asociados a un preset específico.
 *
 * @param name - Nombre del preset
 */
export function getPresetPlugins(name: AtlasPresetName): AtlasPlugin[] {
  switch (name) {
    case "frontend-standard":
      return [
        PageLoad(),
        Network(),
        Errors(),
        Sessions()
      ];
    case "none":
    default:
      return [];
  }
}
