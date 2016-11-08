
import React, { Component, PropTypes } from 'react';
import { NotifyResize } from 'react-notify-resize';
import { setTransform } from '../../utils/style';
import { removeElement, setLayoutItemBounds, addOrUpdateElement, getLayoutItem } from '../../utils/grid';
import { DragDropContext } from 'react-dnd';
import BoardThumbnail from '../BoardThumbnail';
import HTML5Backend from 'react-dnd-html5-backend';
import _ from 'lodash';
import './styles.css';

const {
    array,
    bool,
    func,
    number,
    objectOf
} = PropTypes;

const noop = function(){};

class BoardSet extends Component {

    static propTypes = {
        maxBoards : number,
        showHidden : bool,
        boardLayouts : objectOf( array ).isRequired,
        onBoardLayoutsChange : func
    };

    static defaultProps = {
        maxBoards   : Infinity,
        showHidden  : false,
        onBoardLayoutsChange : noop
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

        let didMount = false;

        if ( !height && !width ) {
            // Initial mount
            didMount = true;
            nextSize.mounted = true;
            nextSize.boardLayouts = this.props.boardLayouts;
        }

        this.setState( nextSize );
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

        if ( selectedIndex !== index ) {
            const updates = {
                selectedIndex : index
            };

            if ( workingItem ) {
                const board = this.props.children[ index ];

                if ( board ) {
                    updates.workingItem = {
                        ...workingItem,
                        boardId : board.props.name
                    };
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

    onUpdateItemPosition( boardId, itemId, nextPosition ) {
        const {
            workingItem,
            boardLayouts
        } = this.state;

        if ( !workingItem ) {
            throw new Error( 'No working item available to update.  Check that setWorkingItem isn\' called before updateItemPosition' );
        }

        const originalBoardId  = workingItem.originalBoardId;
        const prevBoardLayouts = this.state.boardLayouts;
        const nextBoardLayouts = { ...prevBoardLayouts };
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

    render() {
        const {
            children,
            maxBoards,
            showHidden
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

        return (
            <div className="board-set">
                <div className="board-thumbnails">
                    {React.Children.map( children, ( child, index ) => (
                        <BoardThumbnail
                            index={index}
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

                        const boardWorkingItem = workingItem && workingItem.boardId === boardId ?
                            workingItem.item : null;
                        const setWorkingItem = item => this.onSetWorkingItem( boardId, item );
                        const updateItemPosition = ( itemId, layout ) => this.onUpdateItemPosition( boardId, itemId, layout );

                        return React.cloneElement( child, {
                            boardSet : this,
                            showHidden,
                            active,
                            style,
                            height,
                            width,
                            layout,
                            columns : 12,
                            rows : 12,
                            workingItem : boardWorkingItem,
                            setWorkingItem,
                            updateItemPosition
                        });
                    })}
                </div>
            </div>
        );
    }

}

export default DragDropContext( HTML5Backend )( BoardSet );