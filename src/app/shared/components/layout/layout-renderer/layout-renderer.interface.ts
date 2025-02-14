export type ILayoutRendererMode = 'view' | 'edit';

export interface ILayoutRendererOptions {
  mode: ILayoutRendererMode;
  emptyMessage: string;
  showEmptyState?: boolean;
  dragEnabled?: boolean;
}
