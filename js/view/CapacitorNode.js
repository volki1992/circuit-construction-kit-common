// Copyright 2015-2017, University of Colorado Boulder

/**
 * Renders the lifelike/schematic view for a Battery.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
 // var BatteryType = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/BatteryType' );
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var CCKCConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CCKCConstants' );
  var Color = require( 'SCENERY/util/Color' );
  var FixedCircuitElementNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/FixedCircuitElementNode' );
  var Image = require( 'SCENERY/nodes/Image' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Matrix3 = require( 'DOT/Matrix3' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Shape = require( 'KITE/Shape' );

  // images
  var capacitorImage = require( 'image!CIRCUIT_CONSTRUCTION_KIT_COMMON/Capacitor.png' );


  // constants
  // dimensions for schematic capacitor
  var SMALL_TERMINAL_WIDTH = 104;
  var LARGE_TERMINAL_WIDTH = 104;
  var WIDTH = 188;
  var GAP = 33;
  var LEFT_JUNCTION = WIDTH / 2 - GAP / 2;
  var RIGHT_JUNCTION = WIDTH / 2 + GAP / 2;

  // Points sampled using Photoshop from a raster of the IEEE icon seen at
  // https://upload.wikimedia.org/wikipedia/commons/c/cb/Circuit_elements.svg
  var schematicShape = new Shape()
    .moveTo( 0, 0 ) // left wire
    .lineTo( LEFT_JUNCTION, 0 )
    .moveTo( LEFT_JUNCTION, SMALL_TERMINAL_WIDTH / 2 ) // left plate
    .lineTo( LEFT_JUNCTION, -SMALL_TERMINAL_WIDTH / 2 )
    .moveTo( RIGHT_JUNCTION, 0 ) // right wire
    .lineTo( WIDTH, 0 )
    .moveTo( RIGHT_JUNCTION, LARGE_TERMINAL_WIDTH / 2 ) // right plate
    .lineTo( RIGHT_JUNCTION, -LARGE_TERMINAL_WIDTH / 2 );
  var schematicWidth = schematicShape.bounds.width;
  var desiredWidth = CCKCConstants.CAPACITOR_LENGTH;
  var schematicScale = desiredWidth / schematicWidth;

  // Scale to fit the correct width
  schematicShape = schematicShape.transformed( Matrix3.scale( schematicScale, schematicScale ) );
  var schematicNode = new Path( schematicShape, {
    stroke: Color.BLACK,
    lineWidth: CCKCConstants.SCHEMATIC_LINE_WIDTH
  } ).toDataURLImageSynchronous();

  schematicNode.centerY = 0;

  // Expand the pointer areas with a defensive copy, see https://github.com/phetsims/circuit-construction-kit-common/issues/310
  schematicNode.mouseArea = schematicNode.bounds.shiftedY( schematicNode.height / 2 );
  schematicNode.touchArea = schematicNode.bounds.shiftedY( schematicNode.height / 2 );

  /**
   * @param {CCKCScreenView|null} screenView - main screen view, null for isIcon
   * @param {CircuitLayerNode|null} circuitLayerNode, null for icon
   * @param {Battery} battery
   * @param {Property.<CircuitElementViewType>} viewTypeProperty
   * @param {Tandem} tandem
   * @param {Object} [options]
   * @constructor
   */
  function CapacitorNode( screenView, circuitLayerNode, capacitor, viewTypeProperty, tandem, options ) {

    // @public (read-only) {Capacitor} - the Capacitor rendered by this Node
    this.capacitor = capacitor;

    var lifelikeNode = new Image( capacitorImage );

    lifelikeNode.mutate( {
      scale: capacitor.distanceBetweenVertices / lifelikeNode.width
    } );

    // Center vertically to match the FixedCircuitElementNode assumption that origin is center left
    lifelikeNode.centerY = 0;

    FixedCircuitElementNode.call( this,
      screenView,
      circuitLayerNode,
      capacitor,
      viewTypeProperty,
      lifelikeNode,
      schematicNode,
      tandem,
      options
    );
  }

  circuitConstructionKitCommon.register( 'CapacitorNode', CapacitorNode );

  return inherit( FixedCircuitElementNode, CapacitorNode, {

    /**
     * Returns true if the node hits the sensor at the given point.
     * @param {Vector2} point
     * @returns {boolean}
     * @overrides
     * @public
     */
    containsSensorPoint: function( point ) {

      // make sure bounds are correct if cut or joined in this animation frame
      this.step();

      // Check against the mouse region
      return !!this.hitTest( point, true, false );
    }
  }, {

    /**
     * Identifies the images used to render this node so they can be prepopulated in the WebGL sprite sheet.
     * @public {Array.<Image>}
     */
    webglSpriteNodes: [
      new Image( capacitorImage ),
    ]
  } );
} );