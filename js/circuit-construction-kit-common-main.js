// Copyright 2015-2016, University of Colorado Boulder

/**
 * Main entry point for the sim.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var IntroScreen = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/intro/IntroScreen' );
  var EnergyScreen = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/energy/EnergyScreen' );
  var LabScreen = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/lab/LabScreen' );
  var Sim = require( 'JOIST/Sim' );
  var SimLauncher = require( 'JOIST/SimLauncher' );
  var Tandem = require( 'TANDEM/Tandem' );

  // If running as phet-io, load the API
  require( 'ifphetio!PHET_IO/simulations/circuit-construction-kit-black-box-study/circuit-construction-kit-api' );

  // constants
  var tandem = Tandem.createRootTandem();

  // strings
  var circuitConstructionKitTitleString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/circuit-construction-kit.title' );

  var simOptions = {
    credits: {
      leadDesign: 'Amy Rouinfar',
      softwareDevelopment: 'Sam Reid',
      team: 'Michael Dubson, Ariel Paul, Kathy Perkins',
      qualityAssurance: 'Steele Dalton, Bryce Griebenow, Elise Morgan, Ben Roberts',
      graphicArts: 'Bryce Gruneich'
    }
  };

  // Circuit Construction Kit has unit tests for checking the mathematics for the Modified Nodal Analysis
  // algorithm.  In order to load the classes into an accessible namespace, the *-config.js and *-main.js are loaded
  // however, when running the unit tests we don't also want to launch the simulation.
  if ( !window.circuitConstructionKitTestSuite ) {
    SimLauncher.launch( function() {
      var sim = new Sim( circuitConstructionKitTitleString, [
        new IntroScreen( tandem.createTandem( 'introScreen' ) ),
        new EnergyScreen( tandem.createTandem( 'energyScreen' ) ),
        new LabScreen( tandem.createTandem( 'labScreen' ) )
      ], simOptions );
      sim.start();
    } );
  }
} );