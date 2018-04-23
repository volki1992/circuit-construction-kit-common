// Copyright 2015-2017, University of Colorado Boulder

/**
 * Model for a coil.
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
  var COIL_LENGTH = CCKCConstants.COIL_LENGTH;

  /**
   * @param {Vertex} startVertex
   * @param {Vertex} endVertex
   * @param {Tandem} tandem
   * @param {Object} [options]
   * @constructor
   */
  function Coil( startVertex, endVertex, internalFrequencyProperty, tandem, options ) {
    options = _.extend( {
      resistance: CCKCConstants.DEFAULT_RESISTANCE,
      inductance: CCKCConstants.DEFAULT_INDUCTANCE,

      // Support for rendering household items or
      coilLength: COIL_LENGTH,
      isFlammable: true
    }, options );

    FixedCircuitElement.call( this, startVertex, endVertex, options.coilLength, tandem, options );

    // @public {Property.<number>} the resistance in ohms
    this.resistanceProperty = new NumberProperty( options.resistance );
    
    // @public {Property.<number>} the capacitance in farads
    this.inductanceProperty = new NumberProperty( options.inductance );
    
    // @public {Property.<number>} the internal frequency of the capacitor
    this.internalFrequencyProperty = internalFrequencyProperty;
    
    // to help distinct between a Frequency of Resistance change
    this.oldfreq = internalFrequencyProperty.value;
  }

  circuitConstructionKitCommon.register( 'Coil', Coil );

  return inherit( FixedCircuitElement, Coil, {

    /**
     * Returns true if the resistance is editable.  Household item resistance is not editable.
     * @returns {boolean}
     * @public
     */
    isResistanceEditable: function() {
      return true;
    },
    
    /**
     * Returns true if the inductance is editable.
     * @returns {boolean}
     * @public
     */
    isInductanceEditable: function() {
      return true;
    },

    /**
     * Get the properties so that the circuit can be solved when changed.
     * @override
     * @returns {Property.<*>[]}
     * @public
     */
    getCircuitProperties: function() {
    	
    	//initial calculation of the resistance (X_L) with the default values
    	this.inductanceProperty.value = ( this.resistanceProperty.value / (2 * 3.14 * this.internalFrequencyProperty.value )); 
      return [ this.resistanceProperty, this.inductanceProperty ];
    },

    /**
     * Get all intrinsic properties of this object, which can be used to load it at a later time.
     * @returns {Object}
     * @public
     */
    toIntrinsicStateObject: function() {
      var parent = FixedCircuitElement.prototype.toIntrinsicStateObject.call( this );
      return _.extend( parent, {
    	inductance: this.inductanceProperty.value,
        resistance: this.resistanceProperty.value,
        coilLength: this.chargePathLength
      } );
    }
  } );
} );