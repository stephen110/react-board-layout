
import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';
import BoardItem from '../BoardItem';
import { DropTarget } from 'react-dnd';
import { getLayoutItem, canMoveElement, calculateXY, calculateWH } from '../../utils/grid';
import { BOARD_ITEM, RESIZE_HANDLE } from '../../constants';
import './styles.css';

const {
    arrayOf,
    string,
    object,
    number,
    func,
    bool
} = PropTypes;

const noop = function(){};

class Board extends Component {

    static propTypes = {
        id : string,
        name : string.isRequired,
        className : string,
        style : object,

        // Sizing
        width : number,
        height : number,
        columns : number,
        rows : number,
        draggableCancel : string,
        draggableHandle : string,

        isDraggable : bool,
        isResizable : bool,
        useCSSTransforms : bool,

        // Layout
        layout : arrayOf( object ).isRequired,

        // Callbacks
        onLayoutChange : func,
        setWorkingItem : func,

        updateItemPosition : func,
        updateItemSize : func,

        commitWorkingItem : func
    };

    static childContextTypes = {
        board : object
    };

    static defaultProps = {
        columns : 12,
        rows    : 12,
        isDraggable : true,
        isResizable : true,
        useCSSTransforms : true,
        updateItemPosition : noop,
        updateItemSize : noop,
        setWorkingItem : noop
    };

    constructor( props, context ) {
        super(props, context);
        this.renderBoardItem = this.renderBoardItem.bind(this);
        this.onDrag          = this.onDrag.bind( this );
        this.onResize        = this.onResize.bind( this );
    }

    getChildContext() {
        return {
            board : this
        };
    }

    onDrag( id, x, y ) {
        let {
            layout,
            setWorkingItem,
            workingItem
        } = this.props;

        let layoutItem = getLayoutItem( layout, id );

        if ( !layoutItem ) {
            if ( !workingItem ) {
                return;
            }

            // New item to this board
            layoutItem = workingItem.item;
        }

        const nextLayoutItem = {
            height : layoutItem.height,
            width : layoutItem.width,
            x,
            y
        };

        if ( !canMoveElement( id, nextLayoutItem, layout ) ) {
            return;
        }

        nextLayoutItem.id = id;
        nextLayoutItem.placeholder = true;
        setWorkingItem( nextLayoutItem );
    }

    onResize( id, width, height ) {
        let {
            layout,
            updateItemSize
        } = this.props;

        let layoutItem = getLayoutItem( layout, id );

        if ( !layoutItem ) {
            return;
        }

        const nextLayoutItem = {
            x : layoutItem.x,
            y : layoutItem.y,
            height,
            width
        };

        if ( !canMoveElement( id, nextLayoutItem, layout ) ) {
            return;
        }

        updateItemSize( id, nextLayoutItem );
    }

    renderPlaceholder() {
        const {
            id,
            useCSSTransforms,
            workingItem,
            width,
            height,
            columns,
            rows
        } = this.props;

        if ( !workingItem || workingItem.boardId !== id ) {
            return null;
        }

        const item = workingItem.item;

        return (
            <BoardItem
                id={item.id}
                x={item.x}
                y={item.y}
                height={item.height}
                width={item.width}
                parentWidth={width}
                parentHeight={height}
                columns={columns}
                rows={rows}
                useCSSTransforms={useCSSTransforms}
                isDraggable={false}
                isResizable={false}
                isHidden={false}>
                <div className="react-board-placeholder-container">
                    <div className="react-board-placeholder" />
                </div>
            </BoardItem>
        );
    }

    renderBoardItem( child ) {
        const {
            width,
            height,
            columns,
            rows,
            useCSSTransforms,
            draggableHandle,
            draggableCancel,
            isDraggable,
            isResizable,
            layout,
            commitWorkingItem
        } = this.props;

        const layoutItem = getLayoutItem( layout, child.key );

        if ( !layoutItem ) {
            return null;
        }

        const draggable = Boolean(
            isDraggable &&
            layoutItem.isStatic !== true &&
            layoutItem.isDraggable !== false
        );

        const resizable = Boolean(
            isResizable &&
            layoutItem.isStatic !== true &&
            layoutItem.isResizable !== false
        );

        return (
            <BoardItem
                parentWidth={width}
                parentHeight={height}
                rows={rows}
                columns={columns}
                cancel={draggableCancel}
                handle={draggableHandle}
                isHidden={layoutItem.isHidden}
                isDraggable={draggable}
                onDragStop={commitWorkingItem}
                isResizable={resizable}
                onResize={this.onResize}
                onResizeStop={this.onResizeStop}
                useCSSTransforms={useCSSTransforms}
                width={layoutItem.width}
                height={layoutItem.height}
                minHeight={layout.minHeight}
                maxHeight={layoutItem.maxHeight}
                minWidth={layoutItem.minWidth}
                maxWidth={layoutItem.maxWidth}
                x={layoutItem.x}
                y={layoutItem.y}
                id={layoutItem.id}
                isStatic={layoutItem.isStatic}>
                {child}
            </BoardItem>
        );
    }

    render() {
        const {
            className,
            children,
            style,
            parentHeight,
            showHidden,
            connectDropTarget,
            workingItem
        } = this.props;

        const mergedClassName = classNames( 'react-board-layout', className, {
            'show-hidden' : showHidden || workingItem
        });

        const mergedStyle = {
            height : `${parentHeight}px`,
            ...style
        };

        return connectDropTarget(
            <div
                className={mergedClassName}
                style={mergedStyle}>
                {React.Children.map(children, this.renderBoardItem)}
                {this.renderPlaceholder()}
            </div>
        ); 
    }
    
}

const boardTarget = {

    hover : function( props, monitor, component ) {
        const item = monitor.getItem();
        const type = monitor.getItemType();

        const clientOffset = monitor.getSourceClientOffset();
        const initialClientOffset = monitor.getInitialSourceClientOffset();

        if ( clientOffset.x === this.x && clientOffset.y === this.y ) {
            return;
        }

        this.x = clientOffset.x;
        this.y = clientOffset.y;

        if ( type === BOARD_ITEM ) {
            const nextXY = calculateXY( clientOffset.y, clientOffset.x, item.height, item.width, props.columns, props.rows, props.height, props.width );

            if ( item.x !== nextXY.x && item.y !== nextXY.y ) {
                component.onDrag( item.id, nextXY.x, nextXY.y );
            }
        }
        else if ( type === RESIZE_HANDLE ) {
            const {
                id,
                width,
                height,
                minConstraints,
                maxConstraints
            } = item;

            const rowHeight = props.height / props.rows;
            const columnWidth = props.width / props.columns;

            const pixelWidth = columnWidth * width;
            const pixelHeight = rowHeight * height;

            const deltaX = clientOffset.x - initialClientOffset.x;
            const deltaY = clientOffset.y - initialClientOffset.y;

            if ( typeof this.slackH === 'undefined' ) {
                this.slackW = 0;
                this.slackH = 0;
            }

            const nextPixelWidth = pixelWidth + deltaX + this.slackW;
            const nextPixelHeight = pixelHeight + deltaY + this.slackH;

            // Picked this up from react-resizable - seems to smooth size changes
            this.slackW += ( pixelWidth + deltaX ) - nextPixelWidth;
            this.slackH += ( pixelHeight + deltaY ) - nextPixelHeight;

            const nextWH = calculateWH( nextPixelHeight, nextPixelWidth, props.columns, props.rows, props.height, props.width, minConstraints, maxConstraints );
            component.onResize( id, nextWH.width, nextWH.height );
        }
    },

    drop : function( props, monitor ) {
        this.x = null;
        this.y = null;

        this.slackW = 0;
        this.slackH = 0;
    }

};

const collect = function( connect, monitor ) {
    return {
        connectDropTarget : connect.dropTarget(),
        isOver : monitor.isOver()
    };
};

export default DropTarget(
    [ BOARD_ITEM, RESIZE_HANDLE ],
    boardTarget,
    collect
)( Board );