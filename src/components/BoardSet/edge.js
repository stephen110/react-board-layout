
import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';
import { DropTarget } from 'react-dnd';
import { BOARD_ITEM } from '../../constants';

const {
    bool,
    func,
    number,
    string
} = PropTypes;

const noop = function(){};

class BoardEdge extends Component {

    static propTypes = {
        className : string,
        onActivate : func.isRequired,
        isEnabled : bool,
        delay : number,
    };

    static defaultProps = {
        onActivate : noop,
        isEnabled : true,
        delay : 500
    };

    componentWillReceiveProps( nextProps ) {
        const {
            isOver,
            isEnabled,
            delay
        } = nextProps;

        if ( !isEnabled ) {
            if ( this.timer ) {
                clearInterval( this.timer );
            }

            return;
        }

        if ( isOver && !this.timer ) {
            this.timer = setInterval( () => {
                this.props.onActivate();
            }, delay );
        }

        if ( !isOver && this.timer ) {
            clearInterval( this.timer );
            this.timer = null;
        }
    }

    render() {
        const {
            connectDropTarget,
            className,
            children
        } = this.props;

        const mergedClassName = classNames( 'board-edge', className );

        return connectDropTarget(
            <div className={mergedClassName}>
                {children}
            </div>
        )
    }

}

const source = {};

const collect = function( connect, monitor ) {
    return {
        connectDropTarget : connect.dropTarget(),
        isOver : monitor.isOver()
    };
};

export default DropTarget(
    BOARD_ITEM,
    source,
    collect
)( BoardEdge );