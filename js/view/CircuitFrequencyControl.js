// Copyright 2017, University of Colorado Boulder

/**
 * Controls for showing and changing the power supply frequency.  Exists for the life of the sim and hence does not
 * require a dispose implementation.
 *
 * @author Jonas Malassa
 */
define( function( require ) {
  'use strict';

  // modules
  var CCKCAccordionBox = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/CCKCAccordionBox' );
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var CCKCConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CCKCConstants' );
  var Color = require( 'SCENERY/util/Color' );
  var HSlider = require( 'SUN/HSlider' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var StringUtils = require( 'PHETCOMMON/util/StringUtils' );
  var Text = require( 'SCENERY/nodes/Text' );
  var Util = require( 'DOT/Util' );
  var VBox = require( 'SCENERY/nodes/VBox' );

  // strings
  var circuitFrequencyString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitFrequency' );
  var frequencyHertzString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/frequencyHertz' );

  /**
   * @param {Property.<number>} circuitFrequencyProperty - axon Property for the frequency of all power sources
   * @param {AlignGroup} alignGroup
   * @param {Tandem} tandem
   * @constructor
   */
  function CircuitFrequencyControl( circuitFrequencyProperty, alignGroup, tandem ) {

    /**
     * Creates label to be used for slider
     * @param {string} string
     * @param {Tandem} tandem
     * @returns {Text}
     */
    var createLabel = function( string, tandem ) {
      return new Text( string, { fontSize: 12, tandem: tandem } );
    };

    var range = CCKCConstants.CIRCUIT_FREQUENCY_RANGE;
    var midpoint = (range.max + range.min) / 2;
    var slider = new HSlider( circuitFrequencyProperty, range, {
      trackSize: CCKCConstants.SLIDER_TRACK_SIZE,
      thumbSize: CCKCConstants.THUMB_SIZE,
      majorTickLength: CCKCConstants.MAJOR_TICK_LENGTH,

      // Snap to the nearest whole number.
      constrainValue: function( value ) { return Util.roundSymmetric( value ); },
      tandem: tandem.createTandem( 'slider' )
    } );
    slider.addMajorTick( range.min, createLabel( Util.toFixed( range.min, 0 ), tandem.createTandem( 'minLabel' ) ) );
    slider.addMajorTick( midpoint );
    slider.addMajorTick( range.max, createLabel( Util.toFixed( range.max, 0 ), tandem.createTandem( 'maxLabel' ) ) );

    for ( var i = range.min + 1; i < range.max; i++ ) {
      if ( i !== midpoint ) {
        slider.addMinorTick( i );
      }
    }

    var readoutTextPanelTandem = tandem.createTandem( 'readoutTextPanel' );

    var readoutText = new Text( circuitFrequencyProperty.get(), {
      font: new PhetFont( CCKCConstants.FONT_SIZE ),
      fill: Color.BLACK,
      maxWidth: 100,
      tandem: readoutTextPanelTandem.createTandem( 'readoutTextNode' ),
      pickable: false
    } );

    var xMargin = 4;

    // number to be displayed
    var updateText = function( value ) {
      readoutText.setText( StringUtils.fillIn( frequencyHertzString, { frequency: Util.toFixed( value, 1 ) } ) );

      // Once there is a textRectangle, stay right-justified
      if ( textRectangle ) {
        readoutText.right = textRectangle.right - xMargin;
      }
    };

    // Use the max to get the right size of the panel
    updateText( CCKCConstants.CIRCUIT_FREQUENCY_RANGE.max );

    var textRectangle = Rectangle.bounds( readoutText.bounds.dilatedXY( xMargin, 3 ), {
      fill: Color.WHITE,
      stroke: Color.GRAY,
      cornerRadius: 0, // radius of the rounded corners on the background
      pickable: false,
      tandem: readoutTextPanelTandem
    } );

    var textContainerNode = new Node( {
      children: [ textRectangle, readoutText ],
      pickable: false
    } );

    circuitFrequencyProperty.link( updateText );

    CCKCAccordionBox.call( this, alignGroup.createBox( new VBox( {
      spacing: -4,
      children: [ textContainerNode, slider ]
    } ) ), circuitFrequencyString, tandem );
  }

  circuitConstructionKitCommon.register( 'CircuitFrequencyControl', CircuitFrequencyControl );

  return inherit( CCKCAccordionBox, CircuitFrequencyControl );
} );
