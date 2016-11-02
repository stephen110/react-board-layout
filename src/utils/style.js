
export const setTopLeft = function( { top, left, width, height } ) {
    return {
        top : `${top}px`,
        left : `${left}px`,
        width : `${width}px`,
        height : `${height}px`,
        position : 'absolute'
    };
};

export const setTransform = function( { top, left, width, height } ) {
    const translate = `translate(${left}px, ${top}px`;

    return {
        transform : translate,
        WebkitTransform: translate,
        MozTransform: translate,
        msTransform: translate,
        OTransform: translate,
        width: `${width}px`,
        height: `${height}px`,
        position: 'absolute'
    };
};