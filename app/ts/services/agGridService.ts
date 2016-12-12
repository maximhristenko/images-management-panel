import {Inject, Injectable, EventEmitter} from '@angular/core';
import {AppStore} from '../app-store';
import {Store} from 'redux';
import {AppState, getAllImages} from '../reducers';
import {GridOptions} from 'ag-grid/main';
import {ImageActions} from '../actions';
import {ImageService} from './mockService';
import {SelectedRow} from '../models/SelectedRow';

@Injectable()
export class AgGridService {
    public gridOptions: GridOptions = {};
    selectedRow: SelectedRow = {
        rowIndex: null,
        isSelectedRow: false,
        image: null
    };
    selectedRowUpdated: EventEmitter<any> = new EventEmitter();

    constructor(@Inject(AppStore) private store: Store<AppState>, private service: ImageService) {
        service.getAllImages().subscribe(
            images => {
                images.forEach(function (image) {
                    store.dispatch(ImageActions.addImage(image));
                });
                this.gridOptions = {
                    enableColResize: true,
                    rowData: this.createRowData(),
                    columnDefs: this.createColumnDefs(),
                    rowSelection: 'single',
                    enableSorting: true,
                    //   rowModelType: 'virtual',
                    rowHeight: 140,
                    paginationPageSize: 15,
                    paginationOverflowSize: 2,
                    maxConcurrentDatasourceRequests: 2,
                    paginationInitialRowCount: 1,
                    maxPagesInCache: 2,
                    onGridReady: () => this.setRowData(this.createRowData())
                };
            },
            err => console.log(err),
            () => {
               // console.log('Loaded all images');
            }
        );
    }

    public setNewSelectedRow(selectedRow) {
        this.selectedRow = selectedRow;
        this.selectedRowUpdated.emit(this.selectedRow);
    }

    private setRowData(allOfTheData) {
        let dataSource = {
            rowCount: null, // behave as infinite scroll
            getRows: function (params) {
                console.log('asking for ' + params.startRow + ' to ' + params.endRow);
                let rowsThisPage = allOfTheData.slice(params.startRow, params.endRow);
                let lastRow = -1;
                if (allOfTheData.length <= params.endRow) {
                    lastRow = allOfTheData.length;
                }
                params.successCallback(rowsThisPage, lastRow);
            }
        };

        this.gridOptions.api.setDatasource(dataSource);
        this.gridOptions.api.sizeColumnsToFit();
    }

    imagePreviewCellRenderer(field) {
        return `<div style="background-image: url('${field.data.fileUrl}')" class="thumb-image-background"></div>`;
    }

    private createRowData() {
        let state = this.store.getState();
        return getAllImages(state);
    }

    private createColumnDefs() {
        return [
            {
                headerName: 'Tooltip text',
                field: 'tooltipText',
            },
            {
                headerName: 'Image preview',
                field: 'fileUrl',
                cellRenderer: this.imagePreviewCellRenderer,
            }
        ];
    }

}
