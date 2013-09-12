function addEntry()
{
	var canvas = document.getElementById("rtcanvas");
	var url = canvas.toDataURL('image/jpg');
	//console.log(url);
	bShare.addEntry({
		summary:"I have my own comic!" ,
		pic : url
	});
}
