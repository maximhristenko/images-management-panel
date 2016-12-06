import {
    Inject,
    Component,
    ViewChild,
    ElementRef
} from '@angular/core';
import {GridOptions} from 'ag-grid/main';
import  'ag-grid/dist/styles/ag-grid.css';
import  'ag-grid/dist/styles/theme-material.css';

interface SelectedRow {
    isSelectedRow: boolean,
    rowIndex: number
}

import {AppStore} from '../app-store';
import {Store} from 'redux';
import {
    AppState,
    getAllImages,
    getCurrentImage
} from '../reducers';

import {ImageActions} from '../actions';
import { uuid } from '../util/uuid';
import * as moment from 'moment';

import {Image} from '../models/Image';
import {ImageService} from '../mockService';

@Component({
    selector: 'admin-page',
    template: require('./image-preview.tpl.html')
})

export default class AdminPage {
    private gridOptions: GridOptions = {};
    @ViewChild('tooltipText') tooltipText;
    fileUrl: string;
    noImage: string;
    selectedRow: SelectedRow = {isSelectedRow: false, rowIndex: null};
    @ViewChild('form') form: any;
    @ViewChild('fileImage') selectedImageFile: ElementRef;
    images: Image[];

    constructor(@Inject(AppStore) private store: Store<AppState>, private service: ImageService) {
        this.noImage = require('images/noimage.png');
        store.subscribe(() => this.updateState());
        this.updateState();
        service.getAllImages().subscribe(
            images => {
                images.forEach(function (image) {
                store.dispatch(ImageActions.addImage(image));
                });
                this.images = images;
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
                console.log("Loaded all images");
            }
        );
    }

    private updateState(): void {
    }

    private onChangeToolTip(value): void {
        this.tooltipText.nativeElement.value = value;
        this.tooltipText.nativeElement.value !== '' ? this.hideRequiredFeild('tooltop-text-container') : null;
    }

    private onChangeFileImage(event): void {
        if (event.srcElement.files && event.srcElement.files[0]) {
            let file = event.srcElement.files[0];
            let reader: any;
            reader = new FileReader();
            reader.onload = (imgsrc: any) => {
                let extension = file.name.slice((Math.max(0, file.name.lastIndexOf(".")) || Infinity) + 1).toLowerCase();
                let number = Math.random(); // 0.9394456857981651
                number.toString(36); // '0.xtis06h6'
                let fileName = number.toString(36).substr(2, 9) + '.' + extension; // 'xtis06h6'
                if (['png', 'jpg', 'jpeg', 'gif'].indexOf(extension) !== -1) {
                    this.fileUrl = imgsrc.target.result;
                    $('#image-preview').css('background-image',`url(${this.fileUrl})`);
                    this.hideRequiredFeild('fileImage-container');
                } else {
                    this.showRequiredFeild('fileImage-container');
                }
            };
            reader.readAsDataURL(file);
        }
    }

    private showRequiredFeild(selector: string): void {
        selector === 'fileImage-container' ? $('#fileImage').focus() : null;
        let requiredFeildText = selector === 'fileImage-container' ? 'Please, select image...' : 'Please, type tooltip text';
        $(`#${selector}`).find(`#${selector}-text`).length === 0 ? $(`#${selector}`).append($(`<div id='${selector}-text'  style='opacity:0;'>${requiredFeildText}</div>`)).find(`#${selector}-text`).animate({'opacity': 1}, 300) : null;
    }

    private hideRequiredFeild(selector: string): void {
        $(`#${selector}`).find(`#${selector}-text`).animate({'opacity': 0}, 300, function () {
            $(this).remove();
        });
    }

    private getToolTip(): any {
        return this.tooltipText.nativeElement.value;
    }

    private resetFields(): void {
        $('#image-preview').css('background-image',`url(${require('images/noimage.png')})`);
        this.selectedImageFile.nativeElement.value = '';
        this.tooltipText.nativeElement.value = '';
        this.selectedRow.isSelectedRow = false;
        this.selectedRow.rowIndex = null;
    }

    private onAddImage(event: any): void {
        event.preventDefault();
        if (this.selectedRow.isSelectedRow) {
            let state = this.store.getState();
            let selectedImage = getCurrentImage(state);
            selectedImage.tooltipText = this.tooltipText.nativeElement.value;
            let bg = $('#image-preview').css('background-image');
            bg = bg.replace(/.*\s?url\([\'\"]?/, '').replace(/[\'\"]?\).*/, '');
            selectedImage.fileUrl = bg;
            this.service.saveImage(selectedImage).subscribe(
                data => {
                    this.store.dispatch(ImageActions.editImage(data));
                    state = this.store.getState();
                    this.images = getAllImages(state);
                    this.gridOptions.rowData = this.images;
                    this.gridOptions.api.setRowData(this.gridOptions.rowData);
                    this.resetFields();
                },
                err => console.log(err),
                () => console.log('Updated image')
            );
        } else {
            let isUnfilledRequiredFeilds = false;
            let selector1 = 'tooltop-text-container', selector2 = 'fileImage-container';
            if (this.selectedImageFile.nativeElement.files.length === 0) {
                this.showRequiredFeild(selector2);
                isUnfilledRequiredFeilds = true;
            }
            if (this.tooltipText.nativeElement.value === '') {
                this.showRequiredFeild(selector1);
                isUnfilledRequiredFeilds = true;
            }
            if (isUnfilledRequiredFeilds) return;
            $(`#${selector1} #${selector1}-text,#${selector2} #${selector2}-text`).animate({'opacity': 0}, 300, function () {
                $(this).remove();
            });
            let bg = $('#image-preview').css('background-image');
            bg = bg.replace(/.*\s?url\([\'\"]?/, '').replace(/[\'\"]?\).*/, '');
            let newImage = {
                id: uuid(),
                tooltipText: this.tooltipText.nativeElement.value,
                fileUrl: bg,
                createdAt: moment(Date.now()).toDate(),
            };
            this.service.addNewImage(newImage).subscribe(
                data => {
                    this.store.dispatch(ImageActions.addImage(data));
                    let state = this.store.getState();
                    this.images = getAllImages(state);
                    this.gridOptions.rowData = this.images;
                    this.gridOptions.api.setRowData(this.gridOptions.rowData);
                    this.resetFields();
                },
                err => console.log(err),
                () => console.log('Saved Image')
            )
        }
    }

    checkSelectedItem(): void {
        if (this.selectedRow.isSelectedRow === true) {
            $('#modalConfirmDeletion').modal('show');
        }
    }

    onRemoveSelected(): void {
        $('#modalConfirmDeletion').modal('hide');
        let selectedNodes = this.gridOptions.api.getSelectedNodes();

        this.service.deleteImage(selectedNodes[0].data).subscribe(
            () => {
                let midx = -1;
                this.images.forEach( (t, idx) => {
                    if (t.id == selectedNodes[0].data.id) {
                        midx = idx;
                    }
                });
                this.images.splice(midx, 1);
                this.store.dispatch(ImageActions.removeImage(selectedNodes[0].data.id));
                this.gridOptions.api.removeItems(selectedNodes);
                this.resetFields();
            },
            err => console.log(err),
            () => console.log('Request for remove image completed successfully')
        );
    }

    private onSelectionChanged(image) {
      /* this.service.loadImageById(image.data.id).subscribe(
            data => {
                console.log(image.data. );
            },
            err => console.log(err),
            () => console.log("Loaded images with id " + image.data.id)
        );*/
        this.store.dispatch(ImageActions.selectImage(image.data));
        let state = this.store.getState();
        let selectedImage = getCurrentImage(state);
        this.tooltipText.nativeElement.value = selectedImage.tooltipText;
        $('#image-preview').css('background-image',`url(${selectedImage.fileUrl})`);
        this.selectedRow.isSelectedRow = true;
        this.selectedRow.rowIndex = image.rowIndex;
    }

    ngOnInit() {
        let that = this;
        $('#image-preview-container').hover(function () {
                let tooltip = that.getToolTip() || '';
                $(this).append($(`<div class='tooltip-text'  style='opacity:0;'>${tooltip}</div>`)).find('.tooltip-text').animate({'opacity': 1}, 300);
            }
            , function () {
                $(this).find("div:last").animate({'opacity': 0}, 300, function () {
                    $(this).remove();
                });
            }
        );

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

    private onQuickFilterChanged($event) {
        this.gridOptions.api.setQuickFilter($event.target.value);
    }

    imagePreviewCellRenderer(field) {
        return `<div style="background-image: url('${field.data.fileUrl}')" class="thumb-image-background"></div>`;
    }

    private createColumnDefs() {
        return [
            {
                headerName: "Tooltip text",
                field: "tooltipText",
            },
            {
                headerName: "Image preview",
                field: "fileUrl",
                cellRenderer: this.imagePreviewCellRenderer,
            }
        ];
    }

    private createRowData() {
        let state = this.store.getState();
        return this.images = getAllImages(state);
    }

}
