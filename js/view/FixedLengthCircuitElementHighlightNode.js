// Copyright 2017, University of Colorado Boulder

/**
 * Node used by FixedLengthCircuitElementNode to show its yellow highlight rectangle.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var CircuitConstructionKitCommonConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CircuitConstructionKitCommonConstants' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );

  // constants
  var PADDING = 10; // in view coordinates
  var CORNER_RADIUS = 8; // in view coordinates

  /**
   * @param {FixedLengthCircuitElementNode} fixedLengthCircuitElementNode
   * @constructor
   */
  function FixedLengthCircuitElementHighlightNode( fixedLengthCircuitElementNode ) {

    Rectangle.call( this, 0, 0, 0, 0,
      CORNER_RADIUS,
      CORNER_RADIUS, {
        stroke: CircuitConstructionKitCommonConstants.HIGHLIGHT_COLOR,
        lineWidth: CircuitConstructionKitCommonConstants.HIGHLIGHT_LINE_WIDTH,
        pickable: false
      } );

    this.recomputeBounds( fixedLengthCircuitElementNode );
  }

  circuitConstructionKitCommon.register( 'FixedLengthCircuitElementHighlightNode', FixedLengthCircuitElementHighlightNode );

  return inherit( Rectangle, FixedLengthCircuitElementHighlightNode, {

    /**
     * Update the dimensions of the highlight, called on startup and when components change from lifelike/schematic.
     * @param {FixedLengthCircuitElementNode} fixedLengthCircuitElementNode
     * @public
     */
    recomputeBounds: function( fixedLengthCircuitElementNode ) {
      var localBounds = fixedLengthCircuitElementNode.contentNode.localBounds;
      this.setRect(
        localBounds.minX - PADDING,
        localBounds.minY - PADDING,
        localBounds.width + PADDING * 2,
        localBounds.height + PADDING * 2
      );
    }
  } );
} );