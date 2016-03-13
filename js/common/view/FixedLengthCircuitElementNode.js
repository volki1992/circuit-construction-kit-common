// Copyright 2015, University of Colorado Boulder

/**
 *
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var circuitConstructionKitBasics = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/circuitConstructionKitBasics' );
  var CircuitConstructionKitBasicsConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/CircuitConstructionKitBasicsConstants' );
  var Image = require( 'SCENERY/nodes/Image' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Vector2 = require( 'DOT/Vector2' );
  var Property = require( 'AXON/Property' );
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var CircuitElementEditPanel = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/common/view/CircuitElementEditPanel' );

  /**
   *
   * @param circuitNode - Null if an icon is created
   * @param circuitElement
   * @param image
   * @param {number} imageScale - the scale factor to apply to the image for the size in the play area (icons are automatically scaled up)
   * @param options
   * @constructor
   */
  function FixedLengthCircuitElementNode( circuitNode, circuitElement, image, imageScale, options ) {
    var fixedLengthCircuitElementNode = this;
    options = _.extend( {
      icon: false
    }, options );
    this.circuitElement = circuitElement;

    // @protected (for ResistorNode to paint the color bands on)
    this.imageNode = new Image( image );

    var imageNode = this.imageNode;

    // Relink when start vertex changes
    var multilink = null;
    var relink = function() {
      multilink && multilink.dispose();
      multilink = Property.multilink( [ circuitElement.startVertex.positionProperty, circuitElement.endVertex.positionProperty ], function( startPosition, endPosition ) {
        var angle = endPosition.minus( startPosition ).angle(); // TODO: speed up maths
        // TODO: Simplify this matrix math.
        imageNode.resetTransform();
        imageNode.mutate( {
          scale: imageScale
        } );
        imageNode.rotateAround( new Vector2( 0, 0 ), angle );
        imageNode.x = startPosition.x;
        imageNode.y = startPosition.y;
        imageNode.translate( 0, -image[ 0 ].height / 2 );
      } );
    };
    relink();

    circuitElement.startVertexProperty.lazyLink( relink );
    circuitElement.endVertexProperty.lazyLink( relink );

    if ( circuitNode ) {
      var inset = -10;
      var highlightNode = new Rectangle( inset, inset, imageNode.width - inset * 2, imageNode.height - inset * 2, {
        stroke: 'yellow',
        lineWidth: 5,

        // TODO: Probably move the highlight to another node, so that its parent isn't image node
        // TODO: So that it can extend beyond the bounds without throwing off the layout
        scale: 1.0 / imageScale,
        pickable: false
      } );

      imageNode.addChild( highlightNode );
    }

    Node.call( this, {
      cursor: 'pointer',
      children: [
        imageNode
      ]
    } );

    // Use whatever the start node currently is (it can change), and let the circuit manage the dependent vertices
    // TODO: Should not rotate when dragging by body
    var p = null;
    this.inputListener = new SimpleDragHandler( {
      start: function( event ) {
        p = event.pointer.point;
        circuitNode.startDrag( event, circuitElement.endVertex );
      },
      drag: function( event ) {
        circuitNode.drag( event, circuitElement.endVertex );
      },
      end: function( event ) {

        // TODO: if over the toolbox, then drop into it, and don't process further

        circuitNode.endDrag( event, circuitElement.endVertex );

        // Only show the editor when tapped tap, not on every drag.
        // TODO: Shared code with VertexNode
        if ( event.pointer.point.distance( p ) < CircuitConstructionKitBasicsConstants.tapThreshold ) {

          circuitNode.circuit.lastCircuitElementProperty.set( circuitElement );

          // When the user clicks on anything else, deselect the vertex
          var deselect = function( event ) {

            // Detect whether the user is hitting something pickable in the CircuitElementEditPanel
            var circuitElementEditPanel = false;
            for ( var i = 0; i < event.trail.nodes.length; i++ ) {
              var trailNode = event.trail.nodes[ i ];
              if ( trailNode instanceof CircuitElementEditPanel ) {
                circuitElementEditPanel = true;
              }
            }

            // If the user clicked outside of the CircuitElementEditPanel, then hide the edit panel and
            // deselect the circuitElement
            if ( !circuitElementEditPanel ) {
              circuitNode.circuit.lastCircuitElementProperty.set( null );
              event.pointer.removeInputListener( listener ); // Thanks, hoisting!
            }
          };
          var listener = {
            mouseup: deselect,
            touchup: deselect
          };
          event.pointer.addInputListener( listener );
        }
      }
    } );
    !options.icon && imageNode.addInputListener( this.inputListener );

    if ( circuitNode ) {
      circuitNode.circuit.lastCircuitElementProperty.link( function( lastCircuitElement ) {
        var showHighlight = lastCircuitElement === circuitElement;
        highlightNode.visible = showHighlight;
      } );
    }

    this.disposeFixedLengthCircuitElementNode = function() {
      if ( fixedLengthCircuitElementNode.inputListener.dragging ) {
        fixedLengthCircuitElementNode.inputListener.endDrag();
      }
      multilink && multilink.dispose();
    };
  }

  circuitConstructionKitBasics.register( 'FixedLengthCircuitElementNode', FixedLengthCircuitElementNode );

  return inherit( Node, FixedLengthCircuitElementNode, {
    dispose: function() {
      this.disposeFixedLengthCircuitElementNode();
    }
  } );
} );
