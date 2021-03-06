// Copyright 2017, University of Colorado Boulder

/**
 * Enumeration for how to render the current: electrons or conventional (arrows)
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );

  var CurrentType = {
    ELECTRONS: 'ELECTRONS',
    CONVENTIONAL: 'CONVENTIONAL'
  };

  circuitConstructionKitCommon.register( 'CurrentType', CurrentType );

  CurrentType.VALUES = [ CurrentType.ELECTRONS, CurrentType.CONVENTIONAL ];

  // verify that enum is immutable, without the runtime penalty in production code
  if ( assert ) { Object.freeze( CurrentType ); }

  return CurrentType;
} );
