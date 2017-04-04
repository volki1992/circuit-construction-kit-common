// Copyright 2016, University of Colorado Boulder

/**
 * Creates Charge instances in a CircuitElement when it has been created, or when an adjacent wire's length has been modified.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Charge = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/common/model/Charge' );
  var CircuitConstructionKitConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CircuitConstructionKitConstants' );

  /**
   * @param {Circuit} circuit
   * @constructor
   */
  function ChargeLayout( circuit ) {

    // @private
    this.circuit = circuit;
  }

  circuitConstructionKitCommon.register( 'ChargeLayout', ChargeLayout );

  return inherit( Object, ChargeLayout, {

    /**
     * Creates and positions charges in the specified circuit element.
     * @param circuitElement
     * @public
     */
    layoutCharges: function( circuitElement ) {

      if ( !circuitElement.chargeLayoutDirty ) {
        return;
      }

      // Remove any charges that were already in the branch.
      // TODO: a performance improvement could be to adjust them instead of delete/recreate. This could particularly
      // help when dragging a wire, and the charges are continually re-layed-out.
      var particlesToRemove = this.circuit.getChargesInCircuitElement( circuitElement );
      this.circuit.charges.removeAll( particlesToRemove );

      // compress or expand, but fix a particle at startingPoint and endingPoint.
      var offset = CircuitConstructionKitConstants.CHARGE_SEPARATION / 2;

      var endingPoint = circuitElement.chargePathLength - offset;
      var startingPoint = offset;
      var length = endingPoint - startingPoint;

      var numberOfParticles = Math.ceil( length / CircuitConstructionKitConstants.CHARGE_SEPARATION );
      var density = ( numberOfParticles - 1) / length;  // TODO: why is this subtracting 1?
      var dx = 1 / density;

      // If there is a single particle, show it in the middle of the component.
      if ( numberOfParticles === 1 ) {
        dx = 0;
        offset = (startingPoint + endingPoint) / 2;
      }
      for ( var i = 0; i < numberOfParticles; i++ ) {
        this.circuit.charges.add( new Charge( circuitElement, i * dx + offset, this.circuit.showCurrentProperty, this.circuit.currentTypeProperty.get() === 'electrons' ? -1 : +1 ) );
      }

      circuitElement.chargeLayoutDirty = false;
    }
  } );
} );