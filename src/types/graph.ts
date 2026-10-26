import type { components, operations } from "../generated/schema";

type Schemas = components["schemas"];

/**
 * A node of the paper graph, discriminated by `type`. Narrow on `type` to get
 * the matching `data`, e.g. `if (node.type === "table") node.data?.cells`.
 */
export type PaperNodeSchema = Schemas["PaperNode"];
export type PaperNodeType = PaperNodeSchema["type"];

/** A table, `data` holds its cells and insights once enriched */
export type PaperTableNodeSchema = Schemas["PaperTableNode"];
/** A chart, `data` holds its classification and insights once enriched */
export type PaperChartNodeSchema = Schemas["PaperChartNode"];
/** An image, header image or footer image, `data` holds its classification once enriched */
export type PaperImageNodeSchema = Schemas["PaperImageNode"];
/** A document or paragraph title, `data` holds its heading level */
export type PaperTitleNodeSchema = Schemas["PaperTitleNode"];
/** Any other text node, `data` is always `null` */
export type PaperTextNodeSchema = Schemas["PaperTextNode"];

export type PaperNodeMeta = Schemas["PaperNodeMeta"];
export type NodeTextRef = Schemas["NodeTextRef"];

export type NodeTableData = Schemas["NodeTableData"];
export type NodeTableCell = Schemas["NodeTableCell"];
export type NodeChartData = Schemas["NodeChartData"];
export type NodeImageData = Schemas["NodeImageData"];
export type NodeImageObject = Schemas["NodeImageObject"];
export type NodeImageEntity = Schemas["NodeImageEntity"];
export type NodeTitleData = Schemas["NodeTitleData"];
export type NodeInsight = Schemas["NodeInsight"];
export type NodeImportance = Schemas["NodeImportance"];

export type PaperGraphParams = Omit<
  NonNullable<operations["listPaperGraphNodes"]["parameters"]["query"]>,
  "next" | "prev"
>;
