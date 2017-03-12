// @flow
import React from 'react';
import Hammer from 'hammerjs';
import dynamics from 'dynamics.js';
import './main.css';

type AxisType = 'horizontal' | 'vertical';
type DirectionType = 'north' | 'east' | 'south' | 'west';
type CompleteCallbackType = () => void;

const transition = (
  targetElement,
  cardWidth: number,
  cardHeight: number,
  direction: DirectionType | 'reset',
  delta: number,
  complete: CompleteCallbackType
) => {
  const duration = 200;
  const anticipationSize = 200;
  const frequency = 1;
  const friction = 200;

  const reset = () => {
    targetElement.style.transform = 'translateX(0px)';
  };

  const animate = (axis: AxisType | 'reset', distance: number) => {
    dynamics.animate(targetElement, {
      translateX: axis === 'horizontal' ? distance : 0,
      translateY: axis === 'vertical' ? distance : 0
    }, {
      anticipationSize,
      complete: () => {
        reset();

        if (complete) {
          complete();
        }
      },
      duration,
      frequency,
      friction,
      type: dynamics.spring
    });
  };

  switch (direction) {
  case 'reset':
    animate('horizontal', 0);
    break;
  case 'north':
    animate('vertical', cardHeight);
    break;
  case 'west':
    animate('horizontal', cardWidth);
    break;
  case 'south':
    animate('vertical', -cardHeight);
    break;
  case 'east':
    animate('horizontal', -cardWidth);
    break;
  }
};

type CardsType = {|
  east: React$Element<any>,
  heart?: React$Element<any>,
  north: React$Element<any>,
  south: React$Element<any>,
  west: React$Element<any>
|};

type PropsType = {|
  load: () => CardsType
|};

const styleElements = (
  playgroundElement: React$Element<any>,
  deckElement: React$Element<any>,
  northElement: React$Element<any>,
  eastElement: React$Element<any>,
  southElement: React$Element<any>,
  westElement: React$Element<any>,
  heartElement: React$Element<any>
) => {
  const cardElements = [
    northElement,
    eastElement,
    southElement,
    westElement,
    heartElement
  ];

  deckElement.style.position = 'relative';
  deckElement.style.left = -playgroundElement.clientWidth + 'px';
  deckElement.style.top = -playgroundElement.clientHeight + 'px';
  deckElement.style.width = 3 * playgroundElement.clientWidth + 'px';
  deckElement.style.height = 3 * playgroundElement.clientHeight + 'px';

  for (const cardElement of cardElements) {
    cardElement.style.position = 'absolute';
    cardElement.style.width = playgroundElement.clientWidth + 'px';
    cardElement.style.height = playgroundElement.clientHeight + 'px';
  }

  northElement.style.top = 0;
  northElement.style.left = playgroundElement.clientWidth + 'px';

  eastElement.style.top = playgroundElement.clientHeight + 'px';
  eastElement.style.left = 2 * playgroundElement.clientWidth + 'px';

  southElement.style.top = 2 * playgroundElement.clientHeight + 'px';
  southElement.style.left = playgroundElement.clientWidth + 'px';

  westElement.style.top = playgroundElement.clientHeight + 'px';
  westElement.style.left = 0;

  heartElement.style.top = playgroundElement.clientHeight + 'px';
  heartElement.style.left = playgroundElement.clientWidth + 'px';
};

class Grid extends React.Component {
  playgroundElement: React$Element<any>;
  deckElement: React$Element<any>;
  northElement: React$Element<any>;
  eastElement: React$Element<any>;
  southElement: React$Element<any>;
  westElement: React$Element<any>;
  heartElement: React$Element<any>;

  props: PropsType;

  // eslint-disable-next-line
  constructor (props: PropsType) {
    super(props);
  }

  componentWillMount () {
    this.setState({
      cards: this.props.load()
    });
  }

  componentDidMount () {
    let cardWidth;
    let cardHeight;

    const deckElement = this.deckElement;

    styleElements(
      this.playgroundElement,
      this.deckElement,
      this.northElement,
      this.eastElement,
      this.southElement,
      this.westElement,
      this.heartElement
    );

    const hammertime = new Hammer.Manager(deckElement);

    hammertime.add(new Hammer.Pan({
      pointers: 0,
      threshold: 10
    }));

    let axis: AxisType;

    let direction: DirectionType;
    let lastDirection: DirectionType;
    let lastCards = this.state.cards;
    let allowNorth: boolean;
    let allowEast: boolean;
    let allowSouth: boolean;
    let allowWest: boolean;

    hammertime.on('panstart', (event) => {
      allowNorth = Boolean(this.state.cards.north);
      allowEast = Boolean(this.state.cards.east);
      allowSouth = Boolean(this.state.cards.south);
      allowWest = Boolean(this.state.cards.west);

      cardWidth = deckElement.children[0].clientWidth;
      cardHeight = deckElement.children[0].clientHeight;

      axis = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? 'horizontal' : 'vertical';
    });

    hammertime.on('pan', (event) => {
      const horizontalAcceleration: number = 1.2;
      const verticalAcceleration: number = 1.3;

      const deltaX: number = event.deltaX * horizontalAcceleration;
      const deltaY: number = event.deltaY * verticalAcceleration;

      if (axis === 'horizontal') {
        if (Math.abs(deltaX) >= cardWidth) {
          return;
        }

        direction = event.deltaX < 0 ? 'east' : 'west';

        if (
          direction === 'east' && !allowEast ||
          direction === 'west' && !allowWest
        ) {
          return;
        }

        deckElement.style.transform = 'translateX(' + deltaX + 'px)';
      } else {
        if (Math.abs(deltaY) >= cardHeight) {
          return;
        }

        direction = event.deltaY > 0 ? 'north' : 'south';

        if (
          direction === 'north' && !allowNorth ||
          direction === 'south' && !allowSouth
        ) {
          return;
        }

        deckElement.style.transform = 'translateY(' + deltaY + 'px)';
      }
    });

    hammertime.on('panend', (event) => {
      if (
        direction === 'north' && !allowNorth ||
        direction === 'east' && !allowEast ||
        direction === 'south' && !allowSouth ||
        direction === 'west' && !allowWest
      ) {
        return;
      }

      const horizontalThreshold: number = cardWidth / 4;
      const verticalThreshold: number = cardHeight / 5;

      if (axis === 'horizontal') {
        if (Math.abs(event.deltaX) < horizontalThreshold) {
          transition(deckElement, cardWidth, cardHeight, 'reset', event.deltaX);

          return;
        }

        transition(deckElement, cardWidth, cardHeight, direction, event.deltaX, () => {
          const cards = this.props.load(direction, lastDirection, this.state.cards);

          if (lastCards && !cards.heart) {
            cards.heart = direction === 'east' ? lastCards.east : lastCards.west;
          }

          this.setState({
            cards
          });

          lastCards = {
            ...cards
          };
          lastDirection = direction;
        });
      } else {
        if (Math.abs(event.deltaY) < verticalThreshold) {
          transition(deckElement, cardWidth, cardHeight, 'reset', event.deltaY);

          return;
        }

        transition(deckElement, cardWidth, cardHeight, direction, event.deltaY, () => {
          const cards = this.props.load(direction, lastDirection, this.state.cards);

          if (lastCards && !cards.heart) {
            cards.heart = direction === 'north' ? lastCards.north : lastCards.south;
          }

          this.setState({
            cards
          });

          lastCards = {
            ...cards
          };
          lastDirection = direction;
        });
      }
    });
  }

  render () {
    const captureReference = (name) => {
      return (element) => {
        this[name] = element;
      };
    };

    const playground = <div className='playground' ref={captureReference('playgroundElement')}>
      <div className='deck' ref={captureReference('deckElement')}>
        <div className='card edge north' ref={captureReference('northElement')}>
          {this.state.cards.north}
        </div>
        <div className='card edge east' ref={captureReference('eastElement')}>
          {this.state.cards.east}
        </div>
        <div className='card edge south' ref={captureReference('southElement')}>
          {this.state.cards.south}
        </div>
        <div className='card edge west' ref={captureReference('westElement')}>
          {this.state.cards.west}
        </div>
        <div className='card heart' ref={captureReference('heartElement')}>
          {this.state.cards.heart}
        </div>
      </div>
    </div>;

    return playground;
  }
}

export default Grid;
