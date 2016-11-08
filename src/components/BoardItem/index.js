
import React, { Component, PropTypes } from 'react';
import { Resizable } from 'react-resizable';
import classNames from 'classnames';
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
        onDragStart : func,
        onDragStop : func,
        onResizeStart : func,
        onResize : func,
        onResizeStop : func,

        className : string,

        // react-dnd
        connectDragSource: func,
        connectDragPreview : func,
        isDragging: bool
    };

    static defaultProps = {
        minWidth  : 0,
        maxWidth  : Infinity,
        minHeight : 0,
        maxHeight : Infinity,
        isHidden  : false
    };

    constructor( props, context ) {
        super( props, context );

        this.onResizeStart  = this.onResizeStart.bind( this );
        this.onResize       = this.onResize.bind( this );
        this.onResizeStop   = this.onResizeStop.bind( this );
        this.calculateXY    = this.calculateXY.bind( this );

        this.instanceId = instanceCount++;
        this.state = {};
    }

    shouldComponentUpdate( nextProps, nextState ) {
        if ( !childrenEqual( nextProps.children, this.props.children ) ) {
            return true;
        }

        const nextPropsClean = _.omit( nextProps, 'children' );
        const propsClean = _.omit( this.props, 'children' );

        return (
            !shallowEqual( nextPropsClean, propsClean ) ||
            !shallowEqual( nextState, this.state )
        );
    }

    calculateXY( top, left ) {
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

    calculateWH(width, height) {
        const {
            parentWidth,
            parentHeight,
            columns,
            rows,
            x,
            y,
            minWidth,
            maxWidth,
            minHeight,
            maxHeight
        } = this.props;

        const columnWidth = parentWidth / columns;
        const rowHeight = parentHeight / rows;

        let calculatedWidth = Math.max( 1,
            Math.min(
                Math.round( width / columnWidth ),
                columns - x
            )
        );

        let calculatedHeight = Math.max( 1,
            Math.min(
                Math.round( height / rowHeight ),
                rows - y
            )
        );

        // Clamp by min/max props

        calculatedWidth = Math.max(
            Math.min( calculatedWidth, maxWidth ),
            minWidth
        );

        calculatedHeight = Math.max(
            Math.min( calculatedHeight, maxHeight ),
            minHeight
        );

        return {
            width  : calculatedWidth,
            height : calculatedHeight
        };
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

    onResizeStart( event, data ) {
        const {
            id,
            onResizeStart
        } = this.props;

        const {
            node,
            size
        } = data;

        const { width, height } = this.calculateWH(
            size.width,
            size.height
        );

        this.setState({
            resizing : size
        });

        onResizeStart( id, width, height, {
            event,
            node,
            size
        });
    }

    onResize( event, data ) {
        const {
            id,
            onResize
        } = this.props;

        const {
            node,
            size
        } = data;

        const { width, height } = this.calculateWH(
            size.width,
            size.height
        );

        this.setState({
            resizing : size
        });

        onResize( id, width, height, {
            event,
            node,
            size
        });
    }

    onResizeStop( event, data ) {
        const {
            id,
            onResizeStop
        } = this.props;

        const {
            node,
            size
        } = data;

        const { width, height } = this.calculateWH(
            size.width,
            size.height
        );

        this.setState({
            resizing : null
        });

        onResizeStop( id, width, height, {
            event,
            node,
            size
        });
    }

    mixinResizable( child, position ) {
        const {
            x,
            y,
            rows,
            columns,
            minWidth,
            minHeight,
            maxWidth,
            maxHeight
        } = this.props;

        const absoluteMax   = this.calculatePosition( 0, 0, columns - x, rows - y);
        const calculatedMin = this.calculatePosition( 0, 0, minWidth, minHeight );
        const calculatedMax = this.calculatePosition( 0, 0, maxWidth, maxHeight );

        const minConstraints = [
            calculatedMin.width,
            calculatedMin.height
        ];

        const maxConstraints = [
            Math.min( calculatedMax.width, absoluteMax.width ),
            Math.min( calculatedMax.height, absoluteMax.height )
        ];

        return (
            <Resizable
                width={position.width}
                height={position.height}
                minConstraints={minConstraints}
                maxConstraints={maxConstraints}
                onResizeStart={this.onResizeStart}
                onResize={this.onResize}
                onResizeStop={this.onResizeStop}>
                {child}
            </Resizable>
        );
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
            isDragging,
            connectDragSource,
            connectDragPreview
        } = this.props;

        const {
            dragging,
            resizing
        } = this.state;

        const child      = isHidden ? this.renderPlaceholder() : React.Children.only( children );
        const childProps = child ? child.props : {};
        const position   = this.calculatePosition( x, y, width, height, dragging );

        const childClassName  = childProps.className;
        const mergedClassName = classNames( 'react-board-item', className, {
            'css-transforms' : useCSSTransforms,
            'resizing' : !!resizing,
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

const boardItemSource = {

    beginDrag : function( props, monitor, component ) {
        const {
            id,
            onDragStart
        } = props;

        const {
            calculateXY
        } = component;

        onDragStart( id );

        return {
            id,
            calculateXY
        };
    },

    endDrag: function( props, monitor ) {
        console.log( 'Ending Drag', props.id );

        const {
            id,
            onDragStop
        } = props;

        if ( !monitor.didDrop() ) {
            onDragStop( id );
        }
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
    boardItemSource,
    collect
)( BoardItem );