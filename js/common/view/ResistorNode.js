// Copyright 2015-2016, University of Colorado Boulder

/**
 *
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var circuitConstructionKit = require( 'CIRCUIT_CONSTRUCTION_KIT/circuitConstructionKit' );
  var FixedLengthCircuitElementNode = require( 'CIRCUIT_CONSTRUCTION_KIT/common/view/FixedLengthCircuitElementNode' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var ResistorColors = require( 'CIRCUIT_CONSTRUCTION_KIT/common/view/ResistorColors' );
  var Image = require( 'SCENERY/nodes/Image' );

  // images
  var resistorImage = require( 'mipmap!CIRCUIT_CONSTRUCTION_KIT/resistor.png' );

  /**
   *
   * @param {CircuitNode} [circuitNode] optional, null for icons
   * @param resistor
   * @param options
   * @constructor
   */
  function ResistorNode( circuitConstructionKitScreenView, circuitNode, resistor, options ) {
    this.resistor = resistor;
    var imageScale = 0.7;
    var resistorNode = new Image( resistorImage );

    var imageWidth = resistorNode.imageWidth / imageScale;
    var bandWidth = 10;
    var bandHeight = 34;
    var bandTopDY = -2; // Account for vertical asymmetry in the image
    var inset = 40;
    var availableBandSpace = imageWidth * 0.75 - 2 * inset;
    var remainingSpace = availableBandSpace - 4 * bandWidth;// max is 4 bands, even though they are not always shown
    var bandSeparation = remainingSpace / 4; // two spaces before last band
    var y = resistorNode.imageHeight / 2 / imageScale - bandHeight / imageScale / 2 + bandTopDY;
    var colorBands = [
      new Rectangle( 0, 0, bandWidth, bandHeight, { x: inset + (bandWidth + bandSeparation) * 0, y: y } ),
      new Rectangle( 0, 0, bandWidth, bandHeight, { x: inset + (bandWidth + bandSeparation) * 1, y: y } ),
      new Rectangle( 0, 0, bandWidth, bandHeight, { x: inset + (bandWidth + bandSeparation) * 2, y: y } ),
      new Rectangle( 0, 0, bandWidth, bandHeight + 3, {
        x: inset + (bandWidth + bandSeparation) * 3 + bandSeparation,
        y: y - 1.5
      } )
    ];
    var updateColorBands = function( resistance ) {
      var colors = ResistorColors.toThreeColors( resistance );
      for ( var i = 0; i < colorBands.length; i++ ) {
        colorBands[ i ].fill = colors[ i ];// Last one could be null
      }
    };
    resistor.resistanceProperty.link( updateColorBands );
    for ( var i = 0; i < colorBands.length; i++ ) {
      resistorNode.addChild( colorBands[ i ] );
    }

    FixedLengthCircuitElementNode.call( this, circuitConstructionKitScreenView, circuitNode, resistor, resistorNode, imageScale, options );
    this.disposeResistorNode = function() {
      resistor.resistanceProperty.unlink( updateColorBands );
    };
  }

  circuitConstructionKit.register( 'ResistorNode', ResistorNode );

  return inherit( FixedLengthCircuitElementNode, ResistorNode, {
    dispose: function() {
      FixedLengthCircuitElementNode.prototype.dispose.call( this );
      this.disposeResistorNode();
    }
  } );
} );