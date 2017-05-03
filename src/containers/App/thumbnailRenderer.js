import React from 'react';
import BoardThumbnail from './thumbnail';


const ThumbnailRenderer = props => {
    return (
        <div className="board-thumbnails">
            {props.boards.map( ( board, index ) => (
                <BoardThumbnail
                    index={index}
                    key={board.id}
                    name={board.id}
                    onClick={props.selectBoard}
                    selected={index === props.selectedIndex}
                    selectBoard={props.selectBoard}
                />
            ))}
        </div>
    );
};

export default ThumbnailRenderer;