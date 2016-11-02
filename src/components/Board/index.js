
import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';
import BoardItem from '../BoardItem';
import { getLayoutItem } from '../../utils/grid';
import './styles.css';

const {
    string,
    object,
    number,
    bool
} = PropTypes;

const noop = function(){};

class Board extends Component {

    static propTypes = {
        className : string,
        style : object,

        // Sizing
        width : number,
        columns : number,
        rows : number,
        draggableCancel : string,
        draggableHandle : string,

        // Layout
        layout : props => {
            
        }
    };

    constructor( props, context ) {
        super(props, context);
        this.renderBoardItem = this.renderBoardItem.bind(this);
        this.state = {};
    }

    onDragStart( id, x, y, { event, node }) {
        const {
            layout
        } = this.state;

        const layoutItem = getLayoutItem( layout, id );

        if ( layoutItem ) {
            this.setState({
                oldDragItem : { ...layoutItem },
                oldLayout : [ ...this.state.layout ]
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

    onDrag() {

    }

    onDragStop() {

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
            isDraggable
        } = this.props;

        const {
            layout
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

        return (
            <BoardItem
                parentWidth={width}
                parentHeight={height}
                rows={rows}
                columns={columns}
                cancel={draggableCancel}
                handle={draggableHandle}
                isDraggable={draggable}
                onDragStart={this.onDragStart}
                onDrag={this.onDrag}
                onDragStop={this.onDragStop}
                useCSSTransforms={useCSSTransforms}
                width={layoutItem.width}
                height={layoutItem.height}
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
            parentHeight
        } = this.props;

        const mergedClassName = classNames( 'react-board-layout', className );
        const mergedStyle = {
            height : `${parentHeight}px`,
            ...style
        };

        return (
            <div
                className={mergedClassName}
                style={mergedStyle}>
                {React.Children.map(children, this.renderBoardItem)}
            </div>
        ); 
    }
    
}

export default Board;