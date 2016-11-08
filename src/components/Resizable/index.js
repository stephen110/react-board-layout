
import React, { PropTypes, Component } from 'react';
import { DragSource, DragLayer } from 'react-dnd';
import { RESIZE_HANDLE } from '../../constants';
import classNames from 'classnames';
import './styles.css';

const {
    array,
    arrayOf,
    element,
    number,
    func
} = PropTypes;

const handleCollection = () => ({});

const Handle = () => (
    <div style={{height: '0', width: '0'}} />
);

const HandleLayer = DragLayer( handleCollection )( Handle );

class Resizable extends Component {

    static propTypes = {
        children : element.isRequired,
        width : number.isRequired,
        height : number.isRequired,

        // If you change this, be sure to update your css
        handleSize: array,

        // Min/max size
        minConstraints: arrayOf( number ),
        maxConstraints: arrayOf( number ),

        // Callbacks
        onResizeStop: func,
        onResizeStart: func,
        onResize: func,
    };

    static defaultProps =  {
        handleSize: [ 20, 20 ],
        minConstraints: [ 20, 20 ],
        maxConstraints: [ Infinity, Infinity ]
    };

    state = {
        resizing : false,
        width : this.props.width,
        height: this.props.height,
        slackW : 0,
        slackH: 0
    };

    constructor( props, context ) {
        super( props, context );
        this.onResize = this.onResize.bind( this );
    }

    componentWillReceiveProps( nextProps ) {
        // If parent changes height/width, set that in our state.
        if ( !this.state.resizing &&
            ( nextProps.width !== this.state.width || nextProps.height !== this.state.height ) ) {
            this.setState({
                width: nextProps.width,
                height: nextProps.height
            });
        }
    }

    // If you do this, be careful of constraints
    runConstraints(width, height) {
        const [min, max] = [this.props.minConstraints, this.props.maxConstraints];

        if (!min && !max) return [width, height];

        const [oldW, oldH] = [width, height];

        // Add slack to the values used to calculate bound position. This will ensure that if
        // we start removing slack, the element won't react to it right away until it's been
        // completely removed.
        let {slackW, slackH} = this.state;
        width += slackW;
        height += slackH;

        if (min) {
            width = Math.max(min[0], width);
            height = Math.max(min[1], height);
        }
        if (max) {
            width = Math.min(max[0], width);
            height = Math.min(max[1], height);
        }

        // If the numbers changed, we must have introduced some slack. Record it for the next iteration.
        slackW += (oldW - width);
        slackH += (oldH - height);
        if (slackW !== this.state.slackW || slackH !== this.state.slackH) {
            this.setState({slackW, slackH});
        }

        return [width, height];
    }

    /**
     * Wrapper around drag events to provide more useful data.
     *
     * @param  {String} handlerName Handler name to wrap.
     * @return {Function}           Handler function.
     */
    // resizeHandler(handlerName): Function {
    //     return (e: Event, {node, deltaX, deltaY}: DragCallbackData) => {
    //         let width = this.state.width + deltaX;
    //         let height = this.state.height + deltaY;
    //
    //         // Early return if no change
    //         const widthChanged = width !== this.state.width, heightChanged = height !== this.state.height;
    //         if (handlerName === 'onResize' && !widthChanged && !heightChanged) return;
    //
    //         [width, height] = this.runConstraints(width, height);
    //
    //         // Set the appropriate state for this handler.
    //         const newState = {};
    //         if (handlerName === 'onResizeStart') {
    //             newState.resizing = true;
    //         } else if (handlerName === 'onResizeStop') {
    //             newState.resizing = false;
    //             newState.slackW = newState.slackH = 0;
    //         } else {
    //             // Early return if no change after constraints
    //             if (width === this.state.width && height === this.state.height) return;
    //             newState.width = width;
    //             newState.height = height;
    //         }
    //
    //         this.setState(newState, () => {
    //             this.props[handlerName] && this.props[handlerName](e, {node, size: {width, height}});
    //         });
    //
    //     };
    // }

    onResizeStart() {



    }

    onResize( width, height ) {
        [ width, height ] = this.runConstraints( width, height );

        if ( width === this.state.width && height === this.state.height ) {
            return;
        }

        this.setState({
            height,
            width
        });

        this.props.onResize({
            height,
            width
        });
    }

    onResizeStop() {
        const {
            height,
            width
        } = this.state;

        this.setState({
            resizing : false,
            slackW : 0,
            slackH : 0
        });

        this.props.onResizeStop({
            height,
            width
        });
    }

    render() {
        console.log( this );

        const {
            children,
            connectDragSource,
            connectDragPreview
        } = this.props;

        const child = React.Children.only( children );
        const mergedClassName = classNames( 'resizable', this.props.className );
        const mergedStyle = {};

        const nextChildren = [
            child.props.children,
            connectDragSource(
                <span className="resizable-handle" />
            ),
            connectDragPreview(
                <span style={{height: '0', width: '0'}} />
            )
        ];

        return React.cloneElement( child, {}, nextChildren );
    }

}

const source = {

    beginDrag : function( props, monitor, component ) {
        const {
            height,
            width
        } = props;

        const {
            onResize
        } = component;

        return {
            onResize,
            height,
            width
        };
    },

    endDrag: function( props, monitor, component ) {
        component.onResizeStop();
    }

};

const collect = function( connect, monitor ) {
    return {
        connectDragSource : connect.dragSource(),
        connectDragPreview: connect.dragPreview(),
        isDragging : monitor.isDragging()
    };
};

export default DragSource(
    RESIZE_HANDLE,
    source,
    collect
)( Resizable );