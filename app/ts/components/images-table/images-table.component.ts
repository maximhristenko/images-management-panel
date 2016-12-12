import {Inject, Component} from '@angular/core';
import  'ag-grid/dist/styles/ag-grid.css';
import  'ag-grid/dist/styles/theme-material.css';
import {AppStore} from '../../app-store';
import {Store} from 'redux';
import { AppState} from '../../reducers';
import {ImageActions} from '../../actions';
import {AgGridService} from '../../services/agGridService';

@Component({
    selector: 'images-table',
    template: require('./images-table.tpl.html')
})

export default class ImagesTable {
    constructor(@Inject(AppStore) private store: Store<AppState>, private agGridService: AgGridService) {
    }

    public onSelectionChanged(image) {
        this.store.dispatch(ImageActions.selectImage(image.data));
        this.agGridService.setNewSelectedRow({
            rowIndex: image.rowIndex,
            isSelectedRow: true,
            image: image.data
        });
    }
}
