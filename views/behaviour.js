(function(){
	ge.behaviour = new ge.model({
		name:'untitled',
	})

	function addbehaviour(){
		vex.dialog.prompt({
			message: 'What do you wish to name this behaviour?',
			placeholder: 'Behaviour name',
			callback: function(value) {
				console.log('addbehaviour')
				ge.currentSprite.get('behaviours').models.push(new ge.behaviour({
					name:value,
					steps:new ge.collection(ge.step, []),
					variables:new ge.collection(ge.variable, []),
					events:new ge.collection(ge.event, [])
				}))
				behaviourchannel.update();
			}
		});
	}

	var backbtn,button,ul,svgcontainer,ul2;
	ge.view.get('behaviour').set('el', 
		crel('div', {'id':'container','class':'behaviour'}, 
			crel('div',{'id':'sidebar'},
				backbtn = crel('div',{'class':'btn'},'<'),
				crel('h2','Attributes'),
				ul2 = crel('ul',{'id':'varlist','data-channel':'varlist:var'},
					crel('li',ge.vartemproot.cloneNode(true),' : ',crel('span',{'data-channel':'var.el','class':'value'}))
				),
				spritevariablebutton = crel('div',{class:'btn'},'+',
					varselect.cloneNode(true)
				),
				crel('h2','Behaviours'),
				ul = crel('ul',{'id':'list','data-channel':'behaviourlist:behaviour'},
					crel('li',{'data-channel':'behaviour.name','onclick':'this.anim.stop(); this.blur(); ge.currentBehaviour = this.model; ge.view.set("step")','onmouseover':'this.anim = new animation(this.model)','onmouseout':'this.anim.stop()'})
				),
				button = crel('div',{class:'btn'},'+')
			),
			crel('div',{'id':'svg-container'},
				svgcontainer = crel('div')
			)
		)
	)

	var behaviourchannel = new ge.channel('behaviourlist',new ge.collection(ge.behaviour,[]))

	ge.view.get('behaviour').set('init', function(){
		console.log('BEHAVIOUR INIT')

		resizecenter = true;

		ge.svg.resize();

		behaviourchannel.changemodel(ge.currentSprite.get('behaviours'));
		ge.varchannel.changemodel(ge.currentSprite.get('variables'));

		button.onclick = addbehaviour;
		backbtn.onclick = back;

		behaviourchannel.update();

		svgcontainer.innerHTML = '';
		svgcontainer.appendChild( ge.svg.node );
		ge.svg.clear();

		var camera = ge.svg.rect(-ge.gamesize.width/2,-ge.gamesize.height/2,ge.gamesize.width,ge.gamesize.height);
		camera.attr({
			stroke: "#bbb",
			strokeWidth: 2,
			fill: "none"
		})

		ge.svg.resize();
	})
})()