import {Image} from '../models/Image';
import {Injectable} from '@angular/core';
import {Http} from '@angular/http';
import 'rxjs/add/operator/map';
import {MockBackend} from '@angular/http/testing';
import {db} from '../db';
import {Response, ResponseOptions} from '@angular/http';

@Injectable()
export class MockBackendService {
// Fake Images DB
    private db: Image[] = db;
    constructor(private http: Http, private backend: MockBackend) {
        this.backend.connections.subscribe(c => {
            let singleImageMatcher = /\/api\/image\/([0-9]+)/i;
            // return all imagess
            // GET: /image
            if (c.request.url === 'http://localhost:8080/api/image' && c.request.method === 0) {
                let res = new Response(new ResponseOptions({
                    body: JSON.stringify(this.db)
                }));

                c.mockRespond(res);
            } else if (c.request.url.match(singleImageMatcher) && c.request.method === 0) {
                // return image matching the given id
                // GET: /image/:id
                let matches = this.db.filter((t) => {
                    return t.id === c.request.url.match(singleImageMatcher)[1];
                });

                c.mockRespond(new Response(new ResponseOptions({
                    body: JSON.stringify(matches[0])
                })));
            } else if (c.request.url === 'http://localhost:8080/api/image' && c.request.method === 1) {
                // Add or update a image
                // POST: /image
                let newImage: Image = JSON.parse(c.request._body);

                let existingImage = this.db.filter((image: Image) => {
                    return image.id === newImage.id;
                });
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
            } else if (c.request.url.match(singleImageMatcher) && c.request.method === 3) {
                // Delete a image
                // DELETE: /image/:id
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
