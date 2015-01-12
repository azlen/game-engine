ge.canvas = new fabric.Canvas(crel('canvas'))
ge.canvas.rotationCursor = 'alias'
ge.canvas.selection = false;

// create a rectangle object
var rect = new fabric.Rect({
  left: 0,
  top: 0,
  fill: 'pink',
  width: 100,
  height: 100
});

// "add" rectangle onto canvas
ge.canvas.add(rect);

function resize(){
	var width = window.innerWidth;
	var height = window.innerHeight;
	ge.canvas.setWidth( width );
	ge.canvas.setHeight( height );
	ge.canvas.viewportTransform = [1,0,0,1,width/2, height/2 ];
	ge.canvas.renderAll();
	ge.canvas.calcOffset();
}
resize();
window.addEventListener('resize',resize)