import React, { Component } from 'react';
import PropTypes from 'prop-types';

const {
    func,
    string
} = PropTypes;

export default class Card extends Component {
    static propTypes = {
        text: string.isRequired
    };

    static contextTypes = {
        connectDragSource : func
    };

    render() {
        const {
            text,
            isDragging,
            height,
            width
        } = this.props;

        const {
            connectDragSource
        } = this.context;

        if ( isDragging ) {
            return null;
        }

        return (
            <div className="card">
                {connectDragSource(
                    <div className="title">{text}</div>
                )}
                <div className="card__body">
                    <span className="card__size">
                        {height} x {width}
                    </span>
                </div>
            </div>
        );
    }
}
