// Copyright 2015-2017, University of Colorado Boulder
// TODO: Review, document, annotate, i18n, bring up to standards

/**
 * Renders and provides interactivity for FixedLengthCircuitElements (all CircuitElements except Wires).
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var Battery = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/common/model/Battery' );
  var Resistor = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/common/model/Resistor' );
  var Property = require( 'AXON/Property' );
  var TandemSimpleDragHandler = require( 'TANDEM/scenery/input/TandemSimpleDragHandler' );
  var CircuitElementNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/common/view/CircuitElementNode' );
  var Matrix3 = require( 'DOT/Matrix3' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Image = require( 'SCENERY/nodes/Image' );
  var Vector2 = require( 'DOT/Vector2' );
  var FixedLengthCircuitElementHighlightNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/common/view/FixedLengthCircuitElementHighlightNode' );

  // images
  var fireImage = require( 'mipmap!CIRCUIT_CONSTRUCTION_KIT_COMMON/fire.png' );

  // constants
  var transform = new Matrix3();
  var rotationMatrix = new Matrix3();

  /**
   * @param {CircuitConstructionKitScreenView} circuitConstructionKitScreenView
   * @param {CircuitNode} circuitNode - Null if an icon is created
   * @param {FixedLengthCircuitElement} circuitElement
   * @param {Property.<string>} viewProperty - 'lifelike'|'schematic'
   * @param {Node} lifelikeNode - the node that will display the component as a lifelike object
   * @param {Node} schematicNode - the node that will display the component
   * @param {Tandem} tandem
   * @param options
   * @constructor
   */
  function FixedLengthCircuitElementNode( circuitConstructionKitScreenView, circuitNode, circuitElement, viewProperty,
                                          lifelikeNode, schematicNode, tandem, options ) {
    assert && assert( lifelikeNode !== schematicNode, 'schematicNode should be different than lifelikeNode' );
    var self = this;

    // node that shows the component, separate from the part that shows the highlight and the fire
    var contentNode = new Node();
    this.contentNode = contentNode;// TODO eliminate redundant

    // Center the nodes so they will be easy to position
    lifelikeNode.center = Vector2.ZERO;
    schematicNode.center = Vector2.ZERO;

    // Show the selected node
    viewProperty.link( function( view ) {
      contentNode.children = [ view === 'lifelike' ? lifelikeNode : schematicNode ];
    } );

    options = _.extend( {
      icon: false,

      // TODO: move to prototype?
      // TODO: this is getting called twice per drag.  Perhaps mark as dirty then update in view step?
      updateLayout: function() {
        self.dirty = true;
      },
      highlightOptions: {}
    }, options );

    // Add highlight (but not for icons)
    if ( !options.icon ) {
      var highlightNode = new FixedLengthCircuitElementHighlightNode( this, {} );
      circuitNode.highlightLayer.addChild( highlightNode );
    }

    // Relink when start vertex changes
    circuitElement.vertexMovedEmitter.addListener( options.updateLayout );

    var moveToFront = function() {

      // Components outside the black box do not move in front of the overlay
      if ( circuitElement.interactiveProperty.get() ) {
        self.moveToFront();
        self.circuitElement.moveToFrontEmitter.emit();
        self.circuitElement.startVertexProperty.get().relayerEmitter.emit();
        self.circuitElement.endVertexProperty.get().relayerEmitter.emit();
      }
    };
    circuitElement.connectedEmitter.addListener( moveToFront );
    circuitElement.vertexSelectedEmitter.addListener( moveToFront );

    var circuit = circuitNode && circuitNode.circuit;
    CircuitElementNode.call( this, circuitElement, circuit, _.extend( {
      cursor: 'pointer',
      children: [ // TODO: this is a code smell if there is only one child of a node
        contentNode
      ],
      tandem: tandem
    }, options ) );

    var pickableListener = function( interactive ) {
      self.pickable = interactive;
    };

    // CCKLightBulbForegroundNode cannot ever be pickable, so let it opt out of this callback
    if ( options.pickable !== false ) {
      circuitElement.interactiveProperty.link( pickableListener );
    }

    // Use whatever the start node currently is (it can change), and let the circuit manage the dependent vertices
    var eventPoint = null;
    var didDrag = false;
    if ( !options.icon ) {
      this.inputListener = new TandemSimpleDragHandler( {
        allowTouchSnag: true,
        tandem: tandem.createTandem( 'inputListener' ), // TODO: some input listeners are 'dragHandler' let's be consistent
        start: function( event ) {
          eventPoint = event.pointer.point;
          circuitElement.interactiveProperty.get() && circuitNode.startDrag( event.pointer.point, circuitElement.endVertexProperty.get(), false );
          didDrag = false;
        },
        drag: function( event ) {
          circuitElement.interactiveProperty.get() && circuitNode.drag( event.pointer.point, circuitElement.endVertexProperty.get(), false );
          didDrag = true;
        },
        end: function( event ) {

          if ( !circuitElement.interactiveProperty.get() ) {
            // nothing to do
          }
          else if ( circuitConstructionKitScreenView.canNodeDropInToolbox( self ) ) {

            var creationTime = self.circuitElement.creationTime;
            var lifetime = phet.joist.elapsedTime - creationTime;
            var delayMS = Math.max( 500 - lifetime, 0 );

            // If over the toolbox, then drop into it, and don't process further
            contentNode.removeInputListener( self.inputListener );

            var id = setTimeout( function() {
              circuitConstructionKitScreenView.dropCircuitElementNodeInToolbox( self );
            }, delayMS );

            // If disposed by reset all button, clear the timeout
            circuitElement.disposeEmitter.addListener( function() { clearTimeout( id ); } );
          }
          else {

            circuitNode.endDrag( event, circuitElement.endVertexProperty.get(), didDrag );

            // Only show the editor when tapped, not on every drag.  Also, event could be undefined if this end() was triggered
            // by dispose()
            event && self.selectVertexWhenNear( event, circuitNode, eventPoint );

            didDrag = false;
          }
        }
      } );
      contentNode.addInputListener( this.inputListener );
    }

    if ( !options.icon ) {
      var updateSelectionHighlight = function( lastCircuitElement ) {
        var showHighlight = lastCircuitElement === circuitElement;
        highlightNode.visible = showHighlight;
      };
      circuitNode.circuit.selectedCircuitElementProperty.link( updateSelectionHighlight );
    }

    if ( !options.icon && (circuitElement instanceof Battery || circuitElement instanceof Resistor) ) {
      this.fireNode = new Image( fireImage, { pickable: false, opacity: 0.95 } );
      this.fireNode.mutate( { scale: contentNode.width / this.fireNode.width } );
      this.addChild( this.fireNode );

      var showFire = function( current, exploreScreenRunning ) {
        return Math.abs( current ) >= 10 && exploreScreenRunning;
      };

      var updateFireMultilink = circuitElement instanceof Resistor ?

        // Show fire in resistors (but only if they have >0 resistance)
                                (Property.multilink( [
                                  circuitElement.currentProperty,
                                  circuitElement.resistanceProperty,
                                  circuitConstructionKitScreenView.circuitConstructionKitModel.exploreScreenRunningProperty
                                ], function( current, resistance, exploreScreenRunning ) {
                                  self.fireNode.visible = showFire( current, exploreScreenRunning ) && resistance >= 1E-8;
                                } )) :

        // Show fire in all other circuit elements
                                (Property.multilink( [
                                  circuitElement.currentProperty,
                                  circuitConstructionKitScreenView.circuitConstructionKitModel.exploreScreenRunningProperty
                                ], function( current, exploreScreenRunning ) {
                                  self.fireNode.visible = showFire( current, exploreScreenRunning );
                                } ));
    }

    // Update after the highlight/readout/fire exist
    options.updateLayout();

    // @private - for disposal
    this.disposeFixedLengthCircuitElementNode = function() {
      if ( self.inputListener && self.inputListener.dragging ) {
        self.inputListener.endDrag();
      }

      circuitElement.vertexMovedEmitter.removeListener( options.updateLayout );

      updateSelectionHighlight && circuitNode.circuit.selectedCircuitElementProperty.unlink( updateSelectionHighlight );

      circuitElement.connectedEmitter.removeListener( moveToFront );
      circuitElement.vertexSelectedEmitter.removeListener( moveToFront );

      circuitElement.interactiveProperty.unlink( pickableListener );

      circuitNode && circuitNode.highlightLayer.removeChild( highlightNode );

      if ( !options.icon && circuitElement instanceof Battery ) {
        Property.unmultilink( updateFireMultilink );
      }
    };

    // TODO: doc/cleanup/move to prototype?
    this.updateRender = function() {
      var startPosition = circuitElement.startVertexProperty.get().positionProperty.get();
      var endPosition = circuitElement.endVertexProperty.get().positionProperty.get();
      var delta = endPosition.minus( startPosition );
      var angle = delta.angle();
      var center = startPosition.blend( endPosition, 0.5 );

      // Update the node transform in a single step, see #66
      transform.setToTranslation( center.x, center.y ).multiplyMatrix( rotationMatrix.setToRotationZ( angle ) );
      contentNode.setMatrix( transform );
      highlightNode && highlightNode.setMatrix( transform.copy() );

      // Update the fire transform
      var flameExtent = 0.8;
      var scale = delta.magnitude() / fireImage[ 0 ].width * flameExtent;
      var flameInset = (1 - flameExtent) / 2;
      transform.setToTranslation( startPosition.x, startPosition.y )
        .multiplyMatrix( rotationMatrix.setToRotationZ( angle ) )
        .multiplyMatrix( rotationMatrix.setToScale( scale ) )
        .multiplyMatrix( rotationMatrix.setToTranslation( delta.magnitude() * flameInset / scale, -fireImage[ 0 ].height ) );
      self.fireNode && self.fireNode.setMatrix( transform.copy() );
    };
  }

  circuitConstructionKitCommon.register( 'FixedLengthCircuitElementNode', FixedLengthCircuitElementNode );

  return inherit( CircuitElementNode, FixedLengthCircuitElementNode, {

    step: function() {
      if ( this.dirty ) {
        this.updateRender();
        this.dirty = false;
      }
    },

    /**
     * @public - dispose resources when no longer used
     */
    dispose: function() {
      CircuitElementNode.prototype.dispose.call( this );
      this.disposeFixedLengthCircuitElementNode();
    }
  }, {
    HIGHLIGHT_INSET: 10
  } );
} );
