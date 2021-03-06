// Copyright 2017, University of Colorado Boulder

/**
 * Static utilities for the Circuit Construction Kit: DC simulation.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var inherit = require( 'PHET_CORE/inherit' );
  var StringUtils = require( 'PHETCOMMON/util/StringUtils' );
  var Util = require( 'DOT/Util' );

  // strings
  var currentUnitsString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/currentUnits' );
  var voltageUnitsString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/voltageUnits' );

  /**
   * @constructor
   */
  function CCKCUtil() {
  }

  circuitConstructionKitCommon.register( 'CCKCUtil', CCKCUtil );

  return inherit( Object, CCKCUtil, {}, {

    /**
     * Typically show 2 decimal places for current and voltage readouts in the play area, but if it is a smaller value,
     * between between 0.02 and 0.001, then it should show 3 decimal places.
     * @param {number} value - the value to be formatted for display
     * @returns {number} - the number of decimal places to use for the display
     */
    getNumberOfDecimalPoints: function( value ) {
      return (value >= 0.001 && value < 0.02 ) ? 3 : 2;
    },

    /**
     * Returns a string that adjusts its ampere value.
     * @param current {number} - number of Amps
     * @returns {string}
     * @public
     */
    createCurrentReadout: function( current ) {
      var absoluteCurrent = Math.abs( current );
      var decimals = this.getNumberOfDecimalPoints( absoluteCurrent );

      // Show 3 decimal places so that current can still be seen with a glowing high-resistance bulb
      return StringUtils.fillIn( currentUnitsString, { current: Util.toFixed( absoluteCurrent, decimals ) } );
    },

    /**
     * Returns a string that adjusts its voltage value.
     * @param value {number} - voltage value in Volts
     * @returns {string}
     * @public
     */
    createVoltageReadout: function( value ) {
      var decimals = this.getNumberOfDecimalPoints( value );

      return StringUtils.fillIn( voltageUnitsString, { voltage: Util.toFixed( value, decimals ) } );
    },

    /**
     * Checks whether a child should be in the scene graph and adds/removes it as necessary.  This is to improve
     * performance so that the DOM only contains displayed items and doesn't try to update invisible ones.
     * @param inSceneGraph {boolean} - should the child be shown in the scene graph
     * @param parent {Node} - parent that contains the child in the scene graph
     * @param child {Node} - child added/removed from scene graph
     * @public
     */
    setInSceneGraph: function( inSceneGraph, parent, child ) {
      if ( inSceneGraph && !parent.hasChild( child ) ) {
        parent.addChild( child );
      }
      else if ( !inSceneGraph && parent.hasChild( child ) ) {
        parent.removeChild( child );
      }
    }
  } );
} );