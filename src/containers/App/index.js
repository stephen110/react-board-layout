import React, { Component, PropTypes } from 'react';
import BoardManager from '../../components/BoardManager';
import Board from '../../components/Board';
import classNames from 'classnames';

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
            text
        } = this.props;

        return (
            <div className="card">
                <div className="title">{text}</div>
            </div>
        );
    }
}

const breakpoints = {
    large  : 1200,
    medium : 768
};

const initialBoards = [
    {
        name   : 'A',
        layout : [
            { id: 'a-a', x: 0, y: 0, height: 4, width: 2},
            { id: 'a-b', x: 2, y: 0, height: 4, width: 2}
        ]
    },
    {
        name   : 'B',
        layout : [
            { id: 'b-a', x: 0, y: 0, height: 2, width: 2},
            { id: 'b-b', x: 4, y: 0, height: 2, width: 2}
        ]
    }
];

class App extends Component {
    
    constructor( props, context ) {
        super( props, context );
        this.onCreateBoard  = this.onCreateBoard.bind( this );
        this.onLayoutChange = this.onLayoutChange.bind( this );
        this.state = {
            boards : initialBoards
        };
    }

    onLayoutChange( nextLayout, board ) {
        let {
            boards
        } = this.state;

        boards = [].concat( boards );

        const nextBoard = boards.find( b => board.props.name === b.name );

        if ( nextBoard ) {
            const index = boards.indexOf( nextBoard );

            boards[ index ] = {
                name   : nextBoard.name,
                layout : nextLayout
            };

            this.setState({
                boards
            });
        }
    }
    
    onCreateBoard() {
        const { 
            boards
        } = this.state;
        
        const nextBoards = [ 
            ...boards,
            {
                name : 'C',
                cards : [
                    'Board C - Card A'
                ]
            }
        ];
        
        this.setState({
            boards : nextBoards  
        });
    }
    
    render() {
        const {
            boards
        } = this.state;
        
        return (
            <div className="app">
                <BoardManager onCreateBoard={this.onCreateBoard} maxBoards={3}>
                    {boards.map( board => (
                        <Board
                            key={board.name}
                            name={board.name}
                            layout={board.layout}
                            isDraggable={true}
                            useCSSTransforms={true}
                            onLayoutChange={this.onLayoutChange}
                            draggableHandle=".title">
                            {board.layout.map( card => (
                                <div key={card.id}>
                                    <Card
                                        text={card.id}
                                    />
                                </div>
                            ))}
                        </Board>
                    ))}
                </BoardManager>
            </div>
        );
    }
}

export default App;
