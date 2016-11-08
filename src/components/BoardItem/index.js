
import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';
import ResizeHandle from './handle';
import { setTransform, setTopLeft } from '../../utils/style';
import { childrenEqual, shallowEqual } from '../../utils/grid';
import { DragSource } from 'react-dnd';
import { BOARD_ITEM } from '../../constants';
import _ from 'lodash';
import './styles.css';

const {
    element,
    number,
    array,
    string,
    func,
    bool
} = PropTypes;

let instanceCount = 0;

const noop = function(){};

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
        margin : array,

        // Grid units
        x : number.isRequired,
        y : number.isRequired,
        width : number.isRequired,
        height : number.isRequired,

        // Flags
        useCSSTransforms : bool.isRequired,
        isDraggable : bool.isRequired,
        isResizable : bool.isRequired,
        isHidden : bool.isRequired,

        // Callbacks
        onDragStop : func,
        onResizeStop : func,

        className : string,

        // react-dnd
        connectDragSource: func,
        connectDragPreview : func,
        isDragging : bool
    };

    static defaultProps = {
        minWidth     : 1,
        maxWidth     : Infinity,
        minHeight    : 1,
        maxHeight    : Infinity,
        isHidden     : false,
        onDragStop   : noop,
        onResizeStop : noop
    };

    constructor( props, context ) {
        super( props, context );
        this.instanceId = instanceCount++;
    }

    shouldComponentUpdate( nextProps ) {
        if ( !childrenEqual( nextProps.children, this.props.children ) ) {
            return true;
        }

        const nextPropsClean = _.omit( nextProps, 'children' );
        const propsClean = _.omit( this.props, 'children' );

        return (
            !shallowEqual( nextPropsClean, propsClean )
        );
    }

    calculatePosition(x, y, width, height ) {
        const {
            parentWidth,
            parentHeight,
            columns,
            rows
        } = this.props;

        const columnWidth = parentWidth / columns;
        const rowHeight = parentHeight / rows;

        return {
            left : Math.round( columnWidth * x ),
            top  : Math.round( rowHeight * y ),
            width : Math.round( width * columnWidth ),
            height : Math.round( height * rowHeight )
        };
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

    mixinResizable( child ) {
        const {
            x,
            y,
            id,
            rows,
            columns,
            height,
            width,
            minWidth,
            minHeight,
            maxWidth,
            maxHeight
        } = this.props;

        const minConstraints = [
            minWidth,
            minHeight
        ];

        const maxConstraints = [
            Math.min( maxWidth, columns - x ),
            Math.min( maxHeight, rows - y )
        ];

        const children = child.props.children ? React.Children.only( child.props.children ) : null;

        return React.cloneElement( child, {}, [
            children,
            <ResizeHandle
                id={id}
                key="resize-handle"
                width={width}
                height={height}
                minConstraints={minConstraints}
                maxConstraints={maxConstraints}
            />
        ]);
    }

    renderPlaceholder() {
        const {
            id,
            isDragging,
            connectDragSource
        } = this.props;

        if ( isDragging ) {
            return null;
        }

        return connectDragSource(
            <div className="react-board-item-placeholder">
                <div className="placeholder__title">
                    <div className="title__text">{id}</div>
                    <div>(Hidden)</div>
                </div>
            </div>
        );
    }

    render() {
        const {
            x,
            y,
            width,
            height,
            isDraggable,
            isResizable,
            useCSSTransforms,
            children,
            className,
            style,
            isHidden,
            connectDragSource,
            connectDragPreview,
            isDragging
        } = this.props;

        const child      = isHidden ? this.renderPlaceholder() : React.Children.only( children );
        const childProps = child ? child.props : {};
        const position   = this.calculatePosition( x, y, width, height );

        const childClassName  = childProps.className;
        const mergedClassName = classNames( 'react-board-item', className, {
            'css-transforms' : useCSSTransforms,
            'dragging' : isDragging,
            'hidden' : isHidden,
            [childClassName] : childClassName && !isHidden
        });

        const mergedStyle = {
            ...style,
            ...childProps.style,
            ...this.createStyle( position )
        };

        let nextChildProps = {};

        if ( child && typeof child.type !== 'string' ) {
            nextChildProps = {
                connectDragSource,
                isDraggable,
                isResizable,
                isDragging,
                height,
                width,
                x,
                y
            };
        }

        let nextChild = (
            <div
                style={mergedStyle}
                className={mergedClassName}>
                {child ? React.cloneElement( child, nextChildProps ) : null}
            </div>
        );

        if ( isDraggable ) {
            nextChild = connectDragPreview( nextChild );
        }

        if ( isResizable ) {
            nextChild = this.mixinResizable(
                nextChild,
                position
            );
        }

        return nextChild;
    }

}

const source = {
    beginDrag : function( props ) {
        const {
            id,
            height,
            width
        } = props;

        return {
            id,
            height,
            width
        };
    },

    endDrag: function( props ) {
        const {
            id,
            onDragStop
        } = props;

        onDragStop( id );
    }
};

const collect = function( connect, monitor ) {
    return {
        connectDragPreview : connect.dragPreview(),
        connectDragSource : connect.dragSource(),
        isDragging : monitor.isDragging()
    };
};

export default DragSource(
    BOARD_ITEM,
    source,
    collect
)( BoardItem );