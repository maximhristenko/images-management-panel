/* tslint:disable:typedef */

import {
  Reducer,
  combineReducers 
} from 'redux';


import {
  ImagesState,
  ImagesReducer
} from './ImagesReducer.ts';
export * from './ImagesReducer.ts';

export interface AppState {
  images: ImagesState;
}

const rootReducer: Reducer<AppState> = combineReducers<AppState>({
  images: ImagesReducer
});

export default rootReducer;


