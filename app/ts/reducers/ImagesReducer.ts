import { Action } from 'redux';
import {
  Image
} from '../models';
import { ImageActions } from '../actions';
import { createSelector } from 'reselect';
import  'lodash';



export interface ImagesEntities {
  [id: string]: Image;
}

export interface ImagesState {
  ids: string[];
  entities: ImagesEntities;
  currentImageId?: string;
}

const initialState: ImagesState = {
  ids: [],
  currentImageId: null,
  entities: {}
};



export const ImagesReducer =
    function(state: ImagesState = initialState, action: Action): ImagesState {
      switch (action.type) {

          // Adds a new Image to the list of entities
        case ImageActions.ADD_IMAGE: {
          const image = (<ImageActions.AddImageAction>action).image;

          if (state.ids.includes(image.id)) {
            return state;
          }

          return {
            ids: [ ...state.ids, image.id ],
            currentImageId: state.currentImageId,
            entities: Object.assign({}, state.entities, {
              [image.id]: image
            })
          };
        }
        // Edits Image
        case ImageActions.EDIT_IMAGE: {
          const image = (<ImageActions.EditImageAction>action).image;

          return {
            ids: state.ids,
            currentImageId: null,
            entities: Object.assign({}, state.entities, {
              [image.id]: image
            })
          };
        }
        // Removes Image
        case ImageActions.REMOVE_IMAGE: {
          const id = (<ImageActions.RemoveImageAction>action).id;
          delete state.entities[id];
          let ids = state.ids.filter(function(i) {
            return i !== id;
          });
          return {
            ids: ids,
            currentImageId: null,
            entities:  state.entities
          };
        }

          // Select a particular IMAGE in the UI
        case ImageActions.SELECT_IMAGE: {
          const image = (<ImageActions.SelectImageAction>action).image;
          const newImage = state.entities[image.id];

          return {
            ids: state.ids,
            currentImageId: image.id,
            entities: Object.assign({}, state.entities, {
              [image.id]: newImage
            })
          };
        }

        default:
          return state;
      }
    };




export const getImagesState = (state): ImagesState => state.images;

export const getImagesEntities = createSelector(
    getImagesState, ( state: ImagesState ) => state.entities );

export const getAllImages = createSelector(
    getImagesEntities, ( entities: ImagesEntities ) => Object.keys(entities)
                        .map((imageId) => entities[imageId]));


// This selector emits the current image
export const getCurrentImage = createSelector(
    getImagesEntities,
    getImagesState, ( entities: ImagesEntities, state: ImagesState ) =>
    entities[state.currentImageId] );


