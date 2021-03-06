// Copyright 2017, University of Colorado Boulder

/**
 * Unit tests for dot. Please run once in phet brand and once in brand=phet-io to cover all functionality.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/ModifiedNodalAnalysisCircuitTests' );
  require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/ResistorColorsTests' );

  // Since our tests are loaded asynchronously, we must direct QUnit to begin the tests
  QUnit.start();
} );