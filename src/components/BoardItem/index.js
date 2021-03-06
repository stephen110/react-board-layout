
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ResizeHandle from '../BoardItemHandle/index';
import { setTransform, setTopLeft } from '../../utils/style';
import { childrenEqual, shallowEqual } from '../../utils/grid';
import { DragSource } from 'react-dnd';
import { BOARD_ITEM } from '../../constants';
import _ from 'lodash';
import classNames from 'classnames';
import './styles.css';

const {
    element,
    number,
    array,
    string,
    func,
    bool,
    object
} = PropTypes;

const noop = function(){};

export class BoardItem extends Component {

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
        breakpoints : object,

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

    static childContextTypes = {
        connectDragSource : func
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

    getChildContext() {
        const {
            connectDragSource
        } = this.props;

        return {
            connectDragSource
        };
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

    calulateBreakpoint( width ) {
        const {
            breakpoints
        } = this.props;

        if ( !breakpoints ) {
            return null;
        }

        const sortedBreakpoints = Object.keys( breakpoints ).map( name => {
            return {
                name,
                width : breakpoints[ name ]
            };
        }).sort( ( a, b ) => a.width - b.width );

        for ( let i = 0; i < sortedBreakpoints.length; i++ ) {
            if ( width <= sortedBreakpoints[ i ].width ) {
                return sortedBreakpoints[ i ].name;
            }
        }
    }

    createStyle( position ) {
        const {
            useCSSTransforms
        } = this.props;

        if ( useCSSTransforms ) {
            return setTransform({
                ...position,
                height : `${position.height}px`,
                width : `${position.width}px`
            });
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
            <div className="board-item--placeholder">
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
        const breakpointName  = this.calulateBreakpoint( position.width );
        const mergedClassName = classNames( 'board-item', className, breakpointName, {
            'css-transforms' : useCSSTransforms,
            'dragging' : isDragging,
            'placeholder' : isHidden,
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

export const ConnectedBoardItem = DragSource(
    BOARD_ITEM,
    source,
    collect
)( BoardItem );