
import React, { Component, PropTypes } from 'react';
import { DropTarget } from 'react-dnd';
import classNames from 'classnames';
import { BOARD_ITEM } from '../../constants';

const {
    bool,
    func,
    number
} = PropTypes;

class BoardThumb extends Component {

    static propTypes = {
        onClick : func.isRequired,
        index : number.isRequired,
        selected : bool.isRequired,
        selectBoard : func.isRequired
    };

    componentWillReceiveProps( nextProps ) {
        const {
            isOver,
            index,
            selectBoard
        } = nextProps;

        if ( isOver !== this.props.isOver ) {
            if ( this.timer ) {
                clearTimeout( this.timer );
                this.timer = null;
            }

            if ( isOver ) {
                this.timer = setTimeout( () => {
                    selectBoard( index );
                    this.timer = null;
                }, 500 );
            }
        }
    }

    render() {
        const {
            connectDropTarget,
            onClick,
            index,
            selected
        } = this.props;

        return connectDropTarget(
            <div
                className={classNames('board-thumbnail', { selected : selected})}
                onClick={onClick}>
                {index + 1}
            </div>
        )
    }

}

const thumbnailSource = {};

const thumbnailCollect = function( connect, monitor ) {
    return {
        connectDropTarget : connect.dropTarget(),
        isOver : monitor.isOver()
    };
};

export default DropTarget(
    BOARD_ITEM,
    thumbnailSource,
    thumbnailCollect
)( BoardThumb );