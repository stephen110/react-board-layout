import React, { Component, PropTypes } from 'react';
import Board from '../../components/Board';
import classNames from 'classnames';
import Card from './card';

const setTransform = function( { top, left, width, height } ) {
    const translate = `translate(${left}px, ${top}px)`;

    return {
        transform : translate,
        WebkitTransform: translate,
        MozTransform: translate,
        msTransform: translate,
        OTransform: translate,
        width: `${width}px`,
        height: `${height}px`,
        position: 'absolute'
    };
};

const CarouselRenderer = props => {
    const {
        boards,
        parentHeight,
        parentWidth,
        selectedIndex, // Comes from /App
        transitioning  // Comes from /App
    } = props;

    return (
        <div className="carousel-renderer">
            {boards.map( ( board, index ) => {
                const active = index === selectedIndex;
                const style  = setTransform({
                    top : 0,
                    left : ( index - selectedIndex ) * parentWidth,
                    width : parentWidth,
                    height : parentHeight - 40
                });

                return (
                    <Board
                        {...props.boardProps}
                        key={board.id}
                        name={board.id}
                        id={board.id}
                        className={classNames({transitioning : transitioning, active})}
                        layout={board.cards}
                        style={style}>

                        {board.cards.map( card => (
                            <Card
                                key={card.id}
                                text={card.id}
                            />
                        ))}

                    </Board>
                );
            })}
        </div>
    );
};

export default CarouselRenderer;