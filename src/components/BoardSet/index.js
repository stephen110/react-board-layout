
import React, { Component, PropTypes } from 'react';
import { NotifyResize } from 'react-notify-resize';
import { setTransform } from '../../utils/style';
import { removeElement, setLayoutItemBounds, addOrUpdateElement, getLayoutItem, canMoveElement } from '../../utils/grid';
import { DragDropContext } from 'react-dnd';
import BoardThumbnail from './thumbnail';
import BoardEdge from './edge';
import HTML5Backend from 'react-dnd-html5-backend';
import _ from 'lodash';
import './styles.css';

const {
    array,
    bool,
    func,
    number,
    objectOf,
    object
} = PropTypes;

const noop = function(){};

class BoardSet extends Component {

    static propTypes = {
        maxBoards : number,
        showHidden : bool,
        boardLayouts : objectOf( array ).isRequired,
        onBoardLayoutsChange : func,
        onSizeChange : func,
        breakpoints : object
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
        oldBoardLayouts : null,
        selectedIndex : 0
    };

    constructor( props, context ) {
        super( props, context );
        this.onResize = this.onResize.bind( this );
        this.onSelectBoard = this.onSelectBoard.bind( this );
        this.onCreateBoard = this.onCreateBoard.bind( this );
        this.onSetWorkingItem = this.onSetWorkingItem.bind( this );
        this.onUpdateItemPosition = this.onUpdateItemPosition.bind( this );
        this.onUpdateItemSize = this.onUpdateItemSize.bind( this );
        this.onCommitWorkingItem = this.onCommitWorkingItem.bind( this );
    }

    componentWillReceiveProps( nextProps ) {
        const {
            boardLayouts
        } = nextProps;

        // TODO: Merge w/ working copy
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

    onSelectBoard( index ) {
        const {
            workingItem,
            selectedIndex
        } = this.state;

        const {
            boardLayouts
        } = this.props;

        if ( selectedIndex !== index ) {
            const updates = {
                selectedIndex : index
            };

            if ( workingItem ) {
                const board = this.props.children[ index ];

                if ( board && boardLayouts ) {
                    const boardLayout = boardLayouts[ board.key ];

                    // Find open space
                    if ( canMoveElement( workingItem.item.id, workingItem.item, boardLayout ) ) {
                        updates.workingItem = {
                            ...workingItem,
                            boardId : board.key
                        };
                    }
                }
            }

            this.setState( updates );
        }
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

            this.setState({
                selectedIndex : currentBoardCount
            });
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
            throw new Error( 'No working item available to update.  Check that setWorkingItem isn\' called before updateItemPosition' );
        }

        const boardId          = workingItem.boardId;
        const originalBoardId  = workingItem.originalBoardId;
        const prevBoardLayouts = boardLayouts;
        const nextBoardLayouts = { ...boardLayouts };
        const prevBoardLayout  = boardLayouts[ boardId ] || [];
        let layoutItem = null;

        if ( boardId !== originalBoardId ) {
            // Swap item between boards
            const originalBoardLayout = boardLayouts[ originalBoardId ] || [];
            layoutItem = getLayoutItem( originalBoardLayout, itemId );

            if ( layoutItem ) {
                nextBoardLayouts[ originalBoardId ] = removeElement( originalBoardLayout, itemId );
            }
        }
        else {
            layoutItem = getLayoutItem( prevBoardLayout, itemId );
        }

        if ( !layoutItem ) {
            return;
        }

        const nextLayoutItem  = setLayoutItemBounds( layoutItem, nextPosition );
        nextBoardLayouts[ boardId ] = addOrUpdateElement( prevBoardLayout, nextLayoutItem );

        this.setState({
            boardLayouts : nextBoardLayouts
        });

        return this.onBoardLayoutsMayHaveChanged( nextBoardLayouts, prevBoardLayouts );
    }

    onUpdateItemSize( boardId, itemId, nextSize ) {
        const {
            boardLayouts
        } = this.state;

        const prevBoardLayouts = boardLayouts;
        const nextBoardLayouts = { ...boardLayouts };

        const boardLayout = boardLayouts[ boardId ] || [];
        const layoutItem  = getLayoutItem( boardLayout, itemId );

        if ( !layoutItem ) {
            return;
        }

        const nextLayoutItem = setLayoutItemBounds( layoutItem, nextSize );
        nextBoardLayouts[ boardId ] = addOrUpdateElement( boardLayout, nextLayoutItem );

        this.setState({
            boardLayouts : nextBoardLayouts
        });

        return this.onBoardLayoutsMayHaveChanged( nextBoardLayouts, prevBoardLayouts );
    }

    render() {
        const {
            children,
            maxBoards,
            showHidden,
            breakpoints
        } = this.props;

        const {
            height,
            width,
            selectedIndex,
            workingItem,
            boardLayouts
        } = this.state;

        const childCount = React.Children.count( children );
        const maximumReached = ( typeof maxBoards === 'number' ) && childCount >= maxBoards;

        const clickHandler = index => {
            return () => {
                if ( index !== this.state.selectedIndex ) {
                    this.setState({
                        selectedIndex : index
                    });
                }
            };
        };

        const leftActivate = () => this.onSelectBoard( selectedIndex - 1 );
        const rightActivate = () => this.onSelectBoard( selectedIndex + 1 );
        const leftActivateEnabled = selectedIndex > 0;
        const rightActivateEnabled = selectedIndex < React.Children.count( children ) - 1;

        return (
            <div className="board-set">
                <BoardEdge
                    className="board-edge--left"
                    onActivate={leftActivate}
                    isEnabled={leftActivateEnabled}
                />
                <BoardEdge
                    className="board-edge--right"
                    onActivate={rightActivate}
                    isEnabled={rightActivateEnabled}
                />
                <div className="board-thumbnails">
                    {React.Children.map( children, ( child, index ) => (
                        <BoardThumbnail
                            index={index}
                            name={child.props.name}
                            onClick={clickHandler(index)}
                            selected={index === selectedIndex}
                            selectBoard={this.onSelectBoard}
                        />
                    ))}
                    {maximumReached ? null :
                        <div
                            className="board-thumbnail"
                            onClick={this.onCreateBoard}>
                            +
                        </div>
                    }
                </div>
                <div className="boards-container">
                    <NotifyResize
                        onResize={this.onResize}
                        notifyOnMount={true}
                    />
                    {React.Children.map( children, ( child, index ) => {
                        // Will occur on first render, prior to NotifyResize mounting
                        if ( !height || !width ) {
                            return null;
                        }

                        const boardId = child.key;
                        const layout  = boardLayouts[ boardId ];
                        const active  = index === selectedIndex;

                        const style = setTransform({
                            top  : 0,
                            left :  ( index - selectedIndex ) * width,
                            width,
                            height
                        });

                        const setWorkingItem = item => this.onSetWorkingItem( boardId, item );
                        const updateItemPosition = ( itemId, layout ) => this.onUpdateItemPosition( itemId, layout );
                        const updateItemSize = ( itemId, layout ) => this.onUpdateItemSize( boardId, itemId, layout );

                        return React.cloneElement( child, {
                            boardSet : this,
                            id : boardId,
                            showHidden,
                            active,
                            style,
                            height,
                            width,
                            layout,
                            breakpoints,
                            columns : 12,
                            rows : 12,
                            workingItem,
                            setWorkingItem,
                            updateItemPosition,
                            updateItemSize,
                            commitWorkingItem : this.onCommitWorkingItem
                        });
                    })}
                </div>
            </div>
        );
    }

}

export default DragDropContext( HTML5Backend )( BoardSet );