(function(){
	ge.variable = new ge.model({
		name:'zork',
		type:'number',
		value:666,
	})

	varselect = crel('select',
						crel('option',{disabled:'',selected:'',hidden:'',value:'+'},''),
						crel('option','number'),
						crel('option','string')
					);

	ge.vartemproot = crel('span',{'data-channel':'var.name','class':'variable root','onmousedown':'vardrag.mousedown(this)','ondblclick':'addvartosteps(this)'});
	ge.vartemp = crel('span',{'data-channel':'var.name','class':'variable','onmousedown':'vardrag.mousedown(this)'});

	ge.varchannel = new ge.channel('varlist',new ge.collection(ge.variable,[]))

	addvartosteps = function(variableEl){
		var variable = variableEl.model;
		var thenewstep = new ge.step({
			steptexttemp:'Change '+variable.get('name')+' %s %e',
			variable:variable,
			args:['variable'],
			varchange:0,

		});
		ge.currentBehaviour.get('steps').models.splice(ge.currentBehaviour.get('steps').models.indexOf(ge.currentStep)+1,0,thenewstep)
		ge.currentStep = thenewstep;
		ge.view.get('step').get('update')();
	}

	vardrag = {

	};
	vardrag.mousedown = function(el){
		console.log('mousedown')

		if(el.classList.contains('root')){
			vardrag.el = el.cloneNode(true);
			vardrag.el.model = el.model;
			vardrag.el.classList.remove('root');
		}else{
			vardrag.el = el;
			console.log(el.parentElement.getAttribute('data-var'));
			ge.currentStep.set(vardrag.el.parentElement.getAttribute('data-var'),0)
			ge.view.get('step').get('update')();
		}
		
		document.body.appendChild(vardrag.el);
		vardrag.dragging = true;

		document.body.classList.add('noselect')
		document.body.classList.add('dragging-'+vardrag.el.model.get('type'))
	}
	vardrag.mousemove = function(e){
		if(vardrag.dragging == true){
			vardrag.el.style.left = (e.clientX)+'px';
			vardrag.el.style.top = (e.clientY)+'px';
		}
	}
	vardrag.mouseup = function(e){
		if(vardrag.dragging == true){
			console.log('mouseup')
			var toel = e.toElement.parentElement;
			document.body.classList.remove('noselect')
			document.body.classList.remove('dragging-'+vardrag.el.model.get('type'))
			if(toel.classList.contains('steptext-e')){
				ge.currentStep.set(toel.getAttribute('data-var'),vardrag.el.model)
				ge.view.get('step').get('update')()
				//toel.replaceChild(vardrag.el,e.toElement)
				document.body.removeChild(vardrag.el);
			}else{
				document.body.removeChild(vardrag.el);
			}
		}
		vardrag.dragging = false;
	}

	window.addEventListener('mousemove',vardrag.mousemove);
	window.addEventListener('mouseup',vardrag.mouseup);
})()