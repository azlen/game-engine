ge.svg = Snap().attr({})
ge.svg.node.parentNode.removeChild(ge.svg.node)
ge.svg.node.setAttribute('preserveAspectRatio','xMidYMid slice')

var viewboxOffsetLeft = 0;
var viewboxOffsetTop = 0;

var resizecenter = true;
	
ge.svg.resize = function(){
	var width = ge.svg.node.offsetWidth;
	var height = ge.svg.node.offsetHeight;
	//"-"+width/2+" -"+height/2+" "+width+" "+height
	viewboxOffsetLeft = resizecenter?width/2:0;
	viewboxOffsetTop = resizecenter?height/2:0;
	ge.svg.attr({
		viewBox: "-"+viewboxOffsetLeft+" -"+viewboxOffsetTop+" "+width+" "+height,
	})
}

var bcircle = ge.svg.rect(-25, -25, 50,50);
// By default its black, lets change its attributes
bcircle.attr({
    fill: "#bada55",
    stroke: "#000",
    strokeWidth: 5,
    cursor:"move"
});

function deltaTransformPoint(matrix, point)  {
    var dx = point.x * matrix.a + point.y * matrix.c + 0;
    var dy = point.x * matrix.b + point.y * matrix.d + 0;
    return { x: dx, y: dy };
}
function getRotation(matrix) {
    var px = deltaTransformPoint(matrix, { x: 0, y: 1 });
    var rotation = ((180 / Math.PI) * Math.atan2(px.y, px.x) - 90);

    return rotation       
}
function direction(x1,y1,x2,y2){
	return Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
}
function distance(x1,y1,x2,y2){
	return Math.sqrt( (x2-=x1)*x2 + (y2-=y1)*y2 );
}
function toRad(deg){
	return deg/(180/Math.PI)
}

var drag = {}
drag.mousedown = function(x,y){
	this.stepview = (ge.view.current == ge.view.get('step'));
	this.sceneview = (ge.view.current == ge.view.get('scene'));

	if(this.parent() != BBox){
    	showBBox(this);
    }else{
    	this.startscalex = Number(BBox.selected.attr("width"));
	    this.startscaley = Number(BBox.selected.attr("height"));
	    this.startrotation = getRotation(BBox.selected.matrix);
    }

    BBox.selected.dragging = true;

	this.startx = x;
    this.starty = y;
    this.selectedstartx = Number(BBox.selected.attr("x"));
    this.selectedstarty = Number(BBox.selected.attr("y"));

    this.startrotation = (BBox.selected.matrix != undefined)?getRotation(BBox.selected.matrix):undefined;

    this.newstep = true;
}
drag.mousemove = function(dx,dy){

	if(this.stepview){
		var addstep = false;
		if(ge.view.current == ge.view.get('step') && this.newstep == true){
			addstep = true;
			this.newstep = false;
			var thenewstep = new ge.step();
			ge.currentBehaviour.get('steps').models.splice(ge.currentBehaviour.get('steps').models.indexOf(ge.currentStep)+1,0,thenewstep)
			ge.currentStep = thenewstep;
			//ge.stepchannel.changemodel(ge.currentStep);
		}
		var steptext = '';
		var args = [];
	}


	if(this.parent() == BBox){
		var cx = parseInt(BBox.selected.attr('x'))+parseInt(BBox.selected.attr('width'))/2;
		var cy = parseInt(BBox.selected.attr('y'))+parseInt(BBox.selected.attr('height'))/2;

		if(this.dragtype == 'scale'){
			if(this.scaletype.x != undefined){ // SCALE X
				ddx = (Math.cos( toRad( direction( 0, 0, dx, dy ) ) - toRad( this.startrotation ) )*distance(0,0,dx,dy)) * this.scaletype.x;
				width = this.startscalex + ddx*2;
				BBox.selected.attr({
					'x': this.selectedstartx - ddx - (Math.abs(width) - width)/2,
					'width': Math.abs(width),
				})
				if(this.stepview){
					steptext = 'Scale X %s %epx';
					args.push('sx')
					ge.currentStep.set('sx',Math.round(ddx*2*10)/10)
					ge.currentStep.set('tosx',Math.round((this.startscalex+ddx*2)*10)/10)
				}else if(this.sceneview){
					BBox.selected.sceneobject.sx = Math.round(ddx*2*10)/10;
				}
			}
			if(this.scaletype.y != undefined){ // SCALE Y
				ddy = (Math.sin(toRad(direction(0,0,dx,dy)) - toRad(this.startrotation))*distance(0,0,dx,dy)) * this.scaletype.y;;
				height = this.startscaley + ddy*2;
				BBox.selected.attr({
					'y': this.selectedstarty - ddy - (Math.abs(height) - height)/2,
					'height': Math.abs(height),
				})
				if(this.stepview){
					steptext = 'Scale Y %s %epx';
					args.push('sy')
					ge.currentStep.set('sy',Math.round(ddy*2*10)/10)
					ge.currentStep.set('tosy',Math.round((this.startscaley+ddy*2)*10)/10)
				}else if(this.sceneview){
					BBox.selected.sceneobject.sy = Math.round(ddy*2*10)/10;
				}
			}
			if(this.scaletype.y != undefined && this.scaletype.x != undefined && this.stepview){
				steptext = 'Scale %s (x: %e, y: %e)';				
			}
		}else if(this.dragtype == 'rotate'){
			var rotation = (direction(cx,cy,this.startx-viewboxOffsetLeft-ge.svg.node.parentElement.offsetLeft+dx,this.starty-viewboxOffsetTop-ge.svg.node.parentElement.offsetTop+dy)+90);
			BBox.selected.attr({
				'transform': 'rotate('+rotation+','+cx+','+cy+')'
			})

			if(this.stepview){
				steptext = 'Rotate %s %e degrees';
				args.push('rotation')

				ge.currentStep.set('rotation',Math.round((rotation-this.startrotation)*10)/10)
				ge.currentStep.set('torotation',Math.round(rotation*10)/10)
			}else if(this.sceneview){
				BBox.selected.sceneobject.rotation = Math.round((rotation-this.startrotation)*10)/10;
			}
		}

		showBBox(BBox.selected);
	}else{
		this.attr({
			'transform':'rotate(0,0,0)'
		})
		this.attr({"x": this.selectedstartx + dx, "y": this.selectedstarty + dy});
		this.attr({
			'transform':'rotate('+this.startrotation+','+cx+','+cy+')'
		})
		showBBox(this);

		if(this.stepview){
			steptext = 'Move %s ( X: %epx, Y: %epx )';
			ge.currentStep.set('x', dx);
			ge.currentStep.set('y', dy);
			ge.currentStep.set('tox', this.selectedstartx+dx);
			ge.currentStep.set('toy', this.selectedstarty+dy);
			args.push('x')
			args.push('y')
		}else if(this.sceneview){
			this.sceneobject.x = this.selectedstartx+dx;
			this.sceneobject.y = this.selectedstarty+dy;
		}
	}

	/*var superargs = {
		x:
	}*/

	if(this.stepview){
		ge.currentStep.set('steptexttemp',steptext);
		ge.currentStep.set('args',args);

		ge.view.get('step').get('update')();
	}
}
drag.mouseup = function(){
	BBox.selected.dragging = false;
}

var hs = 10; //Handle Size
var BBox;

function initBBox(){
	BBox = ge.svg.group( ge.svg.rect().attr({fill:'none',stroke:'#000'}) )
	BBox.add( ge.svg.line().attr({stroke:'#000'}) )
	for(var i = 0; i < 9; i++){
		var handle = ge.svg.rect(0,0,hs,hs).attr({
			fill:'#fff',
			stroke:'#000',
		})
		handle.dragtype = i!=8?'scale':'rotate';
		handle.scaletype = [{x:-1,y:-1},{y:-1},{x:1,y:-1},{x:1},{x:1,y:1},{y:1},{x:-1,y:1},{x:-1}][i];
		handle.drag(drag.mousemove, drag.mousedown, drag.mouseup)
		BBox.add(handle)
	}
	BBox.clonedMatrix = BBox.transform().localMatrix.clone()
	hideBBox();
}

function showBBox(target){
	BBox.selected = target;
	var bounds = {
		'x':parseInt(target.attr('x')),
		'y':parseInt(target.attr('y')),
		'width':parseInt(target.attr('width')),
		'height':parseInt(target.attr('height'))
	}
	var BB = target.getBBox();
	BBox.attr({
		opacity:'1'
	})
	BBox[0].attr({ // rect
		x: bounds.x,
		y: bounds.y,
		width: bounds.width,
		height: bounds.height,
	})
	BBox[1].attr({ // line
		x1:bounds.x + bounds.width/2,
		x2:bounds.x + bounds.width/2,
		y1:bounds.y,
		y2:bounds.y - 30,
	})
	var lx = [bounds.x-hs/2,bounds.x+bounds.width/2-hs/2,bounds.x+bounds.width-hs/2]
	var ly = [bounds.y-hs/2,bounds.y+bounds.height/2-hs/2,bounds.y+bounds.height-hs/2]
	var list = [{x:lx[0],y:ly[0]},{x:lx[1],y:ly[0]},{x:lx[2],y:ly[0]},{x:lx[2],y:ly[1]},{x:lx[2],y:ly[2]},{x:lx[1],y:ly[2]},{x:lx[0],y:ly[2]},{x:lx[0],y:ly[1]}]
	for(var i = 0; i < 8; i++){
		var handle = BBox[i+2];
		handle.attr(list[i])
		handle.attr({
			//cursor:['nesw','ew','nwse','ns','nesw','ew','nwse','ns'][(Math.abs(getRotation(BBox.selected.matrix)+180)/45+i+2)%8]+'-resize'
		})
	}
	BBox[10].attr({
		x:bounds.x + bounds.width/2 - hs/2,
		y:bounds.y - 30 - hs/2,
		cursor:'alias',
	}) // rotation handle
	BBox.attr({
		'transform':target.matrix
	})
	BBox.node.parentNode.appendChild(BBox.node)
}

function hideBBox(){
	BBox.attr({
		opacity:'0',
		transform:BBox.transform().localMatrix.translate(-6666,-6666)
	})
}

function animation(behaviour){
	this.behaviour = behaviour;
	this.steps = behaviour.get('steps');
	this.svgcache = new DocumentFragment();
	for(var i = 0; i < ge.svg.node.children.length; i++){
		this.svgcache.appendChild(ge.svg.node.children[i])
	}
	ge.svg.clear();

	this.stopped = false;

	this.sprite = ge.svg.rect(-25, -25, 50,50);
	// By default its black, lets change its attributes
	this.sprite.attr({
	    fill: "#bada55",
	    stroke: "#000",
	    strokeWidth: 5
	});

	this.animate()
}
animation.prototype.animate = function(){
	var steps = this.steps.models;
	var sprite = this.sprite;
	for(var i = 0; i < steps.length; i++){
		var startx = Number(sprite.attr('x'));
		var starty = Number(sprite.attr('y'));
		var startwidth = Number(sprite.attr('width'));
		var startheight = Number(sprite.attr('height'));
		var startrotation = getRotation(sprite.transform().localMatrix);
		var x = steps[i].get('x').constructor==ge.variable ? steps[i].get('x').get('value') : steps[i].get('x');
		var y = steps[i].get('y').constructor==ge.variable ? steps[i].get('y').get('value') : steps[i].get('y');
		var sx = steps[i].get('sx').constructor==ge.variable ? steps[i].get('sx').get('value') : steps[i].get('sx');
		var sy = steps[i].get('sy').constructor==ge.variable ? steps[i].get('sy').get('value') : steps[i].get('sy');
		var rotation = steps[i].get('rotation').constructor==ge.variable ? steps[i].get('rotation').get('value') : steps[i].get('rotation');
		sprite.attr({
			x: startx + x - sx/2,
			y: starty + y - sy/2,
			width: startwidth + sx,
			height: startheight + sy,
			transform: 'rotate('+(startrotation+rotation)+','+(startx+startwidth/2)+','+(starty+startheight/2)+')'
		})
	}

	if(!this.stopped){
		window.requestAnimationFrame(this.animate.bind(this));
	}
}
animation.prototype.stop = function(){
	if(!this.stopped){
		ge.svg.clear();
		this.stopped = true;
		ge.svg.node.appendChild(this.svgcache)
	}
}

ge.svg.node.addEventListener('mousedown',function(e){
	if(e.toElement == this && (ge.view.current == ge.view.get('step') || ge.view.current == ge.view.get('scene'))){
		hideBBox();
	}	
})

window.addEventListener('resize',ge.svg.resize)

bcircle.drag(drag.mousemove, drag.mousedown, drag.mouseup)