import {Image} from './models/Image';
import {Injectable} from '@angular/core';
import {Http, Headers} from '@angular/http';
import 'rxjs/add/operator/map';


@Injectable()
export class ImageService {
    images: Image[] = [];

    constructor(private http: Http) {
    }

    addNewImage(newImage) {
        let headers = new Headers();
        headers.append('Content-Type', 'application/json');
        return this.http
            .post('http://localhost:8080/api/image', JSON.stringify(newImage), headers)
            .map(res => res.json());
    }

    saveImage(image: Image) {
        let headers = new Headers();
        headers.append('Content-Type', 'application/json');

        return this.http
            .post('http://localhost:8080/api/image', JSON.stringify(image), headers)
            .map(res => res.json());
    }

    deleteImage(image: Image) {
        return this.http
            .delete('http://localhost:8080/api/image/' + image.id)
            .map(res => res.text())

    }


    getAllImages() {
        return this.http
            .get('http://localhost:8080/api/image')
            .map(res => {
                return res.json()
            })

    }

    loadImageById(id) {
        return this.http
            .get('http://localhost:8080/api/image/' + id)
            .map(res => res.json())

    }

}
