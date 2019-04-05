console.log( "=== simpread stylesheet load ===" )

/**
 * Clone from puread/plugin/stylesheet.js except iconPath
 */

import {browser} from 'browser';

const [ bgcolorstyl, bgcls ] = [ "background-color", ".simpread-focus-root" ];
let origin_read_style = "", html_style_bal = "-1";

/**
 * Get chrome extension icon path
 * @param {string} icon name
 */
function iconPath( name ) {
    return browser.extension.getURL( `assets/images/${name}.png` )
}

/**
 * Get background color value for focus mode
 * 
 * @param  {string} background-color, e.g. rgba(235, 235, 235, 0.901961)
 * @return {string} e.g. 235, 235, 235
 */
function getColor( value ) {
    const arr = value ? value.match( /[0-9]+, /ig ) : [];
    if ( arr.length > 0 ) {
        return arr.join( "" ).replace( /, $/, "" );
    } else {
        return null;
    }
};

/**
 * Set focus mode background color for focus mode
 * 
 * @param  {string} background color
 * @param  {number} background opacity
 * @return {string} new background color
 */
function backgroundColor( bgcolor, opacity ) {
    const color   = getColor( bgcolor ),
          newval  = `rgba(${color}, ${opacity / 100})`;
    $( bgcls ).css( bgcolorstyl, newval );
    return newval;
}

/**
 * Set background opacity for focus mode
 * 
 * @param  {string} opacity
 * @return {string} new background color or null
 */
function opacity( opacity ) {
    const bgcolor = $( bgcls ).css( bgcolorstyl ),
          color   = getColor( bgcolor ),
          newval  = `rgba(${color}, ${opacity / 100})`;
    if ( color ) {
        $( bgcls ).css( bgcolorstyl, newval );
        return newval;
    } else {
        return null;
    }
}

/**
 * Set read mode font family for read mode
 * 
 * @param {string} font family name e.g. PingFang SC; Microsoft Yahei
 */
function fontFamily( family ) {
    $( "sr-read" ).css( "font-family", family == "default" ? "" : family );
}

/**
 * Set read mode font size for read mode
 * 
 * @param {string} font size, e.g. 70% 62.5%
 */
function fontSize( value ) {
    if ( html_style_bal == "-1" ) {
        html_style_bal = $( "html" ).attr( "style" );
        html_style_bal == undefined && ( html_style_bal = "" );
    }
    value ? $( "html" ).attr( "style", `font-size: ${value}!important;${html_style_bal}` ) : $( "html" ).attr( "style", html_style_bal );
}

/**
 * Set read mode layout width for read mode
 * 
 * @param {string} layout width
 */
function layout( width ) {
    $( "sr-read" ).css( "margin", width ? `20px ${width}` : "" );
}

/**
 * Add custom css to <head> for read mode
 * 
 * @param {string} read.custom[type]
 * @param {object} read.custom
 */
function custom( type, props ) {
    const format = ( name ) => {
        return name.replace( /[A-Z]/, name => { return `-${name.toLowerCase()}` } );
    },
    arr = Object.keys( props ).map( v => {
        return props[v] && `${format( v )}: ${ props[v] };`
    });
    let styles = arr.join( "" );
    switch ( type ) {
        case "title":
            styles = `sr-rd-title {${styles}}`;
            break;
        case "desc":
            styles = `sr-rd-desc {${styles}}`;
            break;
        case "art":
            styles = `sr-rd-content *, sr-rd-content p, sr-rd-content div {${styles}}`;
            break;
        case "pre":
            styles = `sr-rd-content pre {${styles}}`;
            break;
        case "code":
            styles = `sr-rd-content pre code, sr-rd-content pre code * {${styles}}`;
            break;
    }

    const $target = $( "head" ).find( `style#simpread-custom-${type}` );
    if ( $target.length == 0 ) {
        $( "head" ).append(`<style type="text/css" id="simpread-custom-${type}">${styles}</style>`);
    } else {
        $target.html( styles );
    }

}

/**
 * Add css to <head> for read mode
 * 
 * @param {string} read.custom.css
 * @param {object} read.custom.css value
 */
function css( type, styles ) {
    const $target = $( "head" ).find( `style#simpread-custom-${type}` );
    if ( $target.length == 0 ) {
        $( "head" ).append(`<style type="text/css" id="simpread-custom-${type}">${styles}</style>`);
    } else {
        $target.html( styles );
    }
}

/**
 * Add/Remove current site styles( string ) to head for read mdoe
 * 
 * @param {string} styles 
 */
function siteCSS( styles ) {
    styles ? $( "head" ).append(`<style type="text/css" id="simpread-site-css">${styles}</style>`) :
             $( "#simpread-site-css" ).remove();
}

/**
 * Add custom to .preview tag
 * 
 * @param {object} read.custom
 * @param {string} theme backgroud color
 */
function preview( styles ) {
    Object.keys( styles ).forEach( v => {
        v != "css" && custom( v, styles[v] );
    });
    css( "css", styles["css"] );
}

/**
 * Add markdown css to <head> for read mode
 * 
 */
function mdStyle() {
    const styles = 'sr-rd-content{line-height:initial!important}sr-rd-content h1,sr-rd-content h2,sr-rd-content h3,sr-rd-content h4,sr-rd-content h5{margin:0!important;padding:0!important}sr-rd-content p{margin:0!important}sr-rd-content ol,sr-rd-content ul{margin-bottom:0!important;line-height:0!important}sr-rd-content sr-blockquote{padding-top:0!important;padding-bottom:0!important;line-height:.5}sr-rd-content sr-blockquote *{line-height:1.8!important}sr-rd-content ol li,sr-rd-content ol li *,sr-rd-content ul li,sr-rd-content ul li *{line-height:initial!important}';
    $( "head" ).find( "#simpread-custom-markdown" ).length == 0 &&
        $( "head" ).append(`<style type="text/css" id="simpread-custom-markdown">${styles}</style>`);
}

/**
 * Verify custom is exist
 * 
 * @param {string} verify type
 * @param {object} read.custom value
 */
function vfyCustom( type, styles ) {
    switch( type ) {
        case "layout":
        case "margin":
        case "fontfamily":
        case "custom":
            return styles.css != "";
        case "fontsize":
            return styles.title.fontSize != "" ||
                   styles.desc.fontSize != ""  ||
                   styles.art.fontSize != ""   ||
                   styles.css != "";
        case "theme":
            return styles.css.search( "simpread-theme-root" ) != -1;
    }
}

export {
    iconPath as IconPath,
    getColor as GetColor,
    backgroundColor as BgColor,
    opacity    as Opacity,
    fontFamily as FontFamily,
    fontSize   as FontSize,
    layout     as Layout,
    siteCSS    as SiteCSS,
    preview    as Preview,
    custom     as Custom,
    css        as CSS,
    vfyCustom  as VerifyCustom,
    mdStyle    as MDStyle,
}