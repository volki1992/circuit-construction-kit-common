// Copyright 2017, University of Colorado Boulder

/**
 * The panel that appears in the bottom left which can be used to zoom in and out on the circuit.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var inherit = require( 'PHET_CORE/inherit' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var ZoomButton = require( 'SCENERY_PHET/buttons/ZoomButton' );

  /**
   * @param {Property} zoomLevelProperty
   * @constructor
   */
  function ZoomControlPanel( zoomLevelProperty ) {
    var zoomOutButton = new ZoomButton( {
      in: false,
      listener: function() {
        zoomLevelProperty.set( 0.5 );
      }
    } );
    var zoomInButton = new ZoomButton( {
      in: true,
      listener: function() {
        zoomLevelProperty.set( 1 );
      }
    } );
    HBox.call( this, {
      spacing: 12,
      children: [
        zoomOutButton,
        zoomInButton
      ]
    } );
    zoomLevelProperty.link( function( zoomLevel ) {
      zoomInButton.setEnabled( zoomLevel !== 1 );
      zoomOutButton.setEnabled( zoomLevel === 1 );
    } );
  }

  circuitConstructionKitCommon.register( 'ZoomControlPanel', ZoomControlPanel );

  return inherit( HBox, ZoomControlPanel );
} );