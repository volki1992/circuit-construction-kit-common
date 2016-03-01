// Copyright 2016, University of Colorado Boulder

/**
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var circuitConstructionKitBasics = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/circuitConstructionKitBasics' );
  var CircuitConstructionKitBasicsPanel = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/common/view/CircuitConstructionKitBasicsPanel' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var VoltmeterNode = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/common/view/VoltmeterNode' );
  var AmmeterNode = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/common/view/AmmeterNode' );
  var CircuitConstructionKitBasicsConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/CircuitConstructionKitBasicsConstants' );
  var Voltmeter = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/common/model/Voltmeter' );
  var Ammeter = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/common/model/Ammeter' );

  // TODO: highlight the panel when a tool is going to be dropped in
  function SensorToolbox( voltmeterNode, ammeterNode ) {
    var sensorToolbox = this;
    var toolIconLength = CircuitConstructionKitBasicsConstants.toolboxIconLength;

    var voltmeterNodeIcon = new VoltmeterNode( new Voltmeter(), { icon: true } );
    voltmeterNode.voltmeter.visibleProperty.link( function( visible ) {
      voltmeterNodeIcon.visible = !visible;
    } );
    var voltmeterIconSizeIncrease = 1.3;
    voltmeterNodeIcon.mutate( { scale: toolIconLength * voltmeterIconSizeIncrease / Math.max( voltmeterNodeIcon.width, voltmeterNodeIcon.height ) } );
    voltmeterNodeIcon.addInputListener( {
      down: function( event ) {
        var viewPosition = sensorToolbox.globalToParentPoint( event.pointer.point );
        voltmeterNode.voltmeter.draggingTogether = true;
        voltmeterNode.voltmeter.visible = true;
        voltmeterNode.voltmeter.bodyPosition = viewPosition;
        voltmeterNode.movableDragHandler.startDrag( event );
      }
    } );

    var ammeterNodeIcon = new AmmeterNode( new Ammeter(), { icon: true } );
    ammeterNode.ammeter.visibleProperty.link( function( visible ) {
      ammeterNodeIcon.visible = !visible;
    } );
    ammeterNodeIcon.mutate( { scale: toolIconLength / Math.max( ammeterNodeIcon.width, ammeterNodeIcon.height ) } );
    ammeterNodeIcon.addInputListener( {
      down: function( event ) {
        var viewPosition = sensorToolbox.globalToParentPoint( event.pointer.point );
        ammeterNode.ammeter.draggingTogether = true;
        ammeterNode.ammeter.visible = true;
        ammeterNode.ammeter.bodyPosition = viewPosition;
        ammeterNode.movableDragHandler.startDrag( event );
      }
    } );

    CircuitConstructionKitBasicsPanel.call( this, new HBox( {
      spacing: CircuitConstructionKitBasicsConstants.toolboxItemSpacing,
      align: 'bottom',
      children: [
        voltmeterNodeIcon,
        ammeterNodeIcon
      ]
    } ) );
  }

  circuitConstructionKitBasics.register( 'SensorToolbox', SensorToolbox );
  return inherit( CircuitConstructionKitBasicsPanel, SensorToolbox, {} );
} );