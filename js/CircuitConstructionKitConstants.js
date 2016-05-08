// Copyright 2015-2016, University of Colorado Boulder

/**
 * Constants used in all of the sims/screens/scenes.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var circuitConstructionKit = require( 'CIRCUIT_CONSTRUCTION_KIT/circuitConstructionKit' );

  /**
   *
   * @constructor
   */
  function CircuitConstructionKitConstants() {
  }

  circuitConstructionKit.register( 'CircuitConstructionKitConstants', CircuitConstructionKitConstants );

  return inherit( Object, CircuitConstructionKitConstants, {}, {
    vertexNodeAttributes: { stroke: 'black', lineWidth: 3, cursor: 'pointer' },
    toolboxIconLength: 60, // Width or height for icons in the control panel
    toolboxItemSpacing: 30,
    solderColor: '#ae9f9e',
    defaultResistance: 4.5,
    layoutInset: 14,
    tapThreshold: 10, // Number of pixels (screen coordinates) that constitutes a tap instead of a drag
    fontAwesomeIconScale: 0.85, // Uniform scaling for all font awesome node button icons
    highlightColor: 'yellow',
    highlightLineWidth: 5,

    defaultResistivity: 1E-4,
    minimumResistance: 1E-8,
    dragBoundsErosion: 10 // How far to erode the visible bounds for keeping the probes in bounds.
  } );
} );