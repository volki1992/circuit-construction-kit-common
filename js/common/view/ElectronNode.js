// Copyright 2016, University of Colorado Boulder
// TODO: Review, document, annotate, i18n, bring up to standards

/**
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var RadialGradient = require( 'SCENERY/util/RadialGradient' );
  var Circle = require( 'SCENERY/nodes/Circle' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Image = require( 'SCENERY/nodes/Image' );
  var Property = require( 'AXON/Property' );

  // constants
  var radius = 10;

  // Scale up before rasterization so it won't be too pixellated/fuzzy
  var scale = 2;

  // Copied from John Travoltage
  var minusChargeNode = new Node( {
    children: [
      new Circle( radius, {
        boundsMethod: 'none',
        fill: new RadialGradient( 2, -3, 2, 2, -3, 7 )
          .addColorStop( 0, '#4fcfff' )
          .addColorStop( 0.5, '#2cbef5' )
          .addColorStop( 1, '#00a9e8' )
      } ),

      new Rectangle( 0, 0, 11, 2, {
        fill: 'white',
        centerX: 0,
        centerY: 0
      } )
    ],
    scale: scale,
    boundsMethod: 'none'
  } );
  minusChargeNode.top = 0;
  minusChargeNode.left = 0;

  var node = new Node();
  minusChargeNode.toImage( function( im ) {

    //Scale back down so the image will be the desired size
    node.children = [ new Image( im, { scale: 1.0 / scale } ) ];
  }, 0, 0, minusChargeNode.width, minusChargeNode.height );

  function ElectronNode( electron, revealingProperty ) {
    var electronNode = this;
    Node.call( this, {
      children: [ node ],
      pickable: false
    } );
    var outsideOfBlackBoxProperty = new Property( false );

    var positionListener = function( position ) {
      electronNode.center = position;
      outsideOfBlackBoxProperty.value = !electron.circuitElement.insideTrueBlackBox;
    };
    electron.positionProperty.link( positionListener );

    var multilink = Property.multilink( [ electron.visibleProperty, outsideOfBlackBoxProperty, revealingProperty ], function( visible, outsideBox, revealing ) {
      electronNode.visible = visible && (outsideBox || revealing);
    } );

    var disposeListener = function() {
      electronNode.detach();
      electron.positionProperty.unlink( positionListener );
      multilink.dispose();
      electron.disposeEmitter.removeListener( disposeListener );
    };
    electron.disposeEmitter.addListener( disposeListener );
  }

  circuitConstructionKitCommon.register( 'ElectronNode', ElectronNode );

  return inherit( Node, ElectronNode );
} );