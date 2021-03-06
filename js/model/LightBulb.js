// Copyright 2015-2017, University of Colorado Boulder

/**
 * The LightBulb is a CircuitElement that shines when current flows through it.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var CircuitElementViewType = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/CircuitElementViewType' );
  var FixedCircuitElement = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/FixedCircuitElement' );
  var inherit = require( 'PHET_CORE/inherit' );
  var NumberProperty = require( 'AXON/NumberProperty' );
  var Util = require( 'DOT/Util' );
  var Vector2 = require( 'DOT/Vector2' );
  var Vertex = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Vertex' );

  // constants

  // The distance (as the crow flies) between start and end vertex
  var DISTANCE_BETWEEN_VERTICES = 36;

  // Tinker with coordinates to get thing to match up
  var LEFT_CURVE_X_SCALE = 1.5;
  var TOP_Y_SCALE = 0.6;
  var RIGHT_CURVE_X_SCALE = 0.87;

  // The sampled points for the wire/filament curves
  var LIFELIKE_SAMPLE_POINTS = [
    new Vector2( 0.623, 2.063 ),                                          // bottom center
    new Vector2( 0.623, 1.014 * 0.75 ),                                   // first curve
    new Vector2( 0.314 * LEFT_CURVE_X_SCALE, 0.704 * TOP_Y_SCALE * 1.1 ), // left curve 1
    new Vector2( 0.314 * LEFT_CURVE_X_SCALE, 0.639 * TOP_Y_SCALE ),       // left curve 2
    new Vector2( 0.394 * LEFT_CURVE_X_SCALE, 0.560 * TOP_Y_SCALE ),       // left curve 3
    new Vector2( 0.823 * RIGHT_CURVE_X_SCALE, 0.565 * TOP_Y_SCALE ),      // top right 1
    new Vector2( 0.888 * RIGHT_CURVE_X_SCALE, 0.600 * TOP_Y_SCALE ),      // top right 2
    new Vector2( 0.922 * RIGHT_CURVE_X_SCALE, 0.699 * TOP_Y_SCALE ),      // top right 3
    new Vector2( 0.927 * RIGHT_CURVE_X_SCALE, 1.474 ),                    // exit notch
    new Vector2( 0.927 * 0.8 * 1.2, 1.474 )                               // exit
  ];

  var SCHEMATIC_SAMPLE_POINTS = [
    new Vector2( 0.50, 2.06 ),                                            // bottom left
    new Vector2( 0.50, 0.34 ),                                            // top left
    new Vector2( 0.89, 0.34 ),                                            // top right
    new Vector2( 0.89, 1.474 )                                            // bottom right
  ];

  /**
   * @param {Vertex} startVertex - the side Vertex
   * @param {Vertex} endVertex - the bottom Vertex
   * @param {number} resistance - in ohms
   * @param {Property.<CircuitElementViewType>} viewTypeProperty
   * @param {Tandem} tandem
   * @param {Object} [options]
   * @constructor
   */
  function LightBulb( startVertex, endVertex, resistance, viewTypeProperty, tandem, options ) {
    options = _.extend( { highResistance: false }, options );

    // @public (read-only) {boolean} - true if the light bulb is a high resistance light bulb
    this.highResistance = options.highResistance;

    // @public {Property.<number>} - the resistance of the light bulb which can be edited with the UI
    this.resistanceProperty = new NumberProperty( resistance );

    // @private (read-only) {Vector2} the vector between the vertices
    this.vertexDelta = endVertex.positionProperty.get().minus( startVertex.positionProperty.get() );

    // @private
    this.viewTypeProperty = viewTypeProperty;

    FixedCircuitElement.call( this, startVertex, endVertex, this.getPathLength(), tandem, options );

    // @public (read-only) {number} - the number of decimal places to show in readouts and controls
    this.numberOfDecimalPlaces = this.highResistance ? 0 : 1;
  }

  circuitConstructionKitCommon.register( 'LightBulb', LightBulb );

  return inherit( FixedCircuitElement, LightBulb, {

    /**
     * Updates the charge path length when the view changes between lifelike/schematic
     * @public
     */
    updatePathLength: function() {
      this.chargePathLength = this.getPathLength();
    },

    /**
     * Determine the path length by measuring the segments.
     * @returns {number}
     * @private
     */
    getPathLength: function() {
      var pathLength = 0;
      var samplePoints = this.viewTypeProperty.value === CircuitElementViewType.LIFELIKE ? LIFELIKE_SAMPLE_POINTS : SCHEMATIC_SAMPLE_POINTS;
      var currentPoint = this.getFilamentPathPoint( 0, Vector2.ZERO, samplePoints );
      for ( var i = 1; i < samplePoints.length; i++ ) {
        var nextPoint = this.getFilamentPathPoint( i, Vector2.ZERO, samplePoints );
        pathLength += nextPoint.distance( currentPoint );
        currentPoint = nextPoint;
      }
      return pathLength;
    },

    /**
     * Returns true because all light bulbs can have their resistance changed.
     * @returns {boolean}
     * @public
     */
    isResistanceEditable: function() {
      return true;
    },

    /**
     * Maps from the "as the crow flies" path to the circuitous path. It maps points with a transformation such that:
     * startPoint => origin, endPoint => endVertex position
     *
     * @param {number} index
     * @param {Vector2} origin
     * @param {Vector2[]} samplePoints - the array of points to use for sampling
     * @returns {Vector2}
     * @private
     */
    getFilamentPathPoint: function( index, origin, samplePoints ) {
      var point = samplePoints[ index ];

      var startPoint = samplePoints[ 0 ];
      var endPoint = samplePoints[ samplePoints.length - 1 ];

      var x = Util.linear( startPoint.x, endPoint.x, origin.x, origin.x + this.vertexDelta.x, point.x );
      var y = Util.linear( startPoint.y, endPoint.y, origin.y, origin.y + this.vertexDelta.y, point.y );

      return new Vector2( x, y );
    },

    /**
     * Get the properties so that the circuit can be solved when changed.
     * @override
     * @returns {Property.<*>[]}
     * @public
     */
    getCircuitProperties: function() {
      return [ this.resistanceProperty ];
    },

    /**
     * Overrides CircuitElement.getPosition to describe the path the charge takes through the light bulb.
     *
     * @param {number} distanceAlongWire - how far along the bulb's length the charge has traveled
     * @param {Matrix3} matrix to be updated with the position and angle, so that garbage isn't created each time
     * @override
     * @public
     */
    updateMatrixForPoint: function( distanceAlongWire, matrix ) {

      FixedCircuitElement.prototype.updateMatrixForPoint.call( this, distanceAlongWire, matrix );

      var previousAccumulatedDistance = 0;
      var accumulatedDistance = 0;
      var samplePoints = this.viewTypeProperty.value === CircuitElementViewType.LIFELIKE ? LIFELIKE_SAMPLE_POINTS : SCHEMATIC_SAMPLE_POINTS;
      var currentPoint = this.getFilamentPathPoint( 0, this.startVertexProperty.get().positionProperty.get(), samplePoints );
      for ( var i = 1; i < samplePoints.length; i++ ) {
        var nextPoint = this.getFilamentPathPoint( i, this.startVertexProperty.get().positionProperty.get(), samplePoints );
        accumulatedDistance += nextPoint.distance( currentPoint );

        // Find what segment the charge is in
        if ( distanceAlongWire <= accumulatedDistance ) {

          // Choose the right point along the segment
          var fractionAlongSegment = Util.linear( previousAccumulatedDistance, accumulatedDistance, 0, 1, distanceAlongWire );
          var positionAlongSegment = currentPoint.blend( nextPoint, fractionAlongSegment );

          // rotate the point about the start vertex
          var startPoint = this.startPositionProperty.get();
          var vertexDelta = this.endPositionProperty.get().minus( startPoint );
          var relativeAngle = vertexDelta.angle() - this.vertexDelta.angle();
          var position = positionAlongSegment.rotatedAboutPoint( startPoint, relativeAngle );
          var angle = nextPoint.minus( currentPoint ).angle();

          // sampled from createAtPosition
          matrix.setToTranslationRotationPoint( position, angle + matrix.getRotation() + 0.7851354708011367 );
          return;
        }
        previousAccumulatedDistance = accumulatedDistance;
        currentPoint = nextPoint;
      }

      throw new Error( 'exceeded charge path bounds' );
    },

    /**
     * Get all intrinsic properties of this object, which can be used to load it at a later time.
     * @returns {Object}
     * @public
     */
    toIntrinsicStateObject: function() {
      var parent = FixedCircuitElement.prototype.toIntrinsicStateObject.call( this );
      return _.extend( parent, {
        highResistance: this.highResistance,
        resistance: this.resistanceProperty.value
      } );
    }
  }, {

    /**
     * Create a LightBulb at the specified position
     * @param {Vector2} position
     * @param {Tandem} circuitVertexGroupTandem
     * @param {number} resistance
     * @param {Property.<CircuitElementViewType>} viewTypeProperty
     * @param {Tandem} tandem
     * @param {Object} [options]
     * @returns {LightBulb}
     * @public
     */
    createAtPosition: function( position, circuitVertexGroupTandem, resistance, viewTypeProperty, tandem, options ) {

      options = options || {};
      var translation = new Vector2( 19, 10 );

      // Connect at the side and bottom
      var startPoint = new Vector2( position.x - DISTANCE_BETWEEN_VERTICES / 2, position.y ).plus( translation );

      // Position the vertices so the light bulb is upright
      var endPoint = startPoint.plus( Vector2.createPolar( DISTANCE_BETWEEN_VERTICES, -Math.PI / 4 ) );

      // start vertex is at the bottom
      var startVertex = new Vertex( startPoint, {
        tandem: circuitVertexGroupTandem.createNextTandem()
      } );
      var endVertex = new Vertex( endPoint, {
        tandem: circuitVertexGroupTandem.createNextTandem()
      } );

      return new LightBulb( startVertex, endVertex, resistance, viewTypeProperty, tandem, options );
    }
  } );
} );