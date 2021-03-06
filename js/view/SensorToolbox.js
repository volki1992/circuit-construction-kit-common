// Copyright 2016-2017, University of Colorado Boulder

/**
 * This is the toolbox on the right hand side from which the voltmeter and ammeter can be dragged/dropped.  Exists for
 * the life of the sim and hence does not require a dispose implementation.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var Ammeter = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Ammeter' );
  var AmmeterNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/AmmeterNode' );
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var CCKCConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CCKCConstants' );
  var CCKCPanel = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/CCKCPanel' );
  var CircuitElementToolNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/CircuitElementToolNode' );
  var CircuitElementViewType = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/CircuitElementViewType' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Property = require( 'AXON/Property' );
  var SeriesAmmeter = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/SeriesAmmeter' );
  var SeriesAmmeterNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/SeriesAmmeterNode' );
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );
  var Text = require( 'SCENERY/nodes/Text' );
  var VBox = require( 'SCENERY/nodes/VBox' );
  var Vector2 = require( 'DOT/Vector2' );
  var Vertex = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Vertex' );
  var Voltmeter = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Voltmeter' );
  var VoltmeterNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/VoltmeterNode' );

  // strings
  var ammetersString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/ammeters' );
  var ammeterString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/ammeter' );
  var voltmeterString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/voltmeter' );

  // constants
  var TOOLBOX_ICON_SIZE = 53;
  var VOLTMETER_ICON_SCALE = 1.4;
  var ICON_TEXT_SPACING = 3; // distance in view coordinates from the isIcon to the text below the isIcon

  /**
   * @param {AlignGroup} alignGroup - for alignment with other controls
   * @param {Node} circuitLayerNode - the main circuit node to use as a coordinate frame
   * @param {VoltmeterNode} voltmeterNode - node for the Voltmeter
   * @param {AmmeterNode} ammeterNode - node for the Ammeter
   * @param {Tandem} tandem
   * @param {Object} [options]
   * @constructor
   */
  function SensorToolbox( alignGroup, circuitLayerNode, voltmeterNode, ammeterNode, tandem, options ) {

    options = _.extend( {
      showResultsProperty: circuitLayerNode.model.isValueDepictionEnabledProperty,
      showSeriesAmmeters: true, // whether the series ammeters should be shown in the toolbox
      showNoncontactAmmeters: true // whether the noncontact ammeters should be shown in the toolbox
    }, options );

    /**
     * @param {Ammeter|Voltmeter} meterModel
     * @param {AmmeterNode|VoltmeterNode} meterNode
     * @returns {Object} a listener
     */
    var createListener = function( meterModel, meterNode ) {

      return SimpleDragHandler.createForwardingListener( function( event ) {
        var viewPosition = circuitLayerNode.globalToLocalPoint( event.pointer.point );
        meterModel.draggingProbesWithBodyProperty.set( true );
        meterModel.visibleProperty.set( true );
        meterModel.bodyPositionProperty.set( viewPosition );
        meterNode.dragHandler.startDrag( event );
      }, {
        allowTouchSnag: true
      } );
    };

    // Draggable isIcon for the voltmeter
    var voltmeter = new Voltmeter( tandem.createTandem( 'voltmeterIconModel' ) );
    var voltmeterNodeIcon = new VoltmeterNode( voltmeter, null, null, tandem.createTandem( 'voltmeterNodeIcon' ), { isIcon: true } );
    voltmeterNode.voltmeter.visibleProperty.link( function( visible ) { voltmeterNodeIcon.visible = !visible; } );
    voltmeterNodeIcon.mutate( {
      scale: TOOLBOX_ICON_SIZE * VOLTMETER_ICON_SCALE / Math.max( voltmeterNodeIcon.width, voltmeterNodeIcon.height )
    } );
    voltmeterNodeIcon.addInputListener( createListener( voltmeterNode.voltmeter, voltmeterNode ) );

    // Icon for the ammeter
    var ammeter = new Ammeter( tandem.createTandem( 'ammeterIconModel' ) );
    var ammeterNodeIcon = new AmmeterNode( ammeter, null, tandem.createTandem( 'ammeterNodeIcon' ), { isIcon: true } );
    ammeterNode.ammeter.visibleProperty.link( function( visible ) { ammeterNodeIcon.visible = !visible; } );
    ammeterNodeIcon.mutate( { scale: TOOLBOX_ICON_SIZE / Math.max( ammeterNodeIcon.width, ammeterNodeIcon.height ) } );
    ammeterNodeIcon.addInputListener( createListener( ammeterNode.ammeter, ammeterNode ) );

    // Icon for the series ammeter
    var seriesAmmeter = new SeriesAmmeter(
      new Vertex( Vector2.ZERO ),
      new Vertex( new Vector2( CCKCConstants.SERIES_AMMETER_LENGTH, 0 ) ),
      tandem.createTandem( 'seriesAmmeterIconModel' )
    );
    var seriesAmmeterNodeIcon = new SeriesAmmeterNode( null, null, seriesAmmeter, tandem.createTandem( 'seriesAmmeterNodeIcon' ), {
      isIcon: true
    } );
    var createSeriesAmmeter = function( position ) {
      var halfLength = CCKCConstants.SERIES_AMMETER_LENGTH / 2;
      var startVertex = new Vertex( position.plusXY( -halfLength, 0 ) );
      var endVertex = new Vertex( position.plusXY( halfLength, 0 ) );
      return new SeriesAmmeter(
        startVertex,
        endVertex,
        circuitLayerNode.circuit.seriesAmmeterGroupTandem.createNextTandem()
      );
    };
    seriesAmmeterNodeIcon.mutate( { scale: TOOLBOX_ICON_SIZE / seriesAmmeterNodeIcon.width } );
    var seriesAmmeterToolNode = new CircuitElementToolNode(
      '',
      new Property( false ),
      new Property( CircuitElementViewType.SCHEMATIC ),
      circuitLayerNode.circuit,
      function( point ) {
        return circuitLayerNode.globalToLocalPoint( point );
      },
      seriesAmmeterNodeIcon,
      6,
      function() {
        return circuitLayerNode.circuit.circuitElements.count( function( circuitElement ) {

          return circuitElement instanceof SeriesAmmeter;
        } );
      }, createSeriesAmmeter, {
        touchAreaExpansionLeft: 3,
        touchAreaExpansionTop: 15,
        touchAreaExpansionRight: 3,
        touchAreaExpansionBottom: 0
      } );

    // Labels underneath the sensor tool nodes
    var voltmeterText = new Text( voltmeterString, { maxWidth: 60 } );
    var ammeterText = new Text( options.showSeriesAmmeters ? ammetersString : ammeterString, { maxWidth: 60 } );

    // Alter the visibility of the labels when the labels checkbox is toggled.
    circuitLayerNode.model.showLabelsProperty.linkAttribute( voltmeterText, 'visible' );
    circuitLayerNode.model.showLabelsProperty.linkAttribute( ammeterText, 'visible' );

    var voltmeterToolIcon = new VBox( {
      spacing: ICON_TEXT_SPACING,
      children: [
        voltmeterNodeIcon,
        voltmeterText
      ]
    } );

    var children = [];
    options.showNoncontactAmmeters && children.push( ammeterNodeIcon );
    options.showSeriesAmmeters && children.push( seriesAmmeterToolNode );

    var ammeterToolIcon = new VBox( {
      spacing: ICON_TEXT_SPACING,
      children: [
        new HBox( {
          spacing: 8,
          align: 'bottom',
          children: children
        } ),
        ammeterText
      ]
    } );

    CCKCPanel.call( this, alignGroup.createBox( new HBox( {
      spacing: ( options.showNoncontactAmmeters && options.showSeriesAmmeters ) ? 20 : 40,
      align: 'bottom',
      children: [ voltmeterToolIcon, ammeterToolIcon ]
    } ) ), tandem, {
      yMargin: 8
    } );
  }

  circuitConstructionKitCommon.register( 'SensorToolbox', SensorToolbox );

  return inherit( CCKCPanel, SensorToolbox );
} );