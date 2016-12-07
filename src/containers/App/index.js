import React, { Component, PropTypes } from 'react';
import BoardSet from '../../components/BoardSet';
import Board from '../../components/Board';
import './styles.css';

const {
    string
} = PropTypes;

class Card extends Component {
    static propTypes = {
        text: string.isRequired
    };

    render() {
        const {
            text,
            connectDragSource,
            isDragging
        } = this.props;

        if ( isDragging ) {
            return null;
        }

        return (
            <div className="card">
                {connectDragSource(
                    <div className="title">{text}</div>
                )}
            </div>
        );
    }
}


const initialBoardOrder = [ 'Properties', 'B', 'C' ];

const initialBoardLayouts = {
    'Properties' : [
        { id: 'a-a', x: 0, y: 0, height: 4, width: 2},
        { id: 'a-b', x: 2, y: 0, height: 4, width: 2},
        { id: 'a-c', x: 6, y: 0, height: 4, width: 2, isHidden: true}
    ],
    'B' : [
        { id: 'b-a', x: 0, y: 0, height: 2, width: 2},
        { id: 'b-b', x: 4, y: 0, height: 2, width: 2}
    ],
    'C' : [
        { id: 'c-a', x: 4, y: 4, height: 2, width: 2},
        { id: 'c-b', x: 4, y: 0, height: 2, width: 2}
    ]
};

const breakpoints = {
    'small' : 500,
    'medium' : 800,
    'big' : 1200
};


class App extends Component {
    
    constructor( props, context ) {
        super( props, context );
        this.onCreateBoard  = this.onCreateBoard.bind( this );
        this.onLayoutChange = this.onLayoutChange.bind( this );
        this.onBoardLayoutsChange = this.onBoardLayoutsChange.bind( this );
        this.state = {
            boardOrder : initialBoardOrder,
            boardLayouts : initialBoardLayouts
        };
    }

    onLayoutChange( name, nextLayout ) {
        // let {
        //     boards
        // } = this.state;
        //
        // boards = [].concat( boards );
        //
        // const nextBoard = boards.find( b => name === b.name );
        //
        // if ( nextBoard ) {
        //     const index = boards.indexOf( nextBoard );
        //
        //     boards[ index ] = {
        //         name   : nextBoard.name,
        //         layout : nextLayout
        //     };
        //
        //     this.setState({
        //         boards
        //     });
        // }
    }
    
    onCreateBoard() {
        // const {
        //     boards
        // } = this.state;
        //
        // const nextBoards = [
        //     ...boards,
        //     {
        //         name : 'C',
        //         cards : [
        //             'Board C - Card A'
        //         ]
        //     }
        // ];
        //
        // this.setState({
        //     boards : nextBoards
        // });
    }

    onBoardLayoutsChange( nextLayout ) {
        this.setState({
            boardLayouts : nextLayout
        });
    }

    render() {
        const {
            boardOrder,
            boardLayouts
        } = this.state;
        
        return (
            <div className="wrapper">
                <div className="app">
                    <BoardSet
                        boardLayouts={boardLayouts}
                        onCreateBoard={this.onCreateBoard}
                        onBoardLayoutsChange={this.onBoardLayoutsChange}
                        maxBoards={3}
                        showHidden={true}
                        breakpoints={breakpoints}>
                        {boardOrder.map( key => {
                            const layout = boardLayouts[ key ] || [];

                            return (
                                <Board
                                    key={key}
                                    name={key}
                                    layout={layout}>
                                    {layout.map( card => (
                                        <Card
                                            key={card.id}
                                            text={card.id}
                                        />
                                    ))}
                                </Board>
                            );
                        })}
                    </BoardSet>
                </div>
            </div>
        );
    }
}

export default App;
