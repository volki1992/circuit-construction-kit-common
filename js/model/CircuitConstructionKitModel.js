// Copyright 2015-2017, University of Colorado Boulder

/**
 * Contains circuit, voltmeter, ammeter and properties to indicate what mode the model is in. This exists for the life
 * of the sim and hence does not need a dispose implementation.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var Ammeter = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Ammeter' );
  var BooleanProperty = require( 'AXON/BooleanProperty' );
  var CCKCQueryParameters = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CCKCQueryParameters' );
  var Circuit = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Circuit' );
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var CircuitElementViewType = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/CircuitElementViewType' );
  var ZoomAnimation = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/ZoomAnimation' );
  var Emitter = require( 'AXON/Emitter' );
  var inherit = require( 'PHET_CORE/inherit' );
  var InteractionMode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/InteractionMode' );
  var NumberProperty = require( 'AXON/NumberProperty' );
  var Property = require( 'AXON/Property' );
  var PropertyIO = require( 'AXON/PropertyIO' );
  var Util = require( 'DOT/Util' );
  var Voltmeter = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Voltmeter' );
  var ZoomControlPanel = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/ZoomControlPanel' );
  var EmitterIO = require( 'AXON/EmitterIO' );

  // phet-io modules
  var StringIO = require( 'ifphetio!PHET_IO/types/StringIO' );

  /**
   * @param {Tandem} tandem
   * @param {Object} [options]
   * @constructor
   */
  function CircuitConstructionKitModel( tandem, options ) {

    var self = this;

    options = _.extend( {

      // Determines whether electrons can be shown.  In black box, electrons can only be shown when the user reveals
      // the answer by pressing the reveal answer button.
      revealing: true,
      blackBoxStudy: false
    }, options );

    // @private {EaseAnimation|null} - animation for the zoom level or null if not animating
    this.zoomAnimation = null;

    // @public (read-only) {Circuit} - contains CircuitElements, Vertices, etc.
    this.circuit = new Circuit( tandem.createTandem( 'circuit' ), { blackBoxStudy: options.blackBoxStudy } );

    // @public (read-only) {Voltmeter}
    this.voltmeter = new Voltmeter( tandem.createTandem( 'voltmeter' ) );

    // @public (read-only) {Ammeter}
    this.ammeter = new Ammeter( tandem.createTandem( 'ammeter' ) );

    // @public {BooleanProperty} - changes whether the light bulb brightness and ammeter/voltmeter readouts,
    // charges, flame, etc. can be seen
    this.isValueDepictionEnabledProperty = new BooleanProperty(
      !CCKCQueryParameters.showDepictValuesToggleButton, {
        tandem: tandem.createTandem( 'isValueDepictionEnabledProperty' )
      } );

    // @public {BooleanProperty} - true if the labels in the toolbox should be shown
    this.showLabelsProperty = new BooleanProperty( true, {
      tandem: tandem.createTandem( 'showLabelsProperty' )
    } );

    // @public {BooleanProperty} - true if the labels in the toolbox should be shown
    this.showValuesProperty = new BooleanProperty( false, {
      tandem: tandem.createTandem( 'showValuesProperty' )
    } );

    // @public {Property.<number>} scaling applied to the circuit node so the user can zoom out and make larger circuits
    this.selectedZoomProperty = new NumberProperty( 1, {
      tandem: tandem.createTandem( 'selectedZoomProperty' )
    } );

    // @public (read-only) {Property.<number>} the animated value of the zoom level
    this.currentZoomProperty = new NumberProperty( this.selectedZoomProperty.get(), {
      tandem: tandem.createTandem( 'currentZoomProperty' )
    } );

    this.selectedZoomProperty.lazyLink( function( newValue ) {
      self.zoomAnimation = new ZoomAnimation( self.currentZoomProperty.get(), newValue, function( delta ) {
        var proposedZoomValue = self.currentZoomProperty.value + delta;
        var boundedValue = Util.clamp( proposedZoomValue, ZoomControlPanel.ZOOMED_OUT, ZoomControlPanel.ZOOMED_IN );
        self.currentZoomProperty.value = boundedValue;
      } );
    } );

    // @public {Property.<InteractionMode>} - whether the user is in the InteractionMode.EXPLORE or InteractionMode.TEST mode
    this.modeProperty = new Property( InteractionMode.EXPLORE, {
      validValues: InteractionMode.VALUES,
      tandem: tandem.createTandem( 'modeProperty' ),
      phetioType: PropertyIO( StringIO )
    } );

    // @public {Property.<CircuitElementViewType>} - whether to show lifelike or schematic representations
    this.viewTypeProperty = new Property( CircuitElementViewType.LIFELIKE, {
      validValues: CircuitElementViewType.VALUES,
      tandem: tandem.createTandem( 'viewTypeProperty' ),
      phetioType: PropertyIO( StringIO )
    } );

    // When the user manipulates something, hide the readouts, see
    // https://github.com/phetsims/circuit-construction-kit/issues/130
    // The following cases result in hiding the readouts:
    // 1. More components are dragged out of the toolbox
    // 2. Any vertex is broken
    // 3. Component voltage/resistance is edited
    // 4. A component within a circuit is deleted, see
    // https://github.com/phetsims/circuit-construction-kit-black-box-study/issues/16
    // However, the simulation should not pause when switching between "Explore" and "Test" and "Reveal" in the black
    // box study sim
    var modeChanging = false;

    // TODO: started/endedCallbacksForChangedEmitters don't exist anymore. Rewrite if commented back in.
    // this.modeProperty.startedCallbacksForChangedEmitter.addListener( function() {
    //   modeChanging = true;
    // } );
    // this.modeProperty.endedCallbacksForChangedEmitter.addListener( function() {
    //   modeChanging = false;
    // } );
    if ( CCKCQueryParameters.showDepictValuesToggleButton ) {

      // TODO: (black-box-study) fix this
      var pause = function() {
        if ( !modeChanging ) {
          self.isValueDepictionEnabledProperty.value = false;
        }
      };
      this.circuit.vertices.lengthProperty.lazyLink( pause );
      this.circuit.componentEditedEmitter.addListener( pause );
      this.circuit.circuitElements.lengthProperty.link( pause );
    }

    // For PhET-iO, when a component is edited or a vertex is added, connected, or cut, output the circuit to the data
    // stream. Only do this for phet-io brand so it doesn't disturb performance of other brands
    if ( phet.phetio ) {

      var circuitChangedEmitter = new Emitter( {
        tandem: tandem.createTandem( 'circuitChangedEmitter' ),
        phetioType: EmitterIO( [ StringIO ] )
      } );

      var emitCircuitChanged = function() {

        // Wait until all vertices have been added so we can get their indices without erroring out.
        // TODO (phet-io): investigate coarse-grained messages (vertex cut, item added, etc) instead of vertex added,
        // which could lead to inconsistent state. On the other hand, why is CircuitElement added before vertex?  That
        // could solve it
        setTimeout( function() {
          circuitChangedEmitter.emit1( JSON.stringify( self.circuit.toStateObject() ) );
        }, 0 );
      };
      this.circuit.vertices.lengthProperty.link( emitCircuitChanged );
      this.circuit.componentEditedEmitter.addListener( emitCircuitChanged );
    }

    // When the simulation pauses and resumes, clear the time scaling factor (so it doesn't show a stale value)
    this.isValueDepictionEnabledProperty.link( function() {
      self.circuit.chargeAnimator.timeScaleRunningAverage.clear();
    } );

    // When the view changes between schematic/lifelike, update the electron paths (because the LightBulb has a different
    // charge path depending on the view
    this.viewTypeProperty.link( function() {

      // First update the length of the light bulbs
      self.circuit.circuitElements.forEach( function( circuitElement ) {
        circuitElement.updatePathLength && circuitElement.updatePathLength();
      } );

      // Then position the electrons in the new paths
      self.circuit.relayoutAllCharges();
    } );

    // @public - true when the user is holding down the reveal button and the answer (inside the black box) is showing
    this.revealingProperty = new BooleanProperty( options.revealing, {
      tandem: tandem.createTandem( 'revealingProperty' )
    } );

    // @public {Bounds2} - bounds of the black box, if any.  Set by subclass in Black Box Study. Specifically, filled
    // in by the BlackBoxSceneView after the black box node is created and positioned
    this.blackBoxBounds = null;
  }

  circuitConstructionKitCommon.register( 'CircuitConstructionKitModel', CircuitConstructionKitModel );

  return inherit( Object, CircuitConstructionKitModel, {

    /**
     * Update the circuit and zoom level when the simulation clock steps.
     * @param {number} dt - elapsed time in seconds
     * @public
     */
    step: function( dt ) {

      if ( this.zoomAnimation ) {
        var overflow = this.zoomAnimation.step( dt );
        if ( overflow > 0 ) {
          this.zoomAnimation = null;
        }
      }

      // Only move charges if the simulation is not paused.

      this.isValueDepictionEnabledProperty.value && this.circuit.step( dt );

      this.circuit.layoutChargesInDirtyCircuitElements();
    },

    /**
     * Reset the circuit.
     * @public
     */
    reset: function() {
      this.isValueDepictionEnabledProperty.reset();
      this.showLabelsProperty.reset();
      this.showValuesProperty.reset();
      this.modeProperty.reset();
      this.circuit.reset();
      this.voltmeter.reset();
      this.ammeter.reset();
      this.viewTypeProperty.reset();
      this.currentZoomProperty.reset();
      this.selectedZoomProperty.reset();

      // cancel any animation in progress, including (but not limited to) one that may have just been caused by reset
      this.zoomAnimation = null;
    }
  } );
} );