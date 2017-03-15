
import React, { Component, PropTypes } from 'react';
import { NotifyResize } from '@zippytech/react-notify-resize';
import { removeElement, setLayoutItemBounds, addOrUpdateElement, getLayoutItem, getBoard } from '../../utils/grid';
import classNames from 'classnames';
import _ from 'lodash';

const {
    arrayOf,
    bool,
    func,
    number,
    object
} = PropTypes;


const noop = function(){};

export default class BoardSet extends Component {

    static propTypes = {
        maxBoards : number,
        showHidden : bool,
        boardLayouts : arrayOf( object ).isRequired,
        onBoardLayoutsChange : func,
        onSizeChange : func,
        breakpoints : object
    };

    static childContextTypes = {
        setWorkingItem : func,
        commitWorkingItem : func,
        updateItemPosition : func,
        updateItemSize : func
    };

    static defaultProps = {
        maxBoards   : Infinity,
        showHidden  : false,
        onBoardLayoutsChange : noop,
        onSizeChange : noop
    };

    // Initial state
    state = {
        mounted : false,
        height : null,
        width : null,
        workingItem : null,
        boardLayouts : null,
        oldBoardLayouts : null
    };

    constructor( props, context ) {
        super( props, context );
        this.onResize = this.onResize.bind( this );
        this.onCreateBoard = this.onCreateBoard.bind( this );
        this.onSetWorkingItem = this.onSetWorkingItem.bind( this );
        this.onUpdateItemPosition = this.onUpdateItemPosition.bind( this );
        this.onUpdateItemSize = this.onUpdateItemSize.bind( this );
        this.onCommitWorkingItem = this.onCommitWorkingItem.bind( this );
    }

    getChildContext() {
        return {
            setWorkingItem : this.onSetWorkingItem,
            commitWorkingItem : this.onCommitWorkingItem,
            updateItemPosition : this.onUpdateItemPosition,
            updateItemSize : this.onUpdateItemSize
        };
    }

    componentWillReceiveProps( nextProps ) {
        const {
            boardLayouts
        } = nextProps;

        if ( !_.isEqual( boardLayouts, this.state.boardLayouts ) ) {
            const oldLayout = this.state.boardLayouts;

            this.setState({
                boardLayouts : boardLayouts
            });

            this.onBoardLayoutsMayHaveChanged( boardLayouts, oldLayout );
        }
    }

    onBoardLayoutsMayHaveChanged( newLayout, oldLayout ) {
        const {
            onBoardLayoutsChange
        } = this.props;

        if ( !_.isEqual( oldLayout, newLayout ) ) {
            onBoardLayoutsChange( newLayout );
        }
    }

    onResize( nextSize ) {
        const {
            height,
            width
        } = this.state;

        const {
            onSizeChange
        } = this.props;

        if ( !height && !width ) {
            // Initial mount
            nextSize.mounted = true;
            nextSize.boardLayouts = this.props.boardLayouts;
        }

        this.setState( nextSize );
        onSizeChange( nextSize );
    }

    onSetWorkingItem( boardId, item ) {
        const {
            workingItem
        } = this.state;

        if ( !item ) {
            return this.setState({
                workingItem : null
            });
        }

        const updates = {
            boardId,
            item
        };

        updates.originalBoardId = workingItem ?
            workingItem.originalBoardId : boardId;

        this.setState({
            workingItem : updates
        });
    }

    onCreateBoard() {
        const {
            onCreateBoard,
            children,
            maxBoards
        } = this.props;

        const currentBoardCount = React.Children.count( children );

        if ( typeof maxBoards === 'number' ) {
            if ( currentBoardCount >= maxBoards ) {
                return;
            }
        }

        if ( onCreateBoard ) {
            onCreateBoard();
        }
    }

    onCommitWorkingItem( id ) {
        const {
            workingItem
        } = this.state;

        if ( !workingItem ) {
            return;
        }

        this.onUpdateItemPosition( id, workingItem.item );
        this.onSetWorkingItem( null, null );
    }

    onUpdateItemPosition( itemId, nextPosition ) {
        const {
            workingItem,
            boardLayouts
        } = this.state;

        if ( !workingItem ) {
            throw new Error( 'No working item available to update.  Check that setWorkingItem isn\'t called before updateItemPosition' );
        }

        const boardId          = workingItem.boardId;
        const originalBoardId  = workingItem.originalBoardId;
        const prevBoardLayouts = boardLayouts;
        const nextBoardLayouts = [ ...boardLayouts ];
        const prevBoardLayout  = getBoard( boardLayouts, boardId ) || {};
        let layoutItem = null;

        if ( boardId !== originalBoardId ) {
            // Swap item between boards
            const originalBoardLayout = getBoard( boardLayouts, originalBoardId ) || {};
            layoutItem = getLayoutItem( originalBoardLayout.cards, itemId );

            if ( layoutItem ) {
                const originalIndex = boardLayouts.indexOf( originalBoardLayout );
                nextBoardLayouts[ originalIndex ] = {
                    ...originalBoardLayout,
                    cards : removeElement(
                        originalBoardLayout.cards,
                        itemId
                    )
                };
            }
        }
        else {
            layoutItem = getLayoutItem(
                prevBoardLayout.cards,
                itemId
            );
        }

        if ( !layoutItem ) {
            if ( !workingItem ) {
                return;
            }

            layoutItem = {
                ...workingItem.item
            };

            delete layoutItem.placeholder;
        }

        const nextLayoutItem  = setLayoutItemBounds( layoutItem, nextPosition );
        const boardIndex = nextBoardLayouts.indexOf( prevBoardLayout );
        nextBoardLayouts[ boardIndex ] = {
            ...prevBoardLayout,
            cards : addOrUpdateElement(
                prevBoardLayout.cards,
                nextLayoutItem
            )
        };

        this.setState({
            boardLayouts : nextBoardLayouts
        });

        return this.onBoardLayoutsMayHaveChanged(
            nextBoardLayouts,
            prevBoardLayouts
        );
    }

    onUpdateItemSize( boardId, itemId, nextSize ) {
        const {
            boardLayouts
        } = this.state;

        const prevBoardLayouts = boardLayouts;
        const nextBoardLayouts = [ ...boardLayouts ];

        const boardLayout = getBoard( boardLayouts, boardId ) || {};
        const layoutItem  = getLayoutItem( boardLayout.cards, itemId );

        if ( !layoutItem ) {
            return;
        }

        const nextLayoutItem = setLayoutItemBounds( layoutItem, nextSize );
        const boardIndex = boardLayouts.indexOf( boardLayout );
        nextBoardLayouts[ boardIndex ] = {
            ...boardLayout,
            cards : addOrUpdateElement(
                boardLayout.cards,
                nextLayoutItem
            )
        };

        this.setState({
            boardLayouts : nextBoardLayouts
        });

        return this.onBoardLayoutsMayHaveChanged(
            nextBoardLayouts,
            prevBoardLayouts
        );
    }

    render() {
        const {
            children,
            maxBoards,
            showHidden,
            breakpoints,
            className,
            columns,
            isDraggable,
            isResizable,
            rows
        } = this.props;

        const {
            height,
            width,
            workingItem,
            boardLayouts
        } = this.state;

        const boardProps = {
            boardSet : this,
            showHidden,
            breakpoints,
            maxBoards,
            isDraggable,
            isResizable,
            columns,
            rows,
            workingItem,
            setWorkingItem : this.onSetWorkingItem,
            updateItemPosition : this.onUpdateItemPosition,
            updateItemSize : this.onUpdateItemSize,
            commitWorkingItem : this.onCommitWorkingItem
        };

        return (
            <div className={classNames('board-set', className)}>
                <NotifyResize
                    onResize={this.onResize}
                    notifyOnMount={true}
                />
                {height && width ? React.Children.map( children, ( child, index ) => child ? React.cloneElement( child, {
                        parentHeight : height,
                        parentWidth : width,
                        boardProps,
                        boards : boardLayouts
                    }) : null ) : null}
            </div>
        );
    }

}

