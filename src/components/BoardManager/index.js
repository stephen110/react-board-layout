
import React, { Component, PropTypes } from 'react';
import { NotifyResize } from 'react-notify-resize';
import classNames from 'classnames';
import './styles.css';

const {
    bool,
    number
} = PropTypes;

class BoardManager extends Component {

    static propTypes = {
        maxBoards : number,
        showHidden : bool
    };

    static defaultProps = {
        maxBoards   : Infinity,
        showHidden  : false
    };

    constructor( props, context ) {
        super( props, context );

        this.onResize = this.onResize.bind( this );
        this.onCreateBoard = this.onCreateBoard.bind( this );

        this.state = {
            height : 0,
            width  : 0,
            selectedIndex : 0
        };
    }

    onResize( nextSize ) {
        this.setState({
            ...nextSize
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

            this.setState({
                selectedIndex : currentBoardCount
            });
        }
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
            selectedIndex
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
                        <div
                            className={classNames('board-thumbnail', { selected : index === selectedIndex })}
                            onClick={clickHandler(index)}>
                            {index + 1}
                        </div>
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

                        const active = index === selectedIndex;
                        let style = {};

                        if ( active ) {
                            style = {
                                display: 'block',
                                position: 'absolute',
                                top : '0',
                                left : '0',
                                height : height + 'px',
                                width : width + 'px'
                            };
                        }
                        else {
                            style = {
                                display: 'none'
                            };
                        }

                        return React.cloneElement( child, {
                            boardManager : this,
                            showHidden,
                            active,
                            style,
                            height,
                            width,
                            columns : 12,
                            rows : 12
                        });
                    })}
                </div>
            </div>
        );
    }

}

export default BoardManager;