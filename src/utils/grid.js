
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

export const getAllCollisions = function( layout, layoutItem ) {
    return layout.filter( l => collides( l, layoutItem ) );
};

/**
 *  Checks against collisions when moving the element
 */
export const moveElement = function( layout, layoutItem, x, y ) {
    if ( layoutItem.isStatic ) {
        return layout;
    }

    if ( layoutItem.x === x && layoutItem.y === y ) {
        return layout;
    }

    const nextLayoutItem = {
        id      : layoutItem.id,
        x       : typeof x === 'number' ? x : layoutItem.x,
        y       : typeof y === 'number' ? y : layoutItem.y,
        height  : layoutItem.height,
        width   : layoutItem.width
    };

    if ( getFirstCollision( layout, nextLayoutItem ) ) {
        return layout;
    }

    layoutItem.moved = true;
    layoutItem.x = nextLayoutItem.x;
    layoutItem.y = nextLayoutItem.y;

    return layout;
};

export const resizeElement = function( layout, layoutItem, width, height ) {
    if ( layoutItem.isStatic ) {
        return layout;
    }

    if ( layoutItem.height === height && layoutItem.width === width ) {
        return layout;
    }

    const nextLayoutItem = {
        id : layoutItem.id,
        x  : layoutItem.x,
        y  : layoutItem.y,
        height,
        width
    };

    if ( getFirstCollision( layout, nextLayoutItem ) ) {
        return layout;
    }

    layoutItem.width = width;
    layoutItem.height = height;

    return layout;
};

export const sortLayoutItemsByRowColumn = function( layout ) {
    return [].concat( layout ).sort( ( a, b ) => {
        if ( a.y > b.y || ( a.y === b.y && a.x > b.x ) ) {
            return 1;
        }

        if (a.y === b.y && a.x === b.x) {
            return 0; // Without this, we can get different sort results in IE vs. Chrome/FF
        }

        return -1;
    });
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