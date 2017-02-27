
import React, { Component, PropTypes } from 'react';
import { findDOMNode } from 'react-dom';
import { NotifyResize } from '@zippytech/react-notify-resize';
import classNames from 'classnames';
import BoardItem from '../BoardItem';
import { DropTarget } from 'react-dnd';
import { getLayoutItem, canMoveElement, calculateXY, calculateWH } from '../../utils/grid';
import { BOARD_ITEM, RESIZE_HANDLE } from '../../constants';

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
        columns : number,
        rows : number,
        draggableCancel : string,
        draggableHandle : string,
        breakpoints : object,

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
        this.onDrag = this.onDrag.bind( this );
        this.onResize = this.onResize.bind( this );

        this.state = {
            height : null,
            width : null
        };
    }

    getChildContext() {
        return {
            board : this
        };
    }

    onDrag( itemId, x, y, height, width ) {
        let {
            layout,
            setWorkingItem
        } = this.props;

        const nextLayoutItem = {
            height,
            width,
            x,
            y
        };

        if ( !canMoveElement( itemId, nextLayoutItem, layout ) ) {
            return;
        }

        nextLayoutItem.id = itemId;
        nextLayoutItem.placeholder = true;
        setWorkingItem( this.props.id, nextLayoutItem );
    }

    onResize( itemId, width, height ) {
        let {
            layout,
            updateItemSize
        } = this.props;

        let layoutItem = getLayoutItem( layout, itemId );

        if ( !layoutItem ) {
            return;
        }

        const nextLayoutItem = {
            x : layoutItem.x,
            y : layoutItem.y,
            height,
            width
        };

        if ( !canMoveElement( itemId, nextLayoutItem, layout ) ) {
            return;
        }

        updateItemSize(
            this.props.id,
            itemId,
            nextLayoutItem
        );
    }

    onBoardResize = ( nextSize ) => {
        this.setState( nextSize );
    };

    renderPlaceholder() {
        const {
            id,
            useCSSTransforms,
            workingItem,
            columns,
            rows
        } = this.props;

        const {
            width,
            height
        } = this.state;

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
                <div className="working-item-container">
                    <div className="board-item--working" />
                </div>
            </BoardItem>
        );
    }

    renderBoardItem( child ) {
        const {
            columns,
            rows,
            useCSSTransforms,
            draggableHandle,
            draggableCancel,
            isDraggable,
            isResizable,
            layout,
            commitWorkingItem,
            breakpoints
        } = this.props;

        if ( !child ) {
            return null;
        }

        const {
            width,
            height
        } = this.state;

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
                useCSSTransforms={useCSSTransforms}
                width={layoutItem.width}
                height={layoutItem.height}
                minHeight={layout.minHeight}
                maxHeight={layoutItem.maxHeight}
                minWidth={layoutItem.minWidth}
                maxWidth={layoutItem.maxWidth}
                breakpoints={breakpoints}
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
            showHidden,
            connectDropTarget,
            workingItem
        } = this.props;

        const {
            height,
            width
        } = this.state;

        const mergedClassName = classNames( 'board', className, {
            'show-hidden' : showHidden || workingItem
        });

        return connectDropTarget(
            <div
                className={mergedClassName}
                style={style}>
                <NotifyResize
                    onResize={this.onBoardResize}
                    notifyOnMount={true}
                />
                {height && width && React.Children.map(children, this.renderBoardItem)}
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

        const parentNode = findDOMNode( component );
        const parentBounds = parentNode.getBoundingClientRect();

        if ( type === BOARD_ITEM ) {
            const x = clientOffset.x - parentBounds.left;
            const y = clientOffset.y - parentBounds.top;

            const nextXY = calculateXY( y, x, item.height, item.width, props.columns, props.rows, parentBounds.height, parentBounds.width );

            if ( item.x !== nextXY.x && item.y !== nextXY.y ) {
                component.onDrag( item.id, nextXY.x, nextXY.y, item.height, item.width );
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

            const rowHeight = parentBounds.height / props.rows;
            const columnWidth = parentBounds.width / props.columns;

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

            const nextWH = calculateWH( nextPixelHeight, nextPixelWidth, props.columns, props.rows, parentBounds.height, parentBounds.width, minConstraints, maxConstraints );
            component.onResize( id, nextWH.width, nextWH.height );
        }
    },

    drop : function() {
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