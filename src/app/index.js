// @flow
import ReactDOM from 'react-dom';
import React from 'react';
import Grid from './components/Grid';
import './main.css';

const movieComponent = <div>Movie</div>;
const posterComponent = <div>Poster</div>;
const eventsComponent = <div>Events (page 0)</div>;

let lastView = 'movie';
let eventPageCount = 0;

ReactDOM.render(
  <Grid load={(direction) => {
    if (!direction) {
      return {
        east: eventsComponent,
        heart: movieComponent,
        north: movieComponent,
        south: movieComponent,
        west: posterComponent
      };
    }

    if (direction === 'east' && lastView === 'events') {
      ++eventPageCount;

      lastView = 'events';

      return {
        east: <div>Events (page {eventPageCount})</div>,
        north: movieComponent,
        south: movieComponent,
        west: movieComponent
      };
    }

    if (direction === 'east' && lastView === 'movie') {
      ++eventPageCount;

      lastView = 'events';

      return {
        east: <div>Events (page {eventPageCount})</div>,
        north: movieComponent,
        south: movieComponent,
        west: movieComponent
      };
    }

    eventPageCount = 0;

    if (direction === 'north' || direction === 'south') {
      lastView = 'movie';

      return {
        east: eventsComponent,
        north: movieComponent,
        south: movieComponent,
        west: posterComponent
      };
    }

    if (direction === 'west' && lastView === 'events') {
      lastView = 'movie';

      return {
        east: eventsComponent,
        north: movieComponent,
        south: movieComponent,
        west: posterComponent
      };
    }

    if (direction === 'west' && lastView === 'movie') {
      lastView = 'movie';

      return {
        east: movieComponent,
        north: movieComponent,
        south: movieComponent,
        west: null
      };
    }

    throw new Error('Unexpected direction.');
  }} />,
  document.getElementById('app')
);
