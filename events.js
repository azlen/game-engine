(function(){
	ge.event = new ge.model({
		type:'',
		inner:'',
		data:undefined,
	})
	ge.eventchannel = new ge.channel('eventlist',new ge.collection(ge.event,[]))

	ge.keyschannel = new ge.channel('keyboardkeys',new ge.collection(new ge.model({}),[
		
	]))
	keys = {
		'left':37,
		'up':38,
		'right':39,
		'down':40,
		'0':48,
		'1':49,
		'2':50,
		'3':51,
		'4':52,
		'5':53,
		'6':54,
		'7':55,
		'8':56,
		'9':57,

		'a':65,
		'b':66,
		'c':67,
		'd':68,
		'e':69,
		'f':70,
		'g':71,
		'h':72,
		'i':73,
		'j':74,
		'k':75,
		'l':76,
		'm':77,
		'n':78,
		'o':79,
		'p':80,
		'q':81,
		'r':82,
		's':83,
		't':84,
		'u':85,
		'v':86,
		'w':87,
		'y':88,
		'z':89,
	}

	for(var i in keys){
		ge.keyschannel.model.models.push(new (new ge.model({}))({name:i,keyCode:keys[i]}))
	}
})()