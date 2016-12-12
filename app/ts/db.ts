import {Image} from './models/Image';
import {uuid} from './util/uuid';
import * as moment from 'moment';

export let db: Image[] = [
    {
        id: uuid(),
        tooltipText: 'photo1 Fusce sit amet odio ligula. Sed quis convallis est, at consectetur turpis. Proin et felis malesuada, hendrerit nulla eget, gravida nulla.',
        createdAt: moment(Date.now()).toDate(),
        fileUrl: `${require('images/photo1.jpg')}`
    },
    {
        id: uuid(),
        tooltipText: 'photo2 Fusce sit amet odio ligula. Sed quis convallis est, at consectetur turpis. Proin et felis malesuada, hendrerit nulla eget, gravida nulla.',
        createdAt: moment(Date.now()).toDate(),
        fileUrl: `${require('images/photo2.jpg')}`
    },
    {
        id: uuid(),
        tooltipText: 'photo3 Fusce sit amet odio ligula. Sed quis convallis est, at consectetur turpis. Proin et felis malesuada, hendrerit nulla eget, gravida nulla.',
        createdAt: moment(Date.now()).toDate(),
        fileUrl: `${require('images/photo3.jpg')}`
    },
    {
        id: uuid(),
        tooltipText: 'photo4 Fusce sit amet odio ligula. Sed quis convallis est, at consectetur turpis. Proin et felis malesuada, hendrerit nulla eget, gravida nulla.',
        createdAt: moment(Date.now()).toDate(),
        fileUrl: `${require('images/photo4.jpg')}`
    },
    {
        id: uuid(),
        tooltipText: 'photo5 Fusce sit amet odio ligula. Sed quis convallis est, at consectetur turpis. Proin et felis malesuada, hendrerit nulla eget, gravida nulla.',
        createdAt: moment(Date.now()).toDate(),
        fileUrl: `${require('images/photo5.jpg')}`
    },
];
