(function(){
	ge.scenemodel = new ge.model({
		name:'untitled',
		sprites:[],
	})

	ge.scene = new ge.scenemodel();

	ge.sprite = new ge.model({
		name:'untitled',
		width:50,
		height:50,
	})

	ge.sprites = new ge.collection(ge.sprite, [])

	function addsprite(){
		vex.dialog.prompt({
			message: 'What do you wish to name this sprite?',
			placeholder: 'Sprite name',
			callback: function(value) {
				console.log('addsprite')
				ge.sprites.models.push(new ge.sprite({
					name:value,
					behaviours:new ge.collection(ge.behaviour, []),
					variables:new ge.collection(ge.variable, [])
				}))
				ge.spritechannel.update();
			}
		});
	}

	var button,ul,svgcontainer;
	ge.view.get('scene').set('el', 
		crel('div', {'id':'container'}, 
			crel('div',{'id':'sidebar'},
				crel('div',{'class':'btn disabled'},'<'),
				crel('h2','Sprites'),
				ul = crel('ul',{'id':'list','data-channel':'spritelist:sprite'},
					crel('li',{'data-channel':'sprite.name','onclick':'ge.currentSprite = this.model; ge.view.set("behaviour")','onmousedown':'spritedrag.mousedown(this)'})
				),
				button = crel('div',{class:'btn'},'+')
			),
			crel('div',{'id':'svg-container'},
				svgcontainer = crel('div')
			)
		)
	)

	ge.spritechannel = new ge.channel('spritelist',ge.sprites)

	ge.view.get('scene').set('init', function(){
		console.log('SCENE INIT')

		button.onclick = addsprite;

		ge.spritechannel.update();

		svgcontainer.innerHTML = '';
		svgcontainer.appendChild( ge.svg.node );

		renderscene();
	})

	renderscene = function(){
		ge.svg.clear();
		resizecenter = true;
		ge.svg.resize();
		initBBox();
		var sprites = ge.scene.get('sprites');

		var camera = ge.svg.rect(-ge.gamesize.width/2,-ge.gamesize.height/2,ge.gamesize.width,ge.gamesize.height);
		camera.attr({
			stroke: "#bbb",
			strokeWidth: 2,
			fill: "none"
		})

		for(var i = 0; i < sprites.length; i++){
			var model = sprites[i].model;
			var width = model.get('width');
			var height = model.get('height');
			var x = sprites[i].x-ge.svg.node.parentElement.offsetLeft;
			var y = sprites[i].y-ge.svg.node.parentElement.offsetTop;

			var sprite = ge.svg.rect(x, y, width , height);

			sprite.attr({
			    fill: "#bada55",
			    stroke: "#000",
			    strokeWidth: 5,
			    cursor: "move",
			});
			sprite.drag(drag.mousemove,drag.mousedown,drag.mouseup)
			sprite.sceneobject = sprites[i]
		}
	}

	spritedrag = {};
	spritedrag.mousedown = function(el){
		console.log('mousedown')

		spritedrag.model = el.model;

		spritedrag.width = el.model.get('width')+50;
		spritedrag.height = el.model.get('height')+50;

		spritedrag.svg = Snap();

		console.log(spritedrag.svg)
		spritedrag.svg.node.classList.add('tempsvg');
		spritedrag.svg.node.setAttribute('width',spritedrag.width)
		spritedrag.svg.node.setAttribute('height',spritedrag.height)
		spritedrag.svg.node.setAttribute('viewBox','-'+spritedrag.width/2+' -'+spritedrag.height/2+' '+spritedrag.width+' '+spritedrag.height)


		spritedrag.sprite = spritedrag.svg.rect(-(spritedrag.width-50)/2, -(spritedrag.width-50)/2, spritedrag.width-50 , spritedrag.height-50);
		// By default its black, lets change its attributes
		spritedrag.sprite.attr({
		    fill: "#bada55",
		    stroke: "#000",
		    strokeWidth: 5,
		    cursor: "move",
		});
		
		spritedrag.dragging = true;

		document.body.classList.add('noselect')
	}
	spritedrag.mousemove = function(e){
		if(spritedrag.dragging == true){
			spritedrag.svg.node.style.left = (e.clientX-spritedrag.width/2)+'px';
			spritedrag.svg.node.style.top = (e.clientY-spritedrag.height/2)+'px';
		}
	}
	spritedrag.mouseup = function(e){
		if(spritedrag.dragging && (e.toElement == ge.svg.node || ge.svg.node.contains(e.toElement))){
			ge.scene.get('sprites').push({
				model:spritedrag.model,
				x: e.clientX-viewboxOffsetLeft-Number(spritedrag.sprite.attr('width'))/2,
				y: e.clientY-viewboxOffsetTop-Number(spritedrag.sprite.attr('height'))/2,
				sx: 0,
				sy: 0,
				rotation: 0
			})
			renderscene();
		}
		if(spritedrag.dragging){
			spritedrag.svg.remove();
		}
		spritedrag.dragging = false;
	}
	window.addEventListener('mousemove',spritedrag.mousemove);
	window.addEventListener('mouseup',spritedrag.mouseup);
})()

