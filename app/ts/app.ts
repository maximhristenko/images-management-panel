import 'font-awesome/scss/font-awesome.scss';
import {Component} from '@angular/core';
import {NgModule} from '@angular/core';
import {MockBackend} from '@angular/http/testing';
import {Http, BaseRequestOptions} from '@angular/http';
import {BrowserModule} from '@angular/platform-browser';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';
import {FormsModule} from '@angular/forms';
import {createStore, Store, compose, StoreEnhancer} from 'redux';
import {AppStore} from './app-store';
import {AppState, default as reducer} from './reducers';
import {AgGridModule} from 'ag-grid-ng2/main';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/css/bootstrap-theme.css';
import 'bootstrap-material-design/dist/css/bootstrap-material-design.css';
import 'bootstrap-material-design/dist/css/ripples.css';
import '../css/styles.scss';
import 'bootstrap/dist/js/bootstrap.js';
import 'bootstrap-material-design/dist/js/material.js';
import 'bootstrap-material-design/dist/js/ripples.js';


import {AdminPage} from './pages/AdminPage';
import {ImageEditor} from './components/image-editor/image-editor.component';
import ImagesTable from './components/images-table/images-table.component';
import {ImageService} from './services/mockService';
import {AgGridService} from './services/agGridService';
import {MockBackendService} from './services/mockBackendService';


let $ = require('jquery');
$.material.init();
$.material.ripples();

@Component({
    selector: 'admin-app',
    template: `
  <div>
    <admin-page></admin-page>
  </div>
  `
})
class AdminApp {
    constructor( private backend: MockBackendService) {
    }

}

let devtools: StoreEnhancer<AppState> =
    window['devToolsExtension'] ?
        window['devToolsExtension']() : f => f;

let store: Store<AppState> = createStore<AppState>(
    reducer,
    compose(devtools)
);

@NgModule({
    declarations: [
        AdminApp,
        AdminPage,
        ImageEditor,
        ImagesTable
    ],
    imports: [
        BrowserModule,
        FormsModule,
        AgGridModule.withNg2ComponentSupport(),
    ],
    bootstrap: [AdminApp],
    providers: [
        BaseRequestOptions,
        MockBackend,
        ImageService,
        AgGridService,
        MockBackendService,
        {
            provide: AppStore,
            useFactory: () => store,
        },
        {
            provide: Http,
            deps: [MockBackend, BaseRequestOptions],
            useFactory: (backend, options) => {
                return new Http(backend, options);
            }
        }
    ]
})
class ChatAppModule {
}

platformBrowserDynamic().bootstrapModule(ChatAppModule)
    .catch(err => console.error(err));

