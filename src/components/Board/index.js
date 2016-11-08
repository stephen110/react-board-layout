
import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';
import BoardItem from '../BoardItem';
import { DropTarget } from 'react-dnd';
import { getLayoutItem, moveElement, resizeElement, canMoveElement } from '../../utils/grid';
import { BOARD_ITEM } from '../../constants';
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

        updateItemPosition : func
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
        onLayoutChange : noop,
        setWorkingItem : noop
    };

    constructor( props, context ) {
        super(props, context);
        this.renderBoardItem = this.renderBoardItem.bind(this);
        this.onDragStart     = this.onDragStart.bind( this );
        this.onDrag          = this.onDrag.bind( this );
        this.onDragStop      = this.onDragStop.bind( this );
        this.onResizeStart   = this.onResizeStart.bind( this );
        this.onResize        = this.onResize.bind( this );
        this.onResizeStop    = this.onResizeStop.bind( this );
    }

    getChildContext() {
        return {
            board : this
        };
    }

    onDragStart( id ) {}

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
            layoutItem = workingItem;
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

    onDragStop( id, x, y ) {
        let {
            setWorkingItem,
            workingItem,
            updateItemPosition
        } = this.props;

        if ( !workingItem ) {
            return;
        }

        updateItemPosition( id, workingItem );
        setWorkingItem( null );
    }

    onResizeStart( id ) {
        const {
            layout,
            setWorkingItem
        } = this.props;

        const layoutItem = getLayoutItem( layout, id );

        if ( !layoutItem ) {
            return;
        }

        setWorkingItem( layoutItem );
    }

    onResize( id, width, height ) {
        let {
            name,
            layout,
            onLayoutChange,
            setWorkingItem
        } = this.props;

        const layoutItem = getLayoutItem( layout, id );

        if ( !layoutItem ) {
            return;
        }

        const placeholder = {
            id,
            x : layoutItem.x,
            y : layoutItem.y,
            width,
            height,
            isStatic : true
        };

        layout = resizeElement( layout, layoutItem, width, height );
        onLayoutChange( name, layout );
        setWorkingItem( placeholder );
    }

    onResizeStop( id, width, height ) {
        let {
            name,
            layout,
            onLayoutChange,
            setWorkingItem
        } = this.props;

        const layoutItem = getLayoutItem( layout, id );

        if ( !layoutItem ) {
            return;
        }

        layout = resizeElement( layout, layoutItem, width, height );
        onLayoutChange( name, layout );
        setWorkingItem( null );
    }

    renderPlaceholder() {
        const {
            useCSSTransforms,
            workingItem,
            width,
            height,
            columns,
            rows
        } = this.props;

        if ( !workingItem ) {
            return null;
        }

        return (
            <BoardItem
                id={workingItem.id}
                x={workingItem.x}
                y={workingItem.y}
                height={workingItem.height}
                width={workingItem.width}
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
            layout
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
                onDragStart={this.onDragStart}
                onDragStop={this.onDragStop}
                isResizable={resizable}
                onResizeStart={this.onResizeStart}
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
        const clientOffset = monitor.getSourceClientOffset();

        const {
            calculateXY
        } = item;

        if ( clientOffset.x !== this.x || clientOffset.y !== this.y ) {
            const { x, y } = calculateXY( clientOffset.y, clientOffset.x );

            if ( item.x !== x && item.y !== y ) {
                component.onDrag( item.id, x, y, {} );
            }

            this.x = clientOffset.x;
            this.y = clientOffset.y;
        }
    },

    drop : function( props, monitor, component ) {
        this.x = null;
        this.y = null;

        const item = monitor.getItem();
        const clientOffset = monitor.getSourceClientOffset();

        const { calculateXY } = item;
        const { x, y } = calculateXY( clientOffset.y, clientOffset.x, item );

        component.onDragStop( item.id, x, y );
    }

};

const collect = function( connect, monitor ) {
    return {
        connectDropTarget : connect.dropTarget(),
        isOver : monitor.isOver()
    };
};

export default DropTarget(
    BOARD_ITEM,
    boardTarget,
    collect
)( Board );