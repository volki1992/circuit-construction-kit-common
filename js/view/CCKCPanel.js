// Copyright 2016-2017, University of Colorado Boulder

/**
 * Parent class for the panels in CCK so they have similar look and feel.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var CCKCConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CCKCConstants' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Panel = require( 'SUN/Panel' );

  /**
   * @param {Node} content - what will appear in the panel
   * @param {Tandem} tandem
   * @param {Object} [options]
   * @constructor
   */
  function CCKCPanel( content, tandem, options ) {
    options = _.extend( {
      fill: CCKCConstants.PANEL_COLOR,
      lineWidth: CCKCConstants.PANEL_LINE_WIDTH,
      xMargin: 15,
      yMargin: 15,
      tandem: tandem,
      cornerRadius: CCKCConstants.CORNER_RADIUS
    }, options );
    Panel.call( this, content, options );
  }

  circuitConstructionKitCommon.register( 'CCKCPanel', CCKCPanel );

  return inherit( Panel, CCKCPanel, {} );
} );