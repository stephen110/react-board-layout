
export const getLayoutItem = function( layout, id ) {
    return layout.find( item => item.id === id );  
};

export const validateLayout = function( layout, contextName ) {
    if ( !Array.isArray( layout ) ) {
        throw new Error( `${contextName} must be an array` );
    }

    const types = {
        id : 'string',
        x  : 'number',
        y  : 'number',
        width : 'number',
        height : 'number'
    };

    for ( let i = 0; i < layout.length; i++ ) {
        const item = layout[ i ];


    }
};