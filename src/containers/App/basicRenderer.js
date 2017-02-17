import React from 'react';
import Board from '../../components/Board';
import Card from './card';

const CarouselRenderer = props => {
    const {
        boards
    } = props;

    return (
        <div className="basic-renderer">
            {boards.map( ( board ) => {

                return (
                    <Board
                        {...props.boardProps}
                        key={board.id}
                        name={board.id}
                        id={board.id}
                        layout={board.cards}>

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