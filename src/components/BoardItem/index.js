
import React, { Component, PropTypes } from 'react';
import { DraggableCore } from 'react-draggable';
import classNames from 'classnames';
import { setTransform, setTopLeft } from '../../utils/style';

const {
    element,
    number,
    array,
    string,
    func,
    bool
} = PropTypes;

class BoardItem extends Component {

    static propTypes = {
        // Indentifier
        id : string.isRequired,

        // Children must be a single element
        children : element,

        // General grid attributes
        columns : number.isRequired,
        rows : number.isRequired,
        parentWidth : number.isRequired,
        parentHeight : number.isRequired,
        margin : array.isRequired,

        // Grid units
        x : number.isRequired,
        y : number.isRequired,
        width : number.isRequired,
        height : number.isRequired,

        // Flags
        useCSSTransforms : bool.isRequired,
        isDraggable : bool.isRequired,

        onDragStop : func,
        onDragStart : func,
        onDrag : func,

        className : string,

        // react-draggable
        handle : string,
        cancel : string
    };

    static defaultProps = {

    };

    constructor( props, context ) {
        super( props, context );

        this.mixinDraggable = this.mixinDraggable.bind( this );
        this.onDragHandler  = this.onDragHandler.bind( this );

        this.state = {
            dragging : null
        };
    }

    calculateXY(top, left) {
        const {
            columns,
            rows,
            width,
            height,
            parentWidth,
            parentHeight
        } = this.props;

        const columnWidth = parentWidth / columns;
        const rowHeight = parentHeight / rows;

        let x = Math.round(
            left / columnWidth
        );

        let y = Math.round(
            top / rowHeight
        );

        x = Math.max( 0,
            Math.min( x, columns - width )
        );

        y = Math.max( 0,
            Math.min( y, rows - height )
        );

        return { x, y };
    }

    calculatePosition(x, y, width, height, state = {} ) {
        const {
            parentWidth,
            parentHeight,
            columns,
            rows
        } = this.props;

        const columnWidth = parentWidth / columns;
        const rowHeight = parentHeight / rows;

        const position = {
            left : Math.round( columnWidth * x ),
            top  : Math.round( rowHeight * y ),
            width : Math.round( width * columnWidth ),
            height : Math.round( height * rowHeight )
        };

        if ( state.dragging ) {
            position.top = Math.round( state.dragging.top );
            position.left = Math.round( state.dragging.left );
        }

        return position;
    }

    createStyle( position ) {
        const {
            useCSSTransforms
        } = this.props;

        if ( useCSSTransforms ) {
            return setTransform( position );
        }

        return setTopLeft( position );
    }

    onDragHandler( name ) {
        return ( event, data ) => {
            if ( !this.props[ name ] ) {
                return;
            }

            const {
                node,
                deltaX,
                deltaY
            } = data;

            const {
                id
            } = this.props;

            const nextPosition = { top: 0, left: 0 };

            switch( name ) {
                case 'onDragStart':
                    break;
                case 'onDrag':
                    break;
                case 'onDragStop':
                    break;
            }

            const { x, y } = this.calculateXY(
                nextPosition.top,
                nextPosition.left
            );

            this.props[ name ]( id, x, y, {
                event,
                node,
                nextPosition
            });
        };
    }

    mixinDraggable( child ) {
        const {
            handle
        } = this.props;

        const {
            onDragHandler
        } = this;

        return (
            <DraggableCore
                onStart={onDragHandler('onDragStart')}
                onDrag={onDragHandler('onDrag')}
                onStop={onDragHandler('onDragStop')}
                handle={handle}>
                {child}
            </DraggableCore>
        );
    }

    render() {
        const {
            x,
            y,
            width,
            height,
            isDraggable,
            useCSSTransforms,
            children,
            className,
            style
        } = this.props;

        const child = React.Children.only( children );
        const position = this.calculatePosition( x, y, width, height, this.state );

        const mergedClassName = classNames( 'react-board-item', className, child.props.className, {
            'react-board-item' : true,
            'css-transforms' : useCSSTransforms
        });

        const mergedStyle = {
            ...style,
            ...child.props.style,
            ...this.createStyle( position )
        };

        // Create the child element, modifying className and style
        let nextChild = React.cloneElement( child, {
            className : mergedClassName,
            style : mergedStyle
        });

        if ( isDraggable ) {
            nextChild = this.mixinDraggable(
                nextChild
            );
        }

        return nextChild;
    }

}