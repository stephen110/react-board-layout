import React, { Component } from 'react';
import BoardSet from '../../components/BoardSet';
import BasicRenderer from './basicRenderer';
import CarouselRenderer from './carouselRenderer';
import ThumbnailRenderer from './thumbnailRenderer';
import './styles.css';

const initialBoardLayouts = [
    {
        id : 'Properties',
        cards : [
            { id: 'a-a', x: 0, y: 0, height: 4, width: 2},
            { id: 'a-b', x: 2, y: 0, height: 4, width: 2},
            { id: 'a-c', x: 6, y: 0, height: 4, width: 2, isHidden: true}
        ]
    },
    {
        id : 'B',
        cards : [
            { id: 'b-a', x: 0, y: 0, height: 4, width: 2},
            { id: 'b-b', x: 4, y: 0, height: 4, width: 2}
        ]
    },
    {
        id : 'C',
        cards : [
            { id: 'c-a', x: 4, y: 4, height: 4, width: 2},
            { id: 'c-b', x: 4, y: 0, height: 4, width: 2}
        ]
    }
];

const breakpoints = {
    'small' : 500,
    'medium' : 800,
    'big' : 1200
};

class App extends Component {

    constructor( ...args ) {
        super( ...args );
        this.state = {
            boardLayouts : initialBoardLayouts,
            selectedIndex : 0
        };
    }

    onCreateBoard = () => {

    };

    onBoardLayoutsChange = ( nextLayout ) => {
        this.setState({
            boardLayouts : nextLayout
        });
    };

    onSelectThumbnail = index => {
        if ( index !== this.state.selectedIndex ) {
            if ( this.transitionTimer ) {
                clearTimeout( this.transitionTimer );
            }

            this.setState({
                selectedIndex : index,
                transitioning : true
            });

            this.transitionTimer = setTimeout( () => {
                clearTimeout( this.transitionTimer );
                this.transitionTimer = null;

                this.setState({
                    transitioning : false
                });
            }, 400 );
        }
    };

    render() {
        const {
            boardLayouts,
            transitioning,
            selectedIndex
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
                        breakpoints={breakpoints}
                        columns={12}
                        rows={12}
                        className="basic-board-set">
                            <BasicRenderer />
                            {/*<CarouselRenderer*/}
                                {/*transitioning={transitioning}*/}
                                {/*selectedIndex={selectedIndex}*/}
                            {/*/>*/}
                            {/*<ThumbnailRenderer*/}
                                {/*selectBoard={this.onSelectThumbnail}*/}
                                {/*selectedIndex={selectedIndex}*/}
                            {/*/>*/}
                    </BoardSet>
                </div>
            </div>
        );
    }
}

export default App;
