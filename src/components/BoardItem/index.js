
import React, { Component, PropTypes } from 'react';
import Draggable from 'react-draggable';
import { Resizable } from 'react-resizable';
import classNames from 'classnames';
import { setTransform, setTopLeft } from '../../utils/style';
import { childrenEqual, shallowEqual } from '../../utils/grid';
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
        onDrag : func,
        onDragStop : func,
        onResizeStart : func,
        onResize : func,
        onResizeStop : func,

        className : string,

        // react-draggable
        handle : string,
        cancel : string
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

        this.mixinDraggable = this.mixinDraggable.bind( this );
        this.onDragStart    = this.onDragStart.bind( this );
        this.onDrag         = this.onDrag.bind( this );
        this.onDragStop     = this.onDragStop.bind( this );
        this.onResizeStart  = this.onResizeStart.bind( this );
        this.onResize       = this.onResize.bind( this );
        this.onResizeStop   = this.onResizeStop.bind( this );

        this.instanceId = instanceCount++;

        this.state = {
            dragging : null
        };
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

    onDragStart( event, data ) {
        const {
            id
        } = this.props;

        const {
            node
        } = data;

        const nextPosition = { top: 0, left: 0 };
        const parentRect = node.offsetParent.getBoundingClientRect();
        const clientRect = node.getBoundingClientRect();
        nextPosition.left = clientRect.left - parentRect.left;
        nextPosition.top = clientRect.top - parentRect.top;

        this.setState({
            dragging: nextPosition
        });

        const { x, y } = this.calculateXY(
            nextPosition.top,
            nextPosition.left
        );

        this.props.onDragStart( id, x, y, {
            event,
            node,
            nextPosition
        });
    }

    onDrag( event, data ) {
        const {
            id
        } = this.props;

        const {
            node,
            deltaX,
            deltaY
        } = data;

        if ( !this.state.dragging ) {
            throw new Error( 'onDrag called before onDragStart.' );
        }

        const nextPosition = { top: 0, left: 0 };
        nextPosition.left = this.state.dragging.left + deltaX;
        nextPosition.top = this.state.dragging.top + deltaY;
        console.log( this.instanceId, nextPosition );

        this.setState({
            dragging: nextPosition
        });

        const { x, y } = this.calculateXY(
            nextPosition.top,
            nextPosition.left
        );

        this.props.onDrag( id, x, y, {
            event,
            node,
            nextPosition
        });
    }

    onDragStop( event, data ) {
        const {
            id
        } = this.props;

        const {
            node
        } = data;

        if ( !this.state.dragging ) {
            throw new Error('onDragEnd called before onDragStart.');
        }

        const nextPosition = { top: 0, left: 0 };
        nextPosition.left = this.state.dragging.left;
        nextPosition.top = this.state.dragging.top;

        const { x, y } = this.calculateXY(
            nextPosition.top,
            nextPosition.left
        );

        this.props.onDragStop( id, x, y, {
            event,
            node,
            nextPosition
        });

        this.setState({
            dragging: null
        });
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

    mixinDraggable( child, position ) {
        const {
            handle,
            cancel
        } = this.props;

        const cancelSelector  = [ '.react-resizable-handle' ];

        if ( cancel ) {
            cancelSelector.push( cancel );
        }

        const handleSelector = [];

        if ( handle ) {
            handleSelector.push( handle );
            handleSelector.push( '.react-board-item-placeholder' );
        }

        return (
            <Draggable
                onStart={this.onDragStart}
                onDrag={this.onDrag}
                onStop={this.onDragStop}
                handle={handleSelector.join( ',' )}
                cancel={cancelSelector.join( ',' )}
                bounds="parent"
                position={{x : position.left, y: position.top}}>
                {child}
            </Draggable>
        );
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
            id
        } = this.props;

        return (
            <div>
                <div className="react-board-item-placeholder">
                    <div className="placeholder__title">
                        <div className="title__text">{id}</div>
                        <div>(Hidden)</div>
                    </div>
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
            isHidden
        } = this.props;

        const {
            dragging,
            resizing
        } = this.state;

        const child = isHidden ? this.renderPlaceholder() : React.Children.only( children );
        const position = this.calculatePosition( x, y, width, height, dragging );

        const mergedClassName = classNames( 'react-board-item', className, child.props.className, {
            'react-board-item' : true,
            'css-transforms'   : useCSSTransforms,
            'resizing'         : !!resizing,
            'dragging'         : !!dragging,
            'hidden'           : isHidden
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

        if ( isResizable ) {
            nextChild = this.mixinResizable(
                nextChild,
                position
            );
        }

        if ( isDraggable ) {
            nextChild = this.mixinDraggable(
                nextChild,
                position
            );
        }

        return nextChild;
    }

}

export default BoardItem;