(function(){
	ge.step = new ge.model({
		steptexttemp: '',
		steptext: '',
		args:[],
		prepos:'by', //preposition (by/to)

		x:0,
		y:0,
		rotation:0,
		sx:0, //scale X
		sy:0, //scale Y
		/*
		tox:0,
		toy:0,
		torotation:0,
		tosx:0,
		tosy:0,*/
	})

	var backbtn,ul,svgcontainer,select,input,button,sprite,ul2,eventbtn;
	ge.view.get('step').set('el', 
		crel('div', {'id':'container','class':'stepview'}, 
			crel('div',{'id':'sidebar'},
				backbtn = crel('button',{'class':'btn'},'<'),
				crel('h2','Variables'),
				ul2 = crel('ul',{'id':'varlist','data-channel':'varlist:var'},
					crel('li',ge.vartemproot,' : ',crel('span',{'data-channel':'var.el','class':'value'}))
				),
				button = crel('div',{class:'btn'},'+',
					crel('select',
						crel('option',{disabled:'',selected:'',hidden:'',value:'+'},''),
						crel('option','number'),
						crel('option','string')
					)
				),
				crel('h2','Steps'),
				ul = crel('ul',{'id':'list','data-channel':'steplist:step'},
					crel('li',{'data-channel':'step.steptext','onclick':'ge.currentStep = this.model; ge.view.get("step").get("update")()'})
				)
			),
			crel('div',{'id':'svg-container'},
				svgcontainer = crel('div',
					crel('div',{'id':'steptext'}, ''),
					crel('div',{'id':'events'}, 'events : ',crel('span',{'data-channel':'eventlist:event'},crel('span',{'data-channel':'event.inner','class':'event'})),eventbtn = crel('div',{'class':'btn'},'+',crel('select',
						crel('option',{disabled:'',selected:'',hidden:'',value:'+'},''),
						crel('option','keypress'),
						crel('option','collision')
					)))
				)
			)
		)
	)

	eventbtn.children[0].addEventListener('change',function(e){
		var type = e.target.value;
		var newevent = new ge.event({type:type});
		newevent.set('inner',{
			keypress:'When <select data-channel="keyboardkeys:key" onchange="this.model.set(\'data\',this.value)" value="'+ge.currentSprite.get('name')+'"><option data-channel="key.name"></option></select> key is pressed',
			collision:'On collision with <select data-channel="spritelist:sprite" onchange="for(var i in ge.sprites.models){if(ge.sprites.models[i].get(\'name\') == this.value){this.model.set(\'data\',ge.sprites.models[i]);break;}}"><option data-channel="sprite.name"></option></select>'
		}[type])
		newevent.set('data',{
			keypress:'left',
			collision:ge.currentSprite
		}[type])
		ge.currentBehaviour.get('events').models.push(newevent);
		ge.eventchannel.update();
		ge.spritechannel.update();
		ge.keyschannel.update();
		e.target.children[0].selected = true;
	})

	button.children[0].addEventListener('change',function(e){
		var type = e.target.value;
		vex.dialog.prompt({
			message: 'What do you wish to name this variable?',
			placeholder: 'Variable name',
			callback: function(value) {
				console.log('addvariable')
				var variable = new ge.variable({
					name:value,
					type:type,
					value:{number:0,string:''}[type],
					el:{ number : crel('input',{'type':'number','data-channel':'var.value:value'}), string : crel('input',{'type':'text','data-channel':'var.value:value'}) }[type]
				})
				variable.set('channel',new ge.channel('variable-'+variable.get('name'), variable))
				variable.get('el').addEventListener('change',function(e){
					var value = {number:Number(e.target.value),string:e.target.value}[e.target.model.get('type')]
					e.target.model.set('value',value)
					clearTimeout(e.target.timeout)
					e.target.timeout = setTimeout(ge.view.get('step').get('update'),500);
				})
				ge.currentBehaviour.get('variables').models.push(variable)
				ge.varchannel.update();
			}
		});
		e.target.children[0].selected = true;
	})

	ge.view.get('step').set('steptext-s',
		select = crel('select',
			crel('option','by'),
			crel('option','to')
		)
	)
	ge.view.get('step').set('steptext-e',
		input = crel('input',{'type':'number','value':0})
	)

	ge.stepchannel = new ge.channel('steplist',new ge.collection(ge.step,[]))

	ge.view.get('step').set('init', function(){
		console.log('STEP INIT')

		ge.currentStep = ge.currentBehaviour.get('steps').models[ge.currentBehaviour.get('steps').models.length-1]

		//stepchannel.model = ge.currentSprite.behaviours;
		ge.stepchannel.changemodel(ge.currentBehaviour.get('steps'))
		ge.varchannel.changemodel(ge.currentBehaviour.get('variables'))
		ge.eventchannel.changemodel(ge.currentBehaviour.get('events'))
		ge.keyschannel.update();
		ge.spritechannel.update();
		var events = document.querySelectorAll('.event')
		for(var i = 0; i < events.length; i++){
			var sel = events[i].querySelector('select');
			console.log(sel.model)
			if(sel.model.get('type') == 'keypress'){
				sel.value = sel.model.get('data');
			}else if(sel.model.get('type') == 'collision'){
				sel.value = sel.model.get('data').get('name');
			}
		}

		backbtn.onclick = back;

		if(svgcontainer.children[1] == ge.svg.node){svgcontainer.removeChild( ge.svg.node )}
		svgcontainer.appendChild( ge.svg.node );
		ge.svg.clear();

		resizecenter = true;

		ge.svg.resize();

		var camera = ge.svg.rect(-ge.gamesize.width/2,-ge.gamesize.height/2,ge.gamesize.width,ge.gamesize.height);
		camera.attr({
			stroke: "#bbb",
			strokeWidth: 2,
			fill: "none"
		})

		initBBox();

		sprite = ge.svg.rect(-ge.currentSprite.get('width')/2, -ge.currentSprite.get('height')/2, ge.currentSprite.get('width') , ge.currentSprite.get('height'));
		// By default its black, lets change its attributes
		sprite.attr({
		    fill: "#bada55",
		    stroke: "#000",
		    strokeWidth: 5,
		    cursor:"move"
		});
		showBBox(sprite);
		sprite.drag(drag.mousemove, drag.mousedown, drag.mouseup)

		ge.view.get('step').get('update')();
	})

	ge.view.get('step').set('update', function(){
		var steptext = ge.currentStep==undefined?'':ge.currentStep.get('steptexttemp');
		var args = ge.currentStep==undefined?[]:ge.currentStep.get('args').slice(0);

		var el = document.querySelector('#steptext');
		steptext = steptext.replace(/\%s/g,'<span class="steptext-s"></span>');
		steptext = steptext.replace(/\%e/g,'<span class="steptext-e"></span>');
		el.innerHTML = steptext;
		var stepsteptext = '';
		for(var i = 0; i < el.childNodes.length; i++){
			var node = el.childNodes[i];
			if(node.classList){
				var pre = (ge.currentStep.get('prepos')=='to'?'to':'')
				if(node.classList.contains('steptext-s')){
					var select = ge.view.get('step').get('steptext-s').cloneNode(true);
					select.addEventListener('change',function(e){
						ge.currentStep.set('prepos',e.target.value)
						ge.view.get('step').get('update')();
					})
					node.appendChild(select)
					select.value = ge.currentStep.get('prepos')
					stepsteptext += ge.currentStep.get('prepos')
				}else if(node.classList.contains('steptext-e')){
					if(!isNaN(Number(ge.currentStep.get(args[0])))){
						console.log('NOT VARIABLE')
						var value = Number(ge.currentStep.get(args[0]));
						var input = ge.view.get('step').get('steptext-e').cloneNode(true);

						node.setAttribute('data-var',args[0])

						input.addEventListener('change',function(e){
							ge.currentStep.set(e.target.parentElement.getAttribute('data-var'),Number(e.target.value))
							clearTimeout(e.target.timeout)
							e.target.timeout = setTimeout(ge.view.get('step').get('update'),500);
						})

						node.appendChild(input);
						input.value = value;
					}else if(ge.currentStep.get(args[0]).constructor == ge.variable){
						console.log('VARIABLE')
						var value = ge.currentStep.get(args[0]).get('value');
						var model = ge.currentStep.get(args[0]);
						var variable = ge.vartemp.cloneNode(true);
						variable.model = model;
						variable.setAttribute('data-channel','variable-'+model.get('name')+'.name')
						node.appendChild(variable);

						model.get('channel').update();
					}
					stepsteptext += value;
					args.splice(0,1)
				}

			}else{
				stepsteptext += node.textContent;
			}
		}
		if(ge.currentStep != undefined){
			ge.currentStep.set('steptext',stepsteptext)
		}
		ge.stepchannel.update();
		var selected = document.querySelector('#list').children[ge.currentBehaviour.get('steps').models.indexOf(ge.currentStep)];
		if(selected != undefined){
			selected.classList.add('selected');
		}

		if(!sprite.dragging){
			console.log('changed');
			var steps = ge.currentBehaviour.get('steps').models;
			sprite.attr({
				x:-ge.currentSprite.get('width')/2,
				y:-ge.currentSprite.get('height')/2,
				width:ge.currentSprite.get('width'),
				height:ge.currentSprite.get('height'),
				transform:''
			})
			for(var i = 0; i < steps.indexOf(ge.currentStep)+1; i++){
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
		}
		showBBox(sprite);
	})
})()