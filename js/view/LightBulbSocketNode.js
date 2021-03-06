// Copyright 2015-2017, University of Colorado Boulder

/**
 * Shows the socket (base) of the light bulb only, so that it will appear that the charges go "inside" the base.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var CustomLightBulbNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/CustomLightBulbNode' );
  var FixedCircuitElementNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/FixedCircuitElementNode' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Matrix3 = require( 'DOT/Matrix3' );
  var NumberProperty = require( 'AXON/NumberProperty' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );

  // constants
  var SCRATCH_MATRIX = new Matrix3();

  /**
   * @param {CCKCScreenView|null} screenView - main screen view, null for icon
   * @param {CircuitLayerNode|null} circuitLayerNode, null for icon
   * @param {LightBulb} lightBulb - the light bulb model
   * @param {Property.<CircuitElementViewType>} viewTypeProperty
   * @param {Tandem} tandem
   * @param {Object} [options]
   * @constructor
   */
  function LightBulbSocketNode( screenView, circuitLayerNode, lightBulb, viewTypeProperty, tandem, options ) {

    // Render the bulb socket only
    var lightBulbNode = new CustomLightBulbNode( new NumberProperty( 0 ), {
      baseOnly: true,
      highResistance: lightBulb.highResistance
    } );

    // Interferes with Cut Button selection when the foreground is in front, see
    // https://github.com/phetsims/circuit-construction-kit-black-box-study/issues/18
    options = _.extend( {
      pickable: false,

      // Suppress the highlight for the socket, the highlight is shown by the CCKCLightBulbNode
      showHighlight: false
    }, options );
    FixedCircuitElementNode.call( this, screenView, circuitLayerNode, lightBulb,
      viewTypeProperty, lightBulbNode, new Rectangle( 0, 0, 10, 10 ), tandem, options );
  }

  circuitConstructionKitCommon.register( 'LightBulbSocketNode', LightBulbSocketNode );

  return inherit( FixedCircuitElementNode, LightBulbSocketNode, {

    /**
     * Multiple updates may happen per frame, they are batched and updated once in the view step to improve performance.
     * @override
     * @protected - CCKCLightBulbNode calls updateRender for its child socket node
     */
    updateRender: function() {
      var startPosition = this.circuitElement.startPositionProperty.get();
      var endPosition = this.circuitElement.endPositionProperty.get();
      var angle = endPosition.minus( startPosition ).angle() + Math.PI / 4;

      // Update the node transform in a single step, see #66
      this.contentNode.setMatrix( SCRATCH_MATRIX.setToTranslationRotationPoint( startPosition, angle ) );
    },

    /**
     * Maintain the opacity of the brightness lines while changing the opacity of the light bulb itself.
     * @override
     * @public
     */
    updateOpacityOnInteractiveChange: function() {

      // TODO (black-box-study): Make the light bulb images look faded out.
    }
  } );
} );