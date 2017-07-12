// Copyright 2017, University of Colorado Boulder

/**
 * When enabled, shows the readout above circuit elements, such as "9.0 V" for a 9 volt battery.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Panel = require( 'SUN/Panel' );
  var Text = require( 'SCENERY/nodes/Text' );
  var Color = require( 'SCENERY/util/Color' );
  var Vector2 = require( 'DOT/Vector2' );
  var Battery = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Battery' );
  var Resistor = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Resistor' );
  var Switch = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Switch' );
  var LightBulb = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/LightBulb' );
  var Util = require( 'DOT/Util' );
  var VBox = require( 'SCENERY/nodes/VBox' );
  var StringUtils = require( 'PHETCOMMON/util/StringUtils' );

  // strings
  var voltageUnitsString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/voltageUnits' );
  var resistanceOhmsSymbolString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/resistanceOhmsSymbol' );

  /**
   * @param {CircuitElement} circuitElement
   * @param {Property.<boolean>} showValuesProperty
   * @param {Tandem} tandem
   * @constructor
   */
  function ValueNode( circuitElement, showValuesProperty, tandem ) {
    var self = this;

    // Big enough to see when zoomed out
    var TEXT_OPTIONS = { fontSize: 22 };

    var disposeActions = [];

    var contentNode = null;
    if ( circuitElement instanceof Battery ) {

      var voltageText = new Text( '', _.extend( { tandem: tandem.createTandem( 'voltageText' ) }, TEXT_OPTIONS ) );
      var voltageListener = function( voltage ) {

        voltageText.text = StringUtils.fillIn( voltageUnitsString, { voltage: Util.toFixed( voltage, 1 ) } );
        updatePosition && updatePosition();
      };
      circuitElement.voltageProperty.link( voltageListener );

      // Battery readouts shows voltage and internal resistance if it is nonzero
      contentNode = new VBox( {
        align: 'left',
        children: [ voltageText ]
      } );

      var resistanceNode = new Text( '', _.extend( {
        tandem: tandem.createTandem( 'resistanceText' )
      }, TEXT_OPTIONS ) );
      var internalResistanceListener = function( internalResistance, lastInternalResistance ) {
        resistanceNode.text = StringUtils.fillIn( resistanceOhmsSymbolString, {
          resistance: Util.toFixed( internalResistance, 1 )
        } );

        // If the children should change, update them here
        if ( lastInternalResistance === null || (internalResistance === 0 || lastInternalResistance === 0) ) {
          var desiredChildren = internalResistance > 0 ? [ voltageText, resistanceNode ] : [ voltageText ];

          // Only set children if changed
          if ( contentNode.getChildrenCount() !== desiredChildren.length ) {
            contentNode.children = desiredChildren;
          }
        }
        updatePosition && updatePosition();
      };
      circuitElement.internalResistanceProperty.link( internalResistanceListener );

      disposeActions.push( function() {
        circuitElement.voltageProperty.unlink( voltageListener );
        circuitElement.internalResistanceProperty.unlink( internalResistanceListener );
      } );
    }

    else if ( circuitElement instanceof Resistor || circuitElement instanceof LightBulb ) {
      contentNode = new Text( '', _.extend( { tandem: tandem.createTandem( 'resistanceText' ) }, TEXT_OPTIONS ) );
      var decimalPlaces = 1; // amount of decimal places to be rounded
      circuitElement instanceof Resistor && (circuitElement.resistorType !== ('resistor' || 'highResistanceResistor')) ?
      decimalPlaces = 0 : 1;
      var linkResistance = function( resistance ) {
        contentNode.text = StringUtils.fillIn( resistanceOhmsSymbolString, {
          resistance: Util.toFixed( resistance, decimalPlaces )
        } );
      };
      circuitElement.resistanceProperty.link( linkResistance );
      disposeActions.push( function() {
        circuitElement.resistanceProperty.unlink( linkResistance );
      } );
      contentNode.maxWidth = 113;
    }
    else if ( circuitElement instanceof Switch ) {
      contentNode = new Text( '', _.extend( { tandem: tandem.createTandem( 'switchText' ) }, TEXT_OPTIONS ) );

      var updateResistance = function( resistance ) {
        contentNode.text = StringUtils.fillIn( resistanceOhmsSymbolString, {
          resistance: resistance > 100000 ? '∞' : Util.toFixed( resistance, 1 )
        } );

        // Account for the switch open and close geometry for positioning the label.  When the switch is open
        // the label must be higher
        updatePosition && updatePosition();
      };
      circuitElement.resistanceProperty.link( updateResistance );
      disposeActions.push( function() {
        circuitElement.resistanceProperty.unlink( updateResistance );
      } );
    }
    else {
      contentNode = new Text( '', TEXT_OPTIONS );
    }

    assert && assert( contentNode, 'Content node should be defined' );

    Panel.call( this, contentNode, {
      lineWidth: 0,
      fill: new Color( 255, 255, 255, 0.6 ),// put transparency in the color so that the children aren't transparent
      tandem: tandem,
      cornerRadius: 3,
      xMargin: 3,
      yMargin: 1
    } );

    var updatePosition = function() {

      // Only update position when the value is displayed
      if ( showValuesProperty.get() ) {

        // For a light bulb, choose the part of the filament in the top center for the label, see
        // https://github.com/phetsims/circuit-construction-kit-common/issues/325
        var distance = circuitElement instanceof LightBulb ? 0.56 : 0.5;

        // The label partially overlaps the component to make it clear which label goes with which component
        var centerPositionAndAngle = circuitElement.getPositionAndAngle( circuitElement.chargePathLength * distance );
        var delta = Vector2.createPolar( 24, centerPositionAndAngle.angle + 3 * Math.PI / 2 );
        self.center = centerPositionAndAngle.position.plus( delta ); // above light bulb
      }
    };

    circuitElement.vertexMovedEmitter.addListener( updatePosition );
    updatePosition();
    showValuesProperty.link( updatePosition );

    // @private
    this.disposeValueNode = function() {
      circuitElement.vertexMovedEmitter.removeListener( updatePosition );
      showValuesProperty.unlink( updatePosition );
      disposeActions.forEach( function( disposeAction ) {
        disposeAction();
      } );
    };
  }

  circuitConstructionKitCommon.register( 'ValueNode', ValueNode );

  return inherit( Panel, ValueNode, {

    /**
     * @public - dispose when no longer used
     */
    dispose: function() {
      Panel.prototype.dispose.call( this );
      this.disposeValueNode();
    }
  } );
} );