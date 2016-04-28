// Copyright 2015-2016, University of Colorado Boulder

/**
 * Node for a single scene.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var CircuitConstructionKitBasicsScreenView = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/common/view/CircuitConstructionKitBasicsScreenView' );
  var Property = require( 'AXON/Property' );
  var DisplayOptionsPanel = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/common/view/DisplayOptionsPanel' );
  var CircuitConstructionKitBasicsConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/CircuitConstructionKitBasicsConstants' );

  // constants
  var inset = CircuitConstructionKitBasicsConstants.layoutInset;

  /**
   * @param {CircuitConstructionKitBasicsModel} circuitConstructionKitBasicsScreenModel
   * @param {Object} [options]
   * @constructor
   */
  function IntroSceneNode( circuitConstructionKitBasicsScreenModel, options ) {
    var introSceneNode = this;
    options = _.extend( {
      numberOfRightBatteriesInToolbox: 1,
      numberOfWiresInToolbox: 4,
      numberOfLightBulbsInToolbox: 0,
      numberOfResistorsInToolbox: 0
    }, options );
    CircuitConstructionKitBasicsScreenView.call( this, circuitConstructionKitBasicsScreenModel, {
      toolboxOrientation: 'horizontal',
      numberOfRightBatteriesInToolbox: options.numberOfRightBatteriesInToolbox,
      numberOfWiresInToolbox: options.numberOfWiresInToolbox,
      numberOfLightBulbsInToolbox: options.numberOfLightBulbsInToolbox,
      numberOfResistorsInToolbox: options.numberOfResistorsInToolbox,
      getToolboxPosition: function( visibleBounds ) {
        return {
          centerX: visibleBounds.centerX,
          bottom: visibleBounds.bottom - inset
        };
      },
      getCircuitEditPanelLayoutPosition: function( visibleBounds ) {
        return {
          left: visibleBounds.left + inset,
          bottom: visibleBounds.bottom - inset
        };
      }
    } );
    var displayOptionsPanel = new DisplayOptionsPanel( new Property( false ), new Property( false ), new Property( false ) );
    this.addChild( displayOptionsPanel );
    displayOptionsPanel.moveToBack(); // Move behind elements added in the super, such as the sensors and circuit

    this.visibleBoundsProperty.link( function( visibleBounds ) {
      displayOptionsPanel.top = visibleBounds.top + inset;
      displayOptionsPanel.right = visibleBounds.right - inset;

      introSceneNode.sensorToolbox.top = displayOptionsPanel.bottom + 10;
      introSceneNode.sensorToolbox.right = displayOptionsPanel.right;

      introSceneNode.circuitElementToolbox.mutate( {
        centerX: visibleBounds.centerX,
        bottom: visibleBounds.bottom - inset
      } );

      introSceneNode.circuitElementEditContainerPanel.mutate( {
        left: visibleBounds.left + inset,
        bottom: visibleBounds.bottom - inset
      } );
    } );
  }

  return inherit( CircuitConstructionKitBasicsScreenView, IntroSceneNode );
} );