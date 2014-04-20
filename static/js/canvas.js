/*canvas document*/
var width,height,canvas,context;


function canvas(){
	
	setSize(true);
	
	var blockTimer=self.setInterval("addBlock()",150);
	
	window.onresize = function(event) {
		setSize(false);  
	}
	
	
}

function setSize(firstRun){
	var resizeTimer;
	
	canvas = document.getElementById("canvas");
	context = canvas.getContext('2d');
	
	if(!firstRun){
		context.clearRect ( 0 , 0 , canvas.width , canvas.height);//clear canvas
		canvas.width = canvas.width;//clear canvas
	}
	
	width = document.body.clientWidth;
	height = getDocHeight();
	
	if(window.devicePixelRatio > 1){
		
		canvas.style.width = width + 'px';
		canvas.style.height = height + 'px';
		
		height *= 2;
		width *= 2;
	
		canvas.height = height;
		canvas.width = width;
		
	}else{
		canvas.height = height;
		canvas.width = width;
	}
	
	if(firstRun){
		addManyBlocks();
	}else{
		clearTimeout(resizeTimer);
		resizeTimer=self.setTimeout("addManyBlocks()",50);
	}
}

function addManyBlocks(){
	for(var i = 0;i <500;i++){
		addBlock();
	}
}

function addBlock(){
	
	var boxWidth,boxHeight;
	
	if(document.body.clientWidth < 500){
		boxWidth = 20;
		boxHeight = 40;
	}else{
		boxWidth = 40;
		boxHeight = 80;
	}
	
	if(window.devicePixelRatio > 1){
		boxWidth *= 2;
		boxHeight *= 2;
	}
	
	var x = Math.floor(Math.random()*width);
	var y = Math.floor(Math.random()*height);
	
	x = x / boxWidth;
	x = Math.round(x);
	x = x * boxWidth;
	
	y = y / boxWidth;
	y = Math.round(y);
	y = y * boxWidth;
	
	var horizontal = Math.floor(Math.random()*2);
	var color = Math.floor(Math.random()*3);
	
	if(color == 1){
		context.fillStyle = "rgba(71,79,82,0.7)";
	}else if(color == 2){
		context.fillStyle = "rgba(165,175,178,0.7)";
	}else{
		context.fillStyle = "rgba(107,121,126,1)";
	}
	
	if(horizontal == 1){
		context.fillRect(x,y,boxWidth,boxHeight);
	}else{
		context.fillRect(x,y,boxHeight,boxWidth);
	}
}

function getDocHeight() {
    var D = document;
    //if the browser doesnt like it, it will return 0.
    //Thats why we use .max
    return Math.max(
        Math.max(D.body.scrollHeight, D.documentElement.scrollHeight),
        Math.max(D.body.offsetHeight, D.documentElement.offsetHeight),
        Math.max(D.body.clientHeight, D.documentElement.clientHeight)
    );
}