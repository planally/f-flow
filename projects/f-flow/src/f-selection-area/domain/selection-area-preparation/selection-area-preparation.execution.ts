import { inject, Injectable } from '@angular/core';
import { SelectionAreaPreparationRequest } from './selection-area-preparation.request';
import { Point } from '@foblex/2d';
import { FExecutionRegister, FMediator, IExecution } from '@foblex/mediator';
import { FComponentsStore } from '../../../f-storage';
import { SelectionAreaDragHandle } from '../selection-area.drag-handle';
import { FDraggableDataContext } from '../../../f-draggable';
import { isValidEventTrigger } from '../../../domain';

@Injectable()
@FExecutionRegister(SelectionAreaPreparationRequest)
export class SelectionAreaPreparationExecution implements IExecution<SelectionAreaPreparationRequest, void> {

  private _fMediator = inject(FMediator);
  private _fComponentsStore = inject(FComponentsStore);
  private _fDraggableDataContext = inject(FDraggableDataContext);

  private get _fHost(): HTMLElement {
    return this._fComponentsStore.fFlow!.hostElement;
  }

  public handle(request: SelectionAreaPreparationRequest): void {
    if (!this._isValid(request)) {
      return;
    }
    this._fDraggableDataContext.draggableItems = [
      new SelectionAreaDragHandle(
        this._fComponentsStore, request.fSelectionArea, this._fDraggableDataContext, this._fMediator
      )
    ];

    this._fDraggableDataContext.onPointerDownScale = 1;
    this._fDraggableDataContext.onPointerDownPosition = Point.fromPoint(request.event.getPosition())
      .elementTransform(this._fHost);
  }

  private _isValid(request: SelectionAreaPreparationRequest): boolean {
    return this._fDraggableDataContext.isEmpty()
      && isValidEventTrigger(request.event.originalEvent, request.fTrigger);
  }
}
