// Copyright 2015-2017, University of Colorado Boulder

/**
 * Renders the view for the SeriesAmmeter, which looks the same in lifelike mode or schematic mode.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var CCKCConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CCKCConstants' );
  var CCKCUtil = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CCKCUtil' );
  var CircuitElementViewType = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/CircuitElementViewType' );
  var Color = require( 'SCENERY/util/Color' );
  var FixedCircuitElementNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/FixedCircuitElementNode' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Panel = require( 'SUN/Panel' );
  var Property = require( 'AXON/Property' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Text = require( 'SCENERY/nodes/Text' );
  var VBox = require( 'SCENERY/nodes/VBox' );

  // strings
  var currentString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/current' );
  var questionMarkString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/questionMark' );

  // constants
  var PANEL_HEIGHT = 40;
  var PANEL_WIDTH = CCKCConstants.SERIES_AMMETER_LENGTH;
  var ORANGE = '#f39033';

  // Widest text to use for max width, hardcoded to use english, otherwise uses lengthened translation strings which
  // may already be too long, see https://github.com/phetsims/circuit-construction-kit-common/issues/419
  var WIDEST_LABEL = '99.99 A';

  var CORNER_RADIUS = 4;

  /**
   * Utility function for creating a panel for the sensor body
   * @param {Object} options
   * @returns {Rectangle}
   */
  var createPanel = function( options ) {

    // Rasterize so it can be rendered in WebGL, see https://github.com/phetsims/circuit-construction-kit-dc/issues/67
    return new Rectangle( 0, 0, PANEL_WIDTH, PANEL_HEIGHT, options ).toDataURLNodeSynchronous();
  };

  var orangeBackgroundPanel = createPanel( { cornerRadius: CORNER_RADIUS, fill: ORANGE } );
  var blackBorder = createPanel( {
    cornerRadius: CORNER_RADIUS,
    stroke: '#231f20',
    lineWidth: 2.4
  } );

  /**
   * @param {CCKCScreenView|null} screenView - main screen view, null for isIcon
   * @param {CircuitLayerNode|null} circuitLayerNode, null for icon
   * @param {SeriesAmmeter} seriesAmmeter
   * @param {Tandem} tandem
   * @param {Object} [options]
   * @constructor
   */
  function SeriesAmmeterNode( screenView, circuitLayerNode, seriesAmmeter, tandem, options ) {
    var self = this;
    options = options || {};

    // Charges go behind this panel to give the appearance they go through the ammeter
    var readoutText = new Text( WIDEST_LABEL, { fontSize: 15 } );
    readoutText.maxWidth = readoutText.width;
    var maxBounds = readoutText.bounds.copy();

    // Margins within the numeric readout text box
    var textPanelMarginX = 3;
    var textPanelMarginY = 1;

    /**
     * Update the text in the numeric readout text box.  Shows '?' if disconnected.
     */
    var updateText = function() {
      var readout = questionMarkString;

      // If it is not an icon and connected at both sides, show the current, otherwise show '?'
      if ( screenView ) {

        var circuit = screenView.model.circuit;
        var startConnection = circuit.getNeighboringVertices( seriesAmmeter.startVertexProperty.get() ).length > 1;
        var endConnection = circuit.getNeighboringVertices( seriesAmmeter.endVertexProperty.get() ).length > 1;

        if ( startConnection && endConnection ) {

          // The ammeter doesn't indicate direction
          readout = CCKCUtil.createCurrentReadout( seriesAmmeter.currentProperty.get() );
        }
      }

      readoutText.setText( readout );

      // Center the text in the panel
      readoutText.centerX = (maxBounds.width + textPanelMarginX * 2) / 2;
      readoutText.centerY = (maxBounds.height + textPanelMarginY * 2) / 2;
    };

    seriesAmmeter.currentProperty.link( updateText );
    seriesAmmeter.startVertexProperty.link( updateText );
    seriesAmmeter.endVertexProperty.link( updateText );
    circuitLayerNode && circuitLayerNode.circuit.circuitChangedEmitter.addListener( updateText );

    // The readout panel is in front of the series ammeter node, and makes it look like the charges flow through the
    // series ammeter
    var readoutPanel = new Panel( new VBox( {
      children: [
        new Text( currentString, { fontSize: 12, maxWidth: 54 } ),
        new Rectangle( 0, 0, maxBounds.width + textPanelMarginX * 2, maxBounds.height + textPanelMarginY * 2, {
          cornerRadius: 4,
          stroke: Color.BLACK,
          fill: Color.WHITE,
          lineWidth: 0.75,
          children: [
            readoutText
          ]
        } )
      ]
    } ), {
      pickable: false,
      fill: ORANGE,
      stroke: null,
      xMargin: 4,
      yMargin: 0,
      tandem: tandem.createTandem( 'readoutPanel' )
    } );

    // This node only has a lifelike representation because it is a sensor
    var lifelikeNode = new Node( {
      children: [

        // orange background panel
        orangeBackgroundPanel,

        // gray track
        new Rectangle( 0, 0, PANEL_WIDTH, 20, {
          fill: '#bcbdbf',
          centerY: PANEL_HEIGHT / 2
        } ),

        // black border
        blackBorder
      ]
    } );

    // Expand the pointer areas with a defensive copy, see https://github.com/phetsims/circuit-construction-kit-common/issues/310
    lifelikeNode.mouseArea = lifelikeNode.bounds.copy();
    lifelikeNode.touchArea = lifelikeNode.bounds.copy();

    // Center vertically to match the FixedCircuitElementNode assumption that origin is center left
    lifelikeNode.centerY = 0;

    // Center the readout within the main body of the sensor
    readoutPanel.center = lifelikeNode.center;

    // @private {Node} - the panel to be shown in front for z-ordering.  Wrap centered in a child node to make the layout
    // in updateRender trivial.
    this.frontPanelContainer = new Node( {
      children: [ readoutPanel ]
    } );

    if ( options.isIcon ) {
      lifelikeNode.addChild( this.frontPanelContainer.mutate( { centerY: lifelikeNode.height / 2 - 2 } ) );
    }
    else {
      circuitLayerNode.seriesAmmeterNodeReadoutPanelLayer.addChild( this.frontPanelContainer );
    }

    FixedCircuitElementNode.call( this,
      screenView,
      circuitLayerNode,
      seriesAmmeter,
      new Property( CircuitElementViewType.LIFELIKE ),
      lifelikeNode,
      new Node( { children: [ lifelikeNode ] } ),// reuse lifelike view for the schematic view
      tandem,
      options
    );

    // @private (read-only) {boolean} - whether to show as an isIcon
    this.isIcon = options.isIcon;

    // @private {function}
    this.disposeSeriesAmmeterNode = function() {
      seriesAmmeter.currentProperty.unlink( updateText );
      seriesAmmeter.startVertexProperty.unlink( updateText );
      seriesAmmeter.endVertexProperty.unlink( updateText );
      if ( !this.isIcon ) {
        circuitLayerNode.seriesAmmeterNodeReadoutPanelLayer.removeChild( self.frontPanelContainer );
      }
      lifelikeNode.dispose();
      self.frontPanelContainer.dispose();
      readoutPanel.dispose();
      circuitLayerNode && circuitLayerNode.circuit.circuitChangedEmitter.removeListener( updateText );
    };
  }

  circuitConstructionKitCommon.register( 'SeriesAmmeterNode', SeriesAmmeterNode );

  return inherit( FixedCircuitElementNode, SeriesAmmeterNode, {

    /**
     * @public - dispose resources when no longer used
     * @override
     */
    dispose: function() {
      this.disposeSeriesAmmeterNode();
      FixedCircuitElementNode.prototype.dispose.call( this );
    },

    /**
     * Multiple updates may happen per frame, they are batched and updated once in the view step to improve performance.
     * @protected - CCKCLightBulbNode calls updateRender for its child socket node
     * @override
     */
    updateRender: function() {
      FixedCircuitElementNode.prototype.updateRender.call( this );
      this.frontPanelContainer.setMatrix( this.contentNode.getMatrix() );
    }
  } );
} );
