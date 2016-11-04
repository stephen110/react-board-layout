
import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';
import BoardItem from '../BoardItem';
import { getLayoutItem, moveElement, resizeElement } from '../../utils/grid';
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

        onDragStart : func,
        onDrag : func,
        onDragStop : func,
        onResizeStart : func,
        onResize : func,
        onResizeStop : func,

        // Layout
        layout : arrayOf( object ).isRequired,

        // Callbacks
        onLayoutChange : func
    };

    static childContextTypes = {
        board : object,
        getBoardElement : func
    };

    static defaultProps = {
        columns : 12,
        rows    : 12,
        layout  : [],
        isDraggable : true,
        isResizable : true,
        useCSSTransforms : true,
        onLayoutChange : noop,
        onDragStart : noop,
        onDrag : noop,
        onDragStop : noop,
        onResizeStart : noop,
        onResize : noop,
        onResizeStop : noop
    };

    constructor( props, context ) {
        super(props, context);

        this.renderBoardItem = this.renderBoardItem.bind(this);
        this.onDragStart     = this.onDragStart.bind( this );
        this.onDrag          = this.onDrag.bind( this );
        this.onDragStop      = this.onDragStop.bind( this );
        this.onResizeStart  = this.onResizeStart.bind( this );
        this.onResize       = this.onResize.bind( this );
        this.onResizeStop   = this.onResizeStop.bind( this );

        this.state = {
            activeDrag : null,
            activeResize : null,
            oldDragItem : null,
            oldLayout : null
        };
    }

    getChildContext() {
        return {
            board : this,
            getBoardElement : () => {
                return this.refs.element;
            }
        };
    }

    onDragStart( id, x, y, { event, node }) {
        const {
            layout
        } = this.props;

        const layoutItem = getLayoutItem( layout, id );

        if ( layoutItem ) {
            this.setState({
                oldDragItem : { ...layoutItem },
                oldLayout   : [ ...layout ],
                activeDrag  : layoutItem
            });

            this.props.onDragStart(
                layout,
                layoutItem,
                layoutItem,
                null,
                event,
                node
            );
        }
    }

    onDrag( id, x, y, { event, node } ) {
        const {
            oldDragItem
        } = this.state;

        let {
            layout,
            onLayoutChange,
            onDrag
        } = this.props;

        const layoutItem = getLayoutItem( layout, id );

        if ( !layoutItem ) {
            return;
        }

        layout = moveElement( layout, layoutItem, x, y, true );
        onDrag( layout, oldDragItem, layoutItem, event, node );
        onLayoutChange( layout, this );

        this.setState({
            activeDrag : {
                id      : layoutItem.id,
                x       : layoutItem.x,
                y       : layoutItem.y,
                height  : layoutItem.height,
                width   : layoutItem.width,
                placeholder : true
            }
        });
    }

    onDragStop( id, x, y, { event, node } ) {
        const {
            oldDragItem
        } = this.state;

        let {
            layout,
            onLayoutChange,
            onDragStop
        } = this.props;

        const layoutItem = getLayoutItem( layout, id );

        if ( !layoutItem ) {
            return;
        }

        this.setState({
            activeDrag  : null,
            oldDragItem : null,
            oldLayout   : null
        });

        layout = moveElement( layout, layoutItem, x, y, true );
        onDragStop( layout, oldDragItem, layoutItem, null, event, node );
        onLayoutChange( layout, this );
    }

    onResizeStart( id, width, height, { event, node } ) {
        const {
            layout,
            onResizeStart
        } = this.props;

        const layoutItem = getLayoutItem( layout, id );

        if ( !layoutItem ) {
            return;
        }

        this.setState({
            oldResizeItem : { ...layoutItem },
            oldLayout     : [ ...layout ],
            activeResize  : layoutItem
        });

        onResizeStart( layout, layoutItem, layoutItem, null, event, node );
    }

    onResize( id, width, height, { event, node } ) {
        const {
            oldResizeItem
        } = this.state;

        let {
            layout,
            onResize,
            onLayoutChange
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
        onResize( layout, oldResizeItem, layoutItem, placeholder, event, node );
        onLayoutChange( layout, this );

        this.setState({
            activeResize : layoutItem
        });
    }

    onResizeStop( id, width, height, { event, node } ) {
        const {
            oldResizeItem
        } = this.state;

        let {
            layout,
            onResizeStop,
            onLayoutChange
        } = this.props;

        const layoutItem = getLayoutItem( layout, id );

        if ( !layoutItem ) {
            return;
        }

        layout = resizeElement( layout, layoutItem, width, height );
        onResizeStop( layout, oldResizeItem, layoutItem, null, event, node );
        onLayoutChange( layout, this );

        this.setState({
            activeResize : null,
            oldResizeItem : null,
            oldLayout : null
        });
    }


    renderPlaceholder() {
        const {
            activeDrag
        } = this.state;

        if ( !activeDrag ) {
            return null;
        }

        const {
            width,
            height,
            columns,
            rows,
            useCSSTransforms
        } = this.props;

        return (
            <BoardItem
                id={activeDrag.id}
                x={activeDrag.x}
                y={activeDrag.y}
                height={activeDrag.height}
                width={activeDrag.width}
                parentWidth={width}
                parentHeight={height}
                columns={columns}
                rows={rows}
                useCSSTransforms={useCSSTransforms}
                isDraggable={false}
                isResizable={false}
                isHidden={false}>
                <div>
                    <div
                        className="react-board-placeholder"
                    />
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
                onDrag={this.onDrag}
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
            showHidden
        } = this.props;

        const {
            activeDrag,
            activeResize
        } = this.state;

        const mergedClassName = classNames( 'react-board-layout', className, {
            'show-hidden' : showHidden || activeDrag || activeResize
        });

        const mergedStyle = {
            height : `${parentHeight}px`,
            ...style
        };

        return (
            <div
                ref="element"
                className={mergedClassName}
                style={mergedStyle}>
                {React.Children.map(children, this.renderBoardItem)}
                {this.renderPlaceholder()}
            </div>
        ); 
    }
    
}

export default Board;