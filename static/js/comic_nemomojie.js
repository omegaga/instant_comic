function CalculateGrayValue(rValue,gValue,bValue){
	return parseInt(rValue * 0.299 + gValue * 0.587 + bValue * 0.114);
}

function ProcessToGrayImage(canvas, new_canvas){
	var ctx = canvas.getContext('2d');
	//new_canvas.width = canvas.width;
	//new_canvas.height = canvas.height;
	//取得图像数据
	var canvasData = ctx.getImageData(0, 0, canvas.width, canvas.height);
	//这个循环是取得图像的每一个点，在计算灰度后将灰度设置给原图像
	for (var x = 0; x < canvasData.width; x++) {
		for (var y = 0; y < canvasData.height; y++) {
			// Index of the pixel in the array
			var idx = (x + y * canvas.width) * 4;
			// The RGB values
			var r = canvasData.data[idx + 0];
			var g = canvasData.data[idx + 1];
			var b = canvasData.data[idx + 2];
			//更新图像数据
			var gray = CalculateGrayValue(r , g , b);
			canvasData.data[idx + 0] = gray;
			canvasData.data[idx + 1] = gray;
			canvasData.data[idx + 2] = gray;
		}
	}
	ctx.putImageData(canvasData, 0, 0);
}

function OTSUAlgorithm(canvas, new_canvas, option) {
	var flag = false;
	if (option != undefined)
		flag = option.overlay;
	var m_pFstdHistogram = new Array();//表示灰度值的分布点概率
	var m_pFGrayAccu = new Array();//其中每一个值等于m_pFstdHistogram中从0到当前下标值的和
	var m_pFGrayAve = new Array();//其中每一值等于m_pFstdHistogram中从0到当前指定下标值*对应的下标之和
	var m_pAverage=0;//值为m_pFstdHistogram【256】中每一点的分布概率*当前下标之和
	var m_pHistogram = new Array();//灰度直方图
	var i,j;
	var temp=0,fMax=0;//定义一个临时变量和一个最大类间方差的值
	var nThresh = 0;//最优阀值
	//获取灰度图像的信息
	var imageInfo = GetGrayImageInfo(canvas);
	var newImageInfo = GetGrayImageInfo(new_canvas);
	if(imageInfo == null){
		window.alert("图像还没有转化为灰度图像！");
		return;
	}
	//初始化各项参数
	for(i=0; i<256; i++){
		m_pFstdHistogram[i] = 0;
		m_pFGrayAccu[i] = 0;
		m_pFGrayAve[i] = 0;
		m_pHistogram[i] = 0;
	}
	//获取图像信息
	var canvasData = imageInfo[0];
	var newCanvasData = newImageInfo[0];
	//获取图像的像素
	var pixels = canvasData.data;
	//下面统计图像的灰度分布信息
	for(i=0; i<pixels.length; i+=4){
		//获取r的像素值，因为灰度图像，r=g=b，所以取第一个即可
		var r = pixels[i];
		m_pHistogram[r]++;
	}
	//下面计算每一个灰度点在图像中出现的概率
	var size = canvasData.width * canvasData.height;
	for(i=0; i<256; i++){
		m_pFstdHistogram[i] = m_pHistogram[i] / size;
	}
	//下面开始计算m_pFGrayAccu和m_pFGrayAve和m_pAverage的值
	for(i=0; i<256; i++){
		for(j=0; j<=i; j++){
			//计算m_pFGaryAccu[256]
			m_pFGrayAccu[i] += m_pFstdHistogram[j];
			//计算m_pFGrayAve[256]
			m_pFGrayAve[i] += j * m_pFstdHistogram[j];
		}
		//计算平均值
		m_pAverage += i * m_pFstdHistogram[i];
	}
	//下面开始就算OSTU的值，从0-255个值中分别计算ostu并寻找出最大值作为分割阀值
	for (i = 0 ; i < 256 ; i++){
		temp = (m_pAverage * m_pFGrayAccu[i] - m_pFGrayAve[i]) 
			* (m_pAverage * m_pFGrayAccu[i] - m_pFGrayAve[i]) 
			/ (m_pFGrayAccu[i] * (1 - m_pFGrayAccu[i]));
		if (temp > fMax)
		{
			fMax = temp;
			nThresh = i;
		}
	}
	//下面执行二值化过程 
	for(i=0; i<canvasData.width; i++){
		for(j=0; j<canvasData.height; j++){
			//取得每一点的位置
			var ids = (i + j*canvasData.width)*4;
			//取得像素的R分量的值
			var r = canvasData.data[ids];
			//与阀值进行比较，如果小于阀值，那么将改点置为0，否则置为255
			var gray = r>nThresh?255:0;
			if (flag && newCanvasData.data[ids+0] == 0)
				gray = 0;
			canvasData.data[ids+0] = gray;
			canvasData.data[ids+1] = gray;
			canvasData.data[ids+2] = gray;
		}
	}
	//显示二值化图像
	var newImage = new_canvas.getContext('2d');
	newImage.putImageData(canvasData,0,0);
}

//获取图像的灰度图像的信息
function GetGrayImageInfo(canvas){
	var ctx = canvas.getContext('2d');
	var canvasData = ctx.getImageData(0, 0, canvas.width, canvas.height);
	if(canvasData.data.length==0){
		return null;
	}
	return [canvasData,ctx];
}
//下面对灰度图像进行处理，将目标信息分割出来
function DividedTarget(imageInfo) {
	//读取二值化图像信息
	imageInfo = document.getElementById('myCanvasThreshold').getContext('2d');
	if(imageInfo == null){
		window.alert("没有发现二值化图像信息！");
		return;
	}
	//取得上下文
	var ctx = imageInfo.getContext('2d');
	//获取图像数据
	var canvasData = imageInfo.getImageData(0, 0, ctx.width, ctx.height);
	var newVanvasData = canvasData;
	//取得图像的宽和高
	var width = canvasData.width;
	var height = canvasData.height;
	//算法开始
	var cursor = 2;
	for(var x=0; x<width; x++){
		for(var y=0; y<height; y++){
			//取得每一点的位置
			var ids = (x + y*canvasData.width)*4;
			//取得像素的R分量的值
			var r = canvasData.data[ids];
			//如果是目标点
			if(r==0){

			}
		}
	}
}

function newAlgorithm(canvas, new_canvas, option) {
	var flag = false;
	if (option != undefined)
		flag = option.overlay;
	var i,j;
	//获取灰度图像的信息
	var imageInfo = GetGrayImageInfo(canvas);
	var newImageInfo = GetGrayImageInfo(new_canvas);
	var canvasData = imageInfo[0];
	var newCanvasData = newImageInfo[0];
	var sum  = new Array(); //前缀和
	if(imageInfo == null){
		window.alert("图像还没有转化为灰度图像！");
		return;
	}
	//初始化
	var radius = parseInt(canvasData.width / 16);
	var t = 15;

	sum.push(new Array());
	for (j = 0 ; j <= canvasData.width ; j++)
		sum[0].push(0);
	for (i = 0 ; i < canvasData.height ; i++)
	{
		sum.push(new Array());
		sum[i+1].push(0);
		for (j = 0 ; j < canvasData.width ; j++)
		{
			var ids = (j + i * canvasData.width)*4;
			sum[i+1].push(canvasData.data[ids]);
		}
	}

	for (i = 1 ; i <= canvasData.height ; i++)
		for (j = 1 ; j <= canvasData.width ; j++)
			sum[i][j] = sum[i-1][j] + sum[i][j-1] - sum[i-1][j-1] + sum[i][j];

	//下面执行二值化过程 
	for(i=0; i<canvasData.height; i++)
	{
		for (j = 0 ; j < canvasData.width ; j ++)
		{
			//取得每一点的位置
			var ids = (j + i*canvasData.width)*4;
			//取得像素的R分量的值
			var r = canvasData.data[ids];
			var x1 = i + 1 - radius , x2 = i + 1 + radius;
			var y1 = j + 1 - radius , y2 = j + 1 + radius;
			if (x1 < 1) x1 = 1;
			if (y1 < 1) y1 = 1;
			if (x2 > canvasData.height) x2 = canvasData.height;
			if (y2 > canvasData.width) y2 = canvasData.width;

			var nThresh = sum[x2][y2] - sum[x1-1][y2] - sum[x2][y1-1] + sum[x1-1][y1-1];
			var count = (x2 - x1 + 1) * (y2 - y1 + 1);

			var gray;
			if (canvasData.data[ids] * count * 100 < nThresh * (100 - t))
				gray = 0;
			else
				gray = 255;

			if (flag && newCanvasData.data[ids+0] == 0)
				gray = 0;
			canvasData.data[ids+0] = gray;
			canvasData.data[ids+1] = gray;
			canvasData.data[ids+2] = gray;
		}
	}
	//显示二值化图像
	var newImage = new_canvas.getContext('2d');
	newImage.putImageData(canvasData,0,0);
}
