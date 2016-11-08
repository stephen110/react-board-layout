
import React from 'react';
import classNames from 'classnames';

export default function( element, props ) {
    props.className = classNames( element.props.className, props.className );
    props.style     = {
        ...element.props.style,
        ...props.style
    };

    return React.cloneElement( element, props );
};