function merge(obj1, obj2) { //SUPER COMPLEX MERGE FUNCTION TO MERGE OBJECTS
	for (var p in obj2) {
		try {
			// Property in destination object set; update its value.
			if ( obj2[p].constructor==Object ) {
				obj1[p] = merge(obj1[p], obj2[p]);
			} else {
				obj1[p] = obj2[p];
			}
		} catch(e) {
			// Property in destination object not set; create it and set its value.
			obj1[p] = obj2[p];
		}
	}
	return obj1;
}


(function(){
	var attrname = 'data-channel';
	function isNode(o){
		return (
			typeof Node === "object" ? o instanceof Node : 
			o && typeof o === "object" && typeof o.nodeType === "number" && typeof o.nodeName==="string"
		);
	}
	window.app = function(){
		this.channels = {};
		var channels = this.channels;

		this.model = function(data){
			var fn = function(options){
				this.attr = {};
				merge(this.attr,this.defaults);
				merge(this.attr,options);
			}
			fn.prototype.defaults = data || {};
			fn.prototype.model = fn;
			fn.prototype.channels = [];
			fn.prototype.get = function(item){	return this.attr[item] }
			fn.prototype.set = function(item, newitem){
				var r = (this.attr[item] = newitem);
				this.channels.forEach(function(channel){
					channel.update();
				})
				return r;
			}
			return fn;
		}

		this.collection = function(model, array){
			this.model = model;
			this.models = [];
			var collection = this;
			this.channels = [];
			array.forEach(function(data){
				collection.models.push(new model(data))
			})
		}
		var collection = this.collection;

		this.channel = function(name,model,options){
			this.el = document;
			merge(this,merge({},options || {}))
			this.name = name;

			this.changemodel(model);

			channels[this.name] = this;

			this.update();
		}

		this.channel.prototype.changemodel = function(model){
			if(this.model != undefined){
				this.model.channels.splice(this.model.channels.indexOf(this),1);
			}
			this.model = model;
			this.model.channels.push(this);

			this.forloop = false;
			if(model.constructor == collection){
				this.forloop = true;
			}

			this.update();
		}

		this.channel.prototype.remove = function(){
			this.model.channels.splice(this.model.channels.indexOf(this),1);
			delete this; //JUST CAUSE
		}

		this.channel.prototype.update = function(){ //THIS CODE IS SO GROSS... FIX IT PLEASE SO I CAN STOP LOOKING AT THIS MISERABLE DISGUSTING AND HARD TO READ CODE
			var list = this.el.querySelectorAll('['+attrname+'^='+this.name+']');
			for(var i = 0; i < list.length; i++){
				var s = list[i].getAttribute(attrname).split(':');

				var ba = s[0].split('.')
				ba.shift();
				ba = ba.join('.')

				var v,c;
				

				if(list[i] && this.forloop){
					if(!list[i].hasAttribute('data-forloop')){
						list[i].setAttribute('data-forloop',list[i].innerHTML)
					}
					list[i].innerHTML = '';
					for(var ohno = 0; ohno < this.model.models.length; ohno++){
						var parser = new DOMParser();
						var html = parser.parseFromString(list[i].getAttribute('data-forloop'),'text/html')
						var channelpositive = new this.constructor(s[1],this.model.models[ohno],{el:html})
						var body = html.querySelector('body');
						var superlist = body.querySelectorAll('*');
						for(var bleh = 0; bleh < superlist.length; bleh++){
							superlist[bleh].model = this.model.models[ohno]
						}
						for(var erwhat = 0; erwhat < body.children.length; erwhat+=0){
							list[i].appendChild(body.children[erwhat])
						}
					}
					return false;
				}else{
					v = new Function('channel','return (channel).model.attr.'+ba);
					c = new Function('element','value','(element).'+s[1]+' = value');
				}
				if(s.length == 1/* || s[1] == 'inner' || s[1] == 'innerHTML' || s[1] == 'html' || s[1] == 'HTML'*/){
					var value = v(this);
					list[i].innerHTML = '';
					if(isNode(value)){
						list[i].appendChild(value)
					}else{
						list[i].innerHTML = value;
					}
				}else{
					var value = v(this);
					if(list[i].hasAttribute(s[1])){
						list[i].setAttribute(s[1],value)
					}else{
						c(list[i],value)
					}
				}
			}
		}


		function upch(attr){
			var channel = attr.split(':')
			if(channels[channel[0]]){
				channels[channel[0]].update();
			}
		}

		var cwatch = [];

		this.observer = new MutationObserver(function(mutations) {
			mutations.forEach(function(mutation) {
				if(mutation.type == 'attributes'){
					var value = mutation.target.getAttribute(mutation.attributeName);
					var index = cwatch.indexOf(mutation.target);
					if(value == null){
						if(index != -1){
							cwatch.splice(index,1)
						}
					}else{
						if(index == -1){
							cwatch.push(mutation.target)
						}
					}
				}else if(mutation.type == 'childList'){
					for(var i = 0; i < mutation.addedNodes.length; i++){
						var target = mutation.addedNodes[i];
						if(typeof target.hasAttribute == 'function' && target.hasAttribute(attrname)){
							cwatch.push(target);
						}
					}
					for(var i = 0; i < mutation.removedNodes.length; i++){
						var target = mutation.removedNodes[i];
						var index = cwatch.indexOf(target);
						if(index != -1){
							cwatch.splice(index,1);
						}
					}
				}
			});
		});

		this.observer.observe(document,{
			attributes:true,
			attributeFilter:[attrname],
			childList:true,
			subtree:true
		})
	}
})()