import React, { Component, PropTypes } from 'react';
import Draggable from 'react-draggable';
import BoardManager from '../../components/BoardManager';
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
            text
        } = this.props;

        const style = {
            opacity: 1 //isDragging ? 0.5 : 1
        };

        const eventLogger = ( event, data ) => {
            console.log('Event: ', event);
            console.log('Data: ', data);
        };

        return (
            <Draggable
                handle=".handle"
                defaultPosition={{x: 0, y: 0}}
                position={null}
                grid={[25, 25]}
                zIndex={100}
                bounds="parent"
                onStart={eventLogger}
                onDrag={eventLogger}
                onStop={eventLogger}>
                <div className="card">
                    <div className="handle">{text}</div>
                </div>
            </Draggable>
        );
    }
}

const initialBoards = [
    {
        name : 'A',
        cards : [
            'Board A - Card A',
            'Board A - Card B'
        ]
    },
    {
        name : 'B',
        cards : [
            'Board B - Card A',
            'Board B - Card B'
        ]
    }
];

class App extends Component {
    
    constructor( props, context ) {
        super( props, context );
        this.onCreateBoard = this.onCreateBoard.bind( this );
        this.state = {
            boards : initialBoards
        };
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
                        <Board name={board.name}>
                            {board.cards.map( card => (
                                <Card text={card} />
                            ))}
                        </Board>
                    ))}
                </BoardManager>
            </div>
        );
    }
}

export default App;
