import 'font-awesome/scss/font-awesome.scss';
import { Inject, Component} from '@angular/core';
import { NgModule } from '@angular/core';
import { MockBackend } from '@angular/http/testing';
import { Http, BaseRequestOptions } from '@angular/http';
import {Response, ResponseOptions} from '@angular/http';
import { BrowserModule } from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { FormsModule } from '@angular/forms';
import { createStore,Store, compose, StoreEnhancer} from 'redux';
import { AppStore } from './app-store';
import { AppState, default as reducer} from './reducers';
import {AgGridModule} from 'ag-grid-ng2/main';
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap/dist/css/bootstrap-theme.css";
import "bootstrap-material-design/dist/css/bootstrap-material-design.css";
import "bootstrap-material-design/dist/css/ripples.css";
import '../css/styles.scss';
import "bootstrap/dist/js/bootstrap.js";
import "bootstrap-material-design/dist/js/material.js";
import 'bootstrap-material-design/dist/js/ripples.js';
import { uuid } from './util/uuid';
import * as moment from 'moment';

import AdminPage from './pages/AdminPage';
import {Image} from './models/Image';
import {ImageService} from './mockService';

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
  // Fake Images DB
  private db: Image[] = [
    { id: uuid(),tooltipText: 'photo1 Fusce sit amet odio ligula. Sed quis convallis est, at consectetur turpis. Proin et felis malesuada, hendrerit nulla eget, gravida nulla.', createdAt: moment(Date.now()).toDate(),fileUrl: `${require('images/photo1.jpg')}`},
    { id: uuid(),tooltipText: 'photo2 Fusce sit amet odio ligula. Sed quis convallis est, at consectetur turpis. Proin et felis malesuada, hendrerit nulla eget, gravida nulla.', createdAt: moment(Date.now()).toDate(),fileUrl: `${require('images/photo2.jpg')}`},
    { id: uuid(),tooltipText: 'photo3 Fusce sit amet odio ligula. Sed quis convallis est, at consectetur turpis. Proin et felis malesuada, hendrerit nulla eget, gravida nulla.', createdAt: moment(Date.now()).toDate(),fileUrl: `${require('images/photo3.jpg')}`},
    { id: uuid(),tooltipText: 'photo4 Fusce sit amet odio ligula. Sed quis convallis est, at consectetur turpis. Proin et felis malesuada, hendrerit nulla eget, gravida nulla.', createdAt: moment(Date.now()).toDate(),fileUrl: `${require('images/photo4.jpg')}`},
    { id: uuid(),tooltipText: 'photo5 Fusce sit amet odio ligula. Sed quis convallis est, at consectetur turpis. Proin et felis malesuada, hendrerit nulla eget, gravida nulla.', createdAt: moment(Date.now()).toDate(),fileUrl: `${require('images/photo5.jpg')}`},
  ];

  constructor(@Inject(AppStore) private store: Store<AppState>, private service: ImageService, private backend: MockBackend) {

    this.backend.connections.subscribe( c => {
      let singleImageMatcher = /\/api\/image\/([0-9]+)/i;
      // return all imagess
      // GET: /image
      if (c.request.url === "http://localhost:8080/api/image" && c.request.method === 0) {
        let res = new Response(new ResponseOptions({
          body: JSON.stringify(this.db)
        }));

        c.mockRespond(res);
      }
      // return image matching the given id
      // GET: /image/:id
      else if (c.request.url.match(singleImageMatcher) && c.request.method === 0) {
        let matches = this.db.filter( (t) => {
          return t.id == c.request.url.match(singleImageMatcher)[1]
        });

        c.mockRespond(new Response(new ResponseOptions({
          body: JSON.stringify(matches[0])
        })));
      }
      // Add or update a image
      // POST: /image
      else if (c.request.url === 'http://localhost:8080/api/image' && c.request.method === 1) {
        let newImage: Image = JSON.parse(c.request._body);

        let existingImage = this.db.filter( (image: Image) => { return image.id == newImage.id});
        if (existingImage && existingImage.length === 1) {
          Object.assign(existingImage[0], newImage);

          c.mockRespond(new Response(new ResponseOptions({
            body: JSON.stringify(existingImage[0])
          })));
        } else {

          this.db.push(newImage);
          c.mockRespond(new Response(new ResponseOptions({
            body: JSON.stringify(newImage)
          })));
        }
      }
      // Delete a image
      // DELETE: /image/:id
      else if (c.request.url.match(singleImageMatcher) && c.request.method === 3) {
        let imageId = c.request.url.match(singleImageMatcher)[1];
        let pos = _.indexOf(_.pluck(this.db, '_id'), imageId);
        this.db.splice(pos, 1);

        c.mockRespond(new Response(new ResponseOptions({
          body: JSON.stringify({})
        })));
      }

    });
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
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AgGridModule.withNg2ComponentSupport(),
  ],
  bootstrap: [ AdminApp],
  providers: [
    BaseRequestOptions,
    MockBackend,
    ImageService,
    {
      provide: AppStore,
      useFactory: () => store,
    },
    {
      provide: Http,
      deps: [MockBackend, BaseRequestOptions],
      useFactory: (backend, options) => { return new Http(backend, options); }
    }
  ]
})
class ChatAppModule {}

platformBrowserDynamic().bootstrapModule(ChatAppModule)
  .catch(err => console.error(err));

