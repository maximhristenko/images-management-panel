import {
  Action,
  ActionCreator
} from 'redux';
import {
  Image
} from '../models';

export const ADD_IMAGE = '[Image] Add';
export interface AddImageAction extends Action {
  image: Image;
}
export const addImage: ActionCreator<AddImageAction> =
  (image) => ({
    type: ADD_IMAGE,
    image: image
  });


export const SELECT_IMAGE = '[Image] Select';
export interface SelectImageAction extends Action {
    image: Image;
}
export const selectImage: ActionCreator<SelectImageAction> =
  (image) => {
    return{
    type: SELECT_IMAGE,
    image: image
  }};

export const EDIT_IMAGE = '[Image] Edit';
export interface EditImageAction extends Action {
    image: Image;
}
export const editImage: ActionCreator<EditImageAction> =
    (image) => {
        return{
            type: EDIT_IMAGE,
            image: image
        }};

export const REMOVE_IMAGE = '[Image] Remove';
export interface RemoveImageAction extends Action {
    id: string;
}
export const removeImage: ActionCreator<RemoveImageAction> =
    (id) => {
        return{
            type: REMOVE_IMAGE,
            id: id
        }};

