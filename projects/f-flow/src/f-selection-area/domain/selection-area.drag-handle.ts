import { IPoint, Point, RectExtensions } from '@foblex/2d';
import { FComponentsStore, NotifyTransformChangedRequest } from '../../f-storage';
import { GetCanBeSelectedItemsRequest, ICanBeSelected } from '../../domain';
import { FMediator } from '@foblex/mediator';
import { FDraggableDataContext, IDraggableItem } from '../../f-draggable';
import { FSelectionAreaBase } from '../f-selection-area-base';
import { ICanChangeSelection } from '../../mixins';

export class SelectionAreaDragHandle implements IDraggableItem {

  private _canBeSelected: ICanBeSelected[] = [];
  private _selectedByMove: ICanChangeSelection[] = [];

  private get canvasPosition(): Point {
    return Point.fromPoint(this.fComponentsStore.fCanvas!.transform.position)
      .add(this.fComponentsStore.fCanvas!.transform.scaledPosition);
  }

  constructor(
    private fComponentsStore: FComponentsStore,
    private fSelectionArea: FSelectionAreaBase,
    private fDraggableDataContext: FDraggableDataContext,
    private fMediator: FMediator,
  ) {
  }

  public prepareDragSequence(): void {
    this._canBeSelected = this.fMediator.send(new GetCanBeSelectedItemsRequest());

    this.fSelectionArea.show();
    this.fSelectionArea.draw(
      RectExtensions.initialize(
        this.fDraggableDataContext.onPointerDownPosition.x,
        this.fDraggableDataContext.onPointerDownPosition.y
      )
    );
  }

  public onPointerMove(difference: IPoint): void {
    const currentPoint = Point.fromPoint(difference).add(this.fDraggableDataContext.onPointerDownPosition);
    const x: number = Math.min(this.fDraggableDataContext.onPointerDownPosition.x, currentPoint.x);
    const y: number = Math.min(this.fDraggableDataContext.onPointerDownPosition.y, currentPoint.y);

    const width = Math.abs(difference.x);
    const height = Math.abs(difference.y);

    this.fSelectionArea.draw(
      RectExtensions.initialize(x, y, width, height)
    );
    this._selectedByMove = [];
    this._canBeSelected.forEach((item) => {
      item.element.deselect();

      const itemRect = RectExtensions.addPoint(item.rect, this.canvasPosition);

      const isIntersect = RectExtensions.intersectionWithRect(itemRect, RectExtensions.initialize(x, y, width, height));
      if (isIntersect) {

        item.element.select();
        this._selectedByMove.push(item.element);
      }
    });
    this.fMediator.send<void>(new NotifyTransformChangedRequest());
  }

  public onPointerUp(): void {
    this.fSelectionArea.hide();
    this.fDraggableDataContext.selectedItems.push(...this._selectedByMove);
    if (this._selectedByMove.length > 0) {
      this.fDraggableDataContext.isSelectedChanged = true;
    }
  }
}
