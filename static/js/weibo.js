function addEntry()
{
	var canvas = document.getElementById("rtcanvas");
	var url = canvas.toDataURL('image/jpg');
	bShare.addEntry({
		summary:"I have my own comic!" ,
		pic : url
	});
}

function savePic()
{
	var canvas = document.getElementById("allCanvas");
	canvas.setAttribute('width',960);
	canvas.setAttribute('height',720);
	var ctx = canvas.getContext('2d');
	var type = 'png';
	for (var i = 0 ; i < 4 ; i++)
	{
		var comcanvas = document.getElementById("comcanvas"+i.toString());
		var img = new Image();
	   	img.setAttribute('src',comcanvas.toDataURL(type));
		if (i == 0) ctx.drawImage(img,0,0);
		if (i == 1) ctx.drawImage(img,480,0,480,360);
		if (i == 2) ctx.drawImage(img,0,360,480,360);
		if (i == 3) ctx.drawImage(img,480,360,480,360);
	}
	var imgData = canvas.toDataURL(type);
	var _fixType = function(type){
		type = type.toLowerCase().replace(/jpg/i,'jpeg');
		var r = type.match(/png|jpeg|bmp|gif/)[0];
		return 'image/'+r;
	};

	imgData = imgData.replace(_fixType(type),'image/octet-stream');

	var saveFile = function(data, filename){
		var save_link = document.createElementNS('http://www.w3.org/1999/xhtml', 'a');
		save_link.href = data;
		save_link.download = filename;

		var event = document.createEvent('MouseEvents');
		event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
		save_link.dispatchEvent(event);
	};

	// 下载后的文件名
	var filename = 'Animation' + (new Date()).getTime() + '.' + type;
	// download
	saveFile(imgData,filename);
}	
