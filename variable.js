(function(){
	ge.variable = new ge.model({
		name:'zork',
		type:'number',
		value:666,
	})

	ge.vartemproot = crel('span',{'data-channel':'var.name','class':'variable root','onmousedown':'vardrag.mousedown(this)'});
	ge.vartemp = crel('span',{'data-channel':'var.name','class':'variable','onmousedown':'vardrag.mousedown(this)'});

	ge.varchannel = new ge.channel('varlist',new ge.collection(ge.variable,[]))

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