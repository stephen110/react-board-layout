
import React, { PropTypes } from 'react';
import { DragSource } from 'react-dnd';
import { RESIZE_HANDLE } from '../../constants';
import './styles.css';

const {
    arrayOf,
    number,
    string
} = PropTypes;

const ResizeHandle = props => {
    const {
        connectDragSource,
        connectDragPreview
    } = props;

    return connectDragSource(
        <span className="resizable-handle">
            {connectDragPreview(
                <span />
            )}
        </span>
    )
};

ResizeHandle.propTypes = {
    id : string.isRequired,
    width : number.isRequired,
    height : number.isRequired,
    minConstraints : arrayOf( number ).isRequired,
    maxConstraints : arrayOf( number ).isRequired
};

const source = {
    beginDrag : function( props ) {
        const {
            id,
            width,
            height,
            minConstraints,
            maxConstraints
        } = props;

        return {
            id,
            width,
            height,
            minConstraints,
            maxConstraints
        };
    }
};

const collect = function( connect ) {
    return {
        connectDragSource : connect.dragSource(),
        connectDragPreview: connect.dragPreview()
    };
};

export default DragSource(
    RESIZE_HANDLE,
    source,
    collect
)( ResizeHandle );