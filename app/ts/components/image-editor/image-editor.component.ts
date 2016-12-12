import {Inject, Component, ViewChild, ElementRef} from '@angular/core';
import {AppStore} from '../../app-store';
import {Store} from 'redux';
import {AppState, getAllImages, getCurrentImage} from '../../reducers';
import {ImageActions} from '../../actions';
import {uuid} from '../../util/uuid';
import * as moment from 'moment';
import {Image} from '../../models/Image';
import {ImageService} from '../../services/mockService';
import {AgGridService} from '../../services/agGridService';

@Component({
    selector: 'image-editor',
    template: require('./image-editor.tpl.html')
})

export class ImageEditor {
    fileUrl: string;
    noImage: string;
    @ViewChild('fileImage') selectedImageFile: ElementRef;
    images: Image[];
    tooltipText: string = '';
    constructor(@Inject(AppStore) private store: Store<AppState>, private service: ImageService, private agGridService: AgGridService) {
        this.noImage = require('images/noimage.png');
    }

    public onChangeToolTip(value): void {
        this.tooltipText = value;
        this.tooltipText !== '' ? this.hideRequiredFeild('tooltop-text-container') : null;
    }

    public onChangeFileImage(event): void {
        if (event.srcElement.files && event.srcElement.files[0]) {
            let file = event.srcElement.files[0];
            let reader: any;
            reader = new FileReader();
            reader.onload = (imgsrc: any) => {
                let extension = file.name.slice((Math.max(0, file.name.lastIndexOf('.')) || Infinity) + 1).toLowerCase();
                let number = Math.random(); // 0.9394456857981651
                number.toString(36); // '0.xtis06h6'
                // let fileName = number.toString(36).substr(2, 9) + '.' + extension; // 'xtis06h6'
                if (['png', 'jpg', 'jpeg', 'gif'].indexOf(extension) !== -1) {
                    this.fileUrl = imgsrc.target.result;
                    $('#image-preview').css('background-image', `url(${this.fileUrl})`);
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
        return this.tooltipText;
    }

    private resetFields(): void {
        $('#image-preview').css('background-image', `url(${require('images/noimage.png')})`);
        this.selectedImageFile.nativeElement.value = '';
        this.tooltipText = '';
        this.agGridService.selectedRow.isSelectedRow = false;
        this.agGridService.selectedRow.rowIndex = null;
    }

    public onAddImage(event: any): void {
        event.preventDefault();
        if (this.agGridService.selectedRow.isSelectedRow) {
            let state = this.store.getState();
            let selectedImage = getCurrentImage(state);
            selectedImage.tooltipText = this.tooltipText;
            let bg = $('#image-preview').css('background-image');
            bg = bg.replace(/.*\s?url\([\'\"]?/, '').replace(/[\'\"]?\).*/, '');
            selectedImage.fileUrl = bg;
            this.service.saveImage(selectedImage).subscribe(
                data => {
                    this.store.dispatch(ImageActions.editImage(data));
                    state = this.store.getState();
                    this.images = getAllImages(state);
                    this.agGridService.gridOptions.rowData = this.images;
                    this.agGridService.gridOptions.api.setRowData(this.agGridService.gridOptions.rowData);
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
            if (this.tooltipText === '') {
                this.showRequiredFeild(selector1);
                isUnfilledRequiredFeilds = true;
            }
            if (isUnfilledRequiredFeilds) {
                return;
            }
            $(`#${selector1} #${selector1}-text,#${selector2} #${selector2}-text`).animate({'opacity': 0}, 300, function () {
                $(this).remove();
            });
            let bg = $('#image-preview').css('background-image');
            bg = bg.replace(/.*\s?url\([\'\"]?/, '').replace(/[\'\"]?\).*/, '');
            let newImage = {
                id: uuid(),
                tooltipText: this.tooltipText,
                fileUrl: bg,
                createdAt: moment(Date.now()).toDate(),
            };
            this.service.addNewImage(newImage).subscribe(
                data => {
                    this.store.dispatch(ImageActions.addImage(data));
                    let state = this.store.getState();
                    this.images = getAllImages(state);
                    this.agGridService.gridOptions.rowData = this.images;
                    this.agGridService.gridOptions.api.setRowData(this.agGridService.gridOptions.rowData);
                    this.resetFields();
                },
                err => console.log(err),
                () => console.log('Saved Image')
            );
        }
    }

    checkSelectedItem(): void {
        if (this.agGridService.selectedRow.isSelectedRow === true) {
            $('#modalConfirmDeletion').modal('show');
        }
    }

    onRemoveSelected(): void {
        $('#modalConfirmDeletion').modal('hide');
        let selectedNodes = this.agGridService.gridOptions.api.getSelectedNodes();
        this.service.deleteImage(selectedNodes[0].data).subscribe(
            () => {
                this.store.dispatch(ImageActions.removeImage(selectedNodes[0].data.id));
                this.agGridService.gridOptions.api.removeItems(selectedNodes);
                this.resetFields();
            },
            err => console.log(err),
            () => console.log('Request for remove image completed successfully')
        );

    }

    ngOnInit() {
        let that = this;
        $('#image-preview-container').hover(
            function () {
                let tooltip = that.getToolTip() || '';
                $(this).append($(`<div class='tooltip-text'  style='opacity:0;'>${tooltip}</div>`)).find('.tooltip-text').animate({'opacity': 1}, 300);
            },
            function () {
                $(this).find('div:last').animate({'opacity': 0}, 300, function () {
                    $(this).remove();
                });
            }
        );

        this.agGridService.selectedRowUpdated.subscribe(
            (selectedRow) => {
                this.tooltipText = selectedRow.image.tooltipText;
                $('#image-preview').css('background-image', `url(${selectedRow.image.fileUrl})`);
            }
        );
    }
}
