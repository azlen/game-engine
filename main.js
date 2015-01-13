crel(document.body,
	crel('header',{'id':'header'},
		crel('h1',{'id':'title'},'Echoprax ', crel('sub','7.5.8'),playbtn = crel('button',{'class':'playbtn btn'},'play'))
	),
	crel('div',{'id':'content','data-channel':'view.el'})
)

var ge = new app();
ge.gamesize = {
	width:800,
	height:550
}

ge.currentSprite, ge.currentStep, ge.currentBehaviour;

ge.view_model = new ge.model({
	init: function(){},
});

ge.view = new ge.collection(ge.view_model, [
	{name:'scene'},
	{name:'behaviour'},
	{name:'step'},
]);

ge.view.channel = new ge.channel('view',new ge.view_model());

ge.view.set = function(name){
	var model;
	for(var i = 0; i < this.models.length; i++){
		if(this.models[i].get('name') == name){
			model = this.models[i]
			break;
		}
	}
	if(model != undefined){
		ge.view.current = model;
		ge.view.channel.changemodel(model)
		ge.view.current.get('init')();
	}
}

ge.view.get = function(name){
	var model;
	for(var i = 0; i < this.models.length; i++){
		if(this.models[i].get('name') == name){
			model = this.models[i]
			break;
		}
	}
	return model;
}

function back(){
	if(ge.view.current == ge.view.get('behaviour')){
		ge.view.set('scene');
	}else if(ge.view.current == ge.view.get('step')){
		ge.view.set('behaviour')
	}
}

window.onload = function(){
	ge.view.set('scene')
}

window.addEventListener('keydown',function(e){
	var kdown;
	for(var i in keys){
		if(keys[i] == e.keyCode){
			kdown = i;
		}
	}
	keysdown[kdown] = true;
})
window.addEventListener('keyup',function(e){
	var kup;
	for(var i in keys){
		if(keys[i] == e.keyCode){
			kup = i;
		}
	}
	keysdown[kup] = false;
})
var keysdown = {};
function play(){
	this.svgcache = new DocumentFragment();
	for(var i = 0; i < ge.svg.node.children.length; i++){
		this.svgcache.appendChild(ge.svg.node.children[i])
	}
	ge.svg.clear();
	this.stopped = false;

	this.data = {};
	this.data.sprites = {};

	for(var a = 0; a < ge.sprites.models.length; a++){
		var sprite = ge.sprites.models[a];
		var width = sprite.get('width');
		var height = sprite.get('height');
		this.data.sprites[sprite.get('name')] = {};
		//this.data.sprites[sprite.get('name')].width = width;
		//this.data.sprites[sprite.get('name')].height = height;
		this.data.sprites[sprite.get('name')].behaviours = {};
		for(var b = 0; b < sprite.get('behaviours').models.length; b++){
			var behaviour = sprite.get('behaviours').models[b];
			this.data.sprites[sprite.get('name')].behaviours[behaviour.get('name')] = {};
			this.data.sprites[sprite.get('name')].behaviours[behaviour.get('name')].variables = {};
			this.data.sprites[sprite.get('name')].behaviours[behaviour.get('name')].steps = [];
			this.data.sprites[sprite.get('name')].behaviours[behaviour.get('name')].events = [];

			for(var c = 0; c < behaviour.get('events').models.length; c++){
				var ev = behaviour.get('events').models[c];
				this.data.sprites[sprite.get('name')].behaviours[behaviour.get('name')].events.push(merge({},ev.attr))
			}
			for(var c = 0; c < behaviour.get('variables').models.length; c++){
				var variable = behaviour.get('variables').models[c];
				this.data.sprites[sprite.get('name')].behaviours[behaviour.get('name')].variables[variable.get('name')] = variable.get('value');
			}
			for(var c = 0; c < behaviour.get('steps').models.length; c++){
				var step = behaviour.get('steps').models[c];
				this.data.sprites[sprite.get('name')].behaviours[behaviour.get('name')].steps.push(merge({},step.attr))
			}
		}
	}

	this.data.spritelist = [];

	for(var a = 0; a < ge.scene.get('sprites').length; a++){
		var sprite = ge.scene.get('sprites')[a];
		var object = {
			name: sprite.model.get('name'),
			x: sprite.x - ge.svg.node.parentElement.offsetLeft - sprite.sx/2,
			y: sprite.y - ge.svg.node.parentElement.offsetTop - sprite.sy/2,
			width: sprite.model.get('width') + sprite.sx,
			height: sprite.model.get('height') + sprite.sy,
			rotation: sprite.rotation
		};
		object.behaviours = merge({},this.data.sprites[sprite.model.get('name')].behaviours);
		object.sprite = ge.svg.rect(object.x,object.y,object.width,object.height);
		object.sprite.attr({
			transform: 'rotate('+object.rotation+','+(object.x+object.width/2)+','+(object.y+object.height/2)+')'
		})

		this.data.spritelist.push(object);
	}

	console.log(this.data);

	this.tick()
}
play.prototype.tick = function(){
	for(var a in this.data.spritelist){
		var sprite = this.data.spritelist[a];
		for(var b in sprite.behaviours){
			var behaviour = sprite.behaviours[b];
			var cont = false;
			for(var d in behaviour.events){
				var ev = behaviour.events[d];
				if(ev.type == 'keypress'){
					if(keysdown[ev.data] != true){
						cont = true;
					}
				}else if(ev.type == 'collision'){
					for(var e in this.data.spritelist){
						var testsprite = this.data.spritelist[e];
						if(sprite == testsprite){
							
						}else if(testsprite.name == ev.data.get('name')){
							var rect1 = sprite.sprite.getBBox();
							var rect2 = testsprite.sprite.getBBox();
							if (rect1.x < rect2.x + rect2.width && rect1.x + rect1.width > rect2.x && rect1.y < rect2.y + rect2.height && rect1.height + rect1.y > rect2.y) {
							    console.log('collision')
							}else{
								cont = true;
							}
						}
					}
				}
			}
			if(cont){
				console.log('continue')
				continue;
			}
			for(var c in behaviour.steps){
				var step = behaviour.steps[c];
				for(var d in step.args){
					var arg = step.args[d];
					var value = step[arg];
					if(value.constructor == ge.variable){
						value = behaviour.variables[value.get('name')];
					}
					arg = (arg=='sx'?'width':arg);
					arg = (arg=='sy'?'height':arg);
					sprite[arg] += value;
					//console.log(arg+' : '+value)
				}
			}
		}
		sprite.rotation = Math.round(sprite.rotation*100)/100;
		sprite.sprite.attr({
			x: sprite.x,
			y: sprite.y,
			width: sprite.width,
			height: sprite.height,
			transform: 'rotate('+sprite.rotation+','+(sprite.x+sprite.width/2)+','+(sprite.y+sprite.height/2)+')'
		})
	}

	if(!this.stopped){
		window.requestAnimationFrame(this.tick.bind(this));
	}
}
play.prototype.stop = function(){
	if(!this.stopped){
		ge.svg.clear();
		this.stopped = true;
		ge.view.current.get('init')();
	}
}

var currentplay;
playbtn.onclick = function(){
	if(currentplay == undefined){
		currentplay = new play();
		playbtn.textContent = 'Stop';
	}else{
		currentplay.stop();
		playbtn.textContent = 'Play';
		currentplay = undefined;
	}
}

/*function generatecode(){
	var code = "var _canvas = document.querySelector('#c');\nvar _ctx = _canvas.getContext('2d');\n_canvas.width = '"+ge.gamesize.width+"px';\n_canvas.height = '"+ge.gamesize.height+"px';\n";
	code += 'function merge(obj1, obj2) {for (var p in obj2) {try {if ( obj2[p].constructor==Object ) {obj1[p] = merge(obj1[p], obj2[p]);} else {obj1[p] = obj2[p];}} catch(e) {obj1[p] = obj2[p];}}return obj1;}\n'
	code += '\n\nvar _sprite = function(defaults){\n'
	code += 'var fn = function(data){\nmerge(this,this.defaults);\nmerge(this,data)\nthis.width += this.sx;\nthis.height += this.sy;\nthis.init();\n};\n'
	code += 'fn.prototype.init = function(){\n\n}';
	code += 'fn.prototype.update = function(){\n\n}';
	code += 'fn.prototype.draw = function(){\nthis.update();\n_ctx.save();\n_ctx.translate(this.x,this.y);\nctx.rotate(this.rotation/(180/Math.PI))\n_ctx.fillRect(-this.width/2,-this.width/2,this.width,this.height);\n_ctx.restore()\n}';
	code += 'fn.prototype.defaults = defaults;\nreturn fn;\n};\n';
	code += '\n\n';
	for(var a = 0; a < ge.sprites.models.length; a++){
		var sprite = ge.sprites.models[a];
		var s =	sprite.attr;
		delete s.behaviours;
		console.log(s);
		code += 'var $'+sprite.get('name')+' = new _sprite('+JSON.stringify(s)+');\n';
		for(var b = 0; b < sprite.get('behaviours').models.length; b++){
			var behaviour = sprite.get('behaviours').models[b];
			code += '$'+sprite.get('name')+'.prototype.update = function(){\n'
			for(var c = 0; c < behaviour.get('steps').models.length; c++){
				var step = behaviour.get('steps').models[c];
				for(var d = 0; d < behaviour.get('variables').models.length; d++){
					var variable = behaviour.get('variables').models[d];
					var initialvalue = variable.get('value');
					var value = {number:initialvalue,string:'"'+initialvalue+'"'}[variable.get('type')]
					code += 'var $'+behaviour.get('name')+'_'+variable.get('name')+' = '+value;
				}
				for(var d = 0; d < step.get('args').length; d++){
					var arg = step.get('args')[d];
					var value = step.get(arg);
					if(value.constructor == ge.variable){
						value = '$'+behaviour.get('name')+'_'+value.get('name');
					}
					arg = (arg=='sx'?'width':arg)
					arg = (arg=='sy'?'height':arg)
					code += 'this.'+arg+' += '+value;
				}
			}
			code += '};\n\n'
		}
	}
	return code;
}*/