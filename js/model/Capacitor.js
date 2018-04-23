// Copyright 2015-2017, University of Colorado Boulder

/**
 * Model for a capacitor.
 *
 * @author Christian Volkert
 */
define( function( require ) {
  'use strict';

  // modules
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var CCKCConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CCKCConstants' );
  var FixedCircuitElement = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/FixedCircuitElement' );
  var inherit = require( 'PHET_CORE/inherit' );
  var NumberProperty = require( 'AXON/NumberProperty' );

  // constants
  var CAPACITOR_LENGTH = CCKCConstants.CAPACITOR_LENGTH;

  /**
   * @param {Vertex} startVertex
   * @param {Vertex} endVertex
   * @param {Tandem} tandem
   * @param {Object} [options]
   * @constructor
   */
  function Capacitor( startVertex, endVertex, internalFrequencyProperty, tandem, options ) {
    options = _.extend( {
      resistance: CCKCConstants.DEFAULT_RESISTANCE,
      capacitance: CCKCConstants.DEFAULT_CAPACITANCE,

      // Support for rendering household items or
      capacitorLength: CAPACITOR_LENGTH,
      isFlammable: true
    }, options );

    FixedCircuitElement.call( this, startVertex, endVertex, options.capacitorLength, tandem, options );

    // @public {Property.<number>} the resistance in ohms
    this.resistanceProperty = new NumberProperty( options.resistance );
    
    // @public {Property.<number>} the capacitance in farads
    this.capacitanceProperty = new NumberProperty( options.capacitance );
    
    // @public {Property.<number>} the internal frequency of the capacitor
    this.internalFrequencyProperty = internalFrequencyProperty;
    
    // to help distinct between a Frequency of Resistance change
    this.oldfreq = internalFrequencyProperty.value;
  }

  circuitConstructionKitCommon.register( 'Capacitor', Capacitor );

  return inherit( FixedCircuitElement, Capacitor, {

    /**
     * Returns true if the resistance is editable.  Household item resistance is not editable.
     * @returns {boolean}
     * @public
     */
    isResistanceEditable: function() {
      return true;
    },
    
    /**
     * Returns true if the capacitance is editable.
     * @returns {boolean}
     * @public
     */
    isCapacitanceEditable: function() {
      return true;
    },

    /**
     * Get the properties so that the circuit can be solved when changed.
     * @override
     * @returns {Property.<*>[]}
     * @public
     */
    getCircuitProperties: function() {
    	
    	//initial calculation of the resistance (Xc) with the default values
    	this.capacitanceProperty.value = 1 / (2 * 3.14 * this.internalFrequencyProperty.value * this.resistanceProperty.value); 
    	return [ this.resistanceProperty, this.capacitanceProperty ];
    },

    /**
     * Get all intrinsic properties of this object, which can be used to load it at a later time.
     * @returns {Object}
     * @public
     */
    toIntrinsicStateObject: function() {
      var parent = FixedCircuitElement.prototype.toIntrinsicStateObject.call( this );
      return _.extend( parent, {
    	capacitance: this.capacitanceProperty.value,
        resistance: this.resistanceProperty.value,
        capacitorLength: this.chargePathLength
      } );
    }
  } );
} );