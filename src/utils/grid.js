
import _ from 'lodash';
import React from 'react';

/**
 * Comparing React `children` is a bit difficult. This is a good way to compare them.
 * This will catch differences in keys, order, and length.
 */
export function childrenEqual(a, b) {
    return _.isEqual(React.Children.map(a, c => c.key), React.Children.map(b, c => c.key));
}

export const getLayoutItem = function( layout, id ) {
    return layout.find( item => item.id === id );  
};

export const collides = function( layoutItem1, layoutItem2 ) {
    return !(
        layoutItem1.id === layoutItem2.id ||
        layoutItem1 === layoutItem2 ||
        layoutItem1.x + layoutItem1.width <= layoutItem2.x ||
        layoutItem1.x >= layoutItem2.x + layoutItem2.width ||
        layoutItem1.y + layoutItem1.height <= layoutItem2.y ||
        layoutItem1.y >= layoutItem2.y + layoutItem2.height
    );
};

export const getFirstCollision = function( layout, layoutItem ) {
    return layout.find( l => collides( l, layoutItem ) );
};

export const canMoveElement = function( id, nextLayoutItem, layout ) {
    const layoutItem = {
        ...nextLayoutItem,
        id
    };

    return !getFirstCollision( layout, layoutItem );
};

export const removeElement = function( layout, id ) {
    if ( !id || !layout ) {
        return layout;
    }

    return layout.filter( item => item.id !== id );
};

export const addOrUpdateElement = function( layout, layoutItem ) {
    layout = [].concat( layout );

    for ( var i = 0; i < layout.length; i++ ) {
        if ( layout[ i ].id === layoutItem.id ) {
            layout[ i ] = layoutItem;
            return layout;
        }
    }

    return [
        ...layout,
        layoutItem
    ];
};

export const setLayoutItemBounds = function( layoutItem, { x, y, height, width } ) {
    if ( typeof x !== 'number' ) x = layoutItem.x;
    if ( typeof y !== 'number' ) y = layoutItem.y;
    if ( typeof height !== 'number' ) height = layoutItem.height;
    if ( typeof width !== 'number' ) width = layoutItem.width;

    return {
        ...layoutItem,
        x,
        y,
        height,
        width
    };
};

/**
 * Performs equality by iterating through keys on an object and returning false
 * when any key has values which are not strictly equal between the arguments.
 * Returns true when the values of all keys are strictly equal.
 */
export const shallowEqual = function (objA, objB) {
    if (objA === objB) {
        return true;
    }

    if (typeof objA !== 'object' || objA === null ||
        typeof objB !== 'object' || objB === null) {
        return false;
    }

    var keysA = Object.keys(objA);
    var keysB = Object.keys(objB);

    if (keysA.length !== keysB.length) {
        return false;
    }

    // Test for A's keys different from B.
    var bHasOwnProperty = hasOwnProperty.bind(objB);

    for (var i = 0; i < keysA.length; i++) {
        if (!bHasOwnProperty(keysA[i]) || objA[keysA[i]] !== objB[keysA[i]]) {
            return false;
        }
    }

    return true;
};

export const calculateXY = function( top, left, height, width, columns, rows, containerHeight, containerWidth ) {
    const columnWidth = containerWidth / columns;
    const rowHeight = containerHeight / rows;

    let x = Math.round(
        left / columnWidth
    );

    let y = Math.round(
        top / rowHeight
    );

    x = Math.max( 0,
        Math.min( x, columns - width )
    );

    y = Math.max( 0,
        Math.min( y, rows - height )
    );

    return { x, y };
};

export const calculateWH = function( height, width, columns, rows, containerHeight, containerWidth, minConstraints, maxConstraints ) {
    const columnWidth = containerWidth / columns;
    const rowHeight = containerHeight / rows;

    const [
        minWidth = 0,
        minHeight = 0
    ] = minConstraints;

    const [
        maxWidth = Infinity,
        maxHeight = Infinity
    ] = maxConstraints;

    const calculatedWidth = Math.max(
        minWidth,
        Math.min(
            Math.round( width / columnWidth ),
            maxWidth
        )
    );

    const calculatedHeight = Math.max(
        minHeight,
        Math.min(
            Math.round( height / rowHeight ),
            maxHeight
        )
    );

    return {
        width  : calculatedWidth,
        height : calculatedHeight
    };
};