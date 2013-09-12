var max_height = 360 , max_width = 480;
var BIT;

function init()
{
  BIT = new Array();
  var i,j,k;
  for (k = 0 ; k < 4 ; k++)
  {
    BIT.push(new Array());
    for (i = 0 ; i <= max_height ; i++)
    {
      BIT[k].push(new Array());
      for (j = 0 ; j <= max_width ; j++)
	BIT[k][i].push(0);
    }
  }
}

function reinit(n)
{
  var i , j;
  for (i = 0 ; i <= max_height ; i++) {
    for (j = 0 ; j <= max_width ; j++) {
      var x = i + 1 , y = j + 1;
      BIT[n][x][y] = 0;
    }
  }

  var canvas = document.getElementById("comcanvas" + n.toString());
  var imageInfo = GetGrayImageInfo(canvas);
  var canvasData = imageInfo[0];

  for (i = 0 ; i < max_height ; i++)
    for (j = 0 ; j < max_width ; j++)
  {
    var ids = (j + i * canvasData.width)*4;
    var r = canvasData.data[ids];
    if (r == 255) r = 0;
    else r = 255;
    update(n, i, j, r);
  }
  console.log("Reinit");
}

function lowbit(t)
{
  return t & (-t);
}

function update(n,x,y,v)
{
  var i,j;
  for (i = x ; i <= max_height ; i += lowbit(i))
    for (j = y ; j <= max_width ; j += lowbit(j))
      BIT[n][i][j] += v;
}

function getsum(n,x,y)
{
  var ret = 0;
  var i,j;
  for (i = x ; i > 0 ; i -= lowbit(i))
    for (j = y ; j > 0 ; j -= lowbit(j))
      ret += BIT[n][i][j];
  return ret;
}

function isChinese(str)
{
  if(/.*[\u4e00-\u9fa5]+.*$/.test(str)) 
    return true; 
  return false; 
  } 	  

function drawOnCanvas2(n)
{
  var canvas = document.getElementById("comcanvas" + n.toString());
  var imageInfo = GetGrayImageInfo(canvas);
  var canvasData = imageInfo[0];
  var ctx = canvas.getContext("2d");
  var string = document.getElementById("words").value;
  ctx.font = 'italic 12pt Heiti';
  var cnt = 0;
  var i,j;
  for (i = 0 ; i < string.length ; i++)
  {
    if (isChinese(string[i])) cnt+=2;
      else cnt++;
    }

  var line;
    var flag = true;
    var start_height , start_width;
  var per_height = 15;
  var per_width = 50 / 6;
  
  var x3 , y3 , x4 , y4;
    for (line = 1 ; flag && line <= string.length; line++)
  {
    var total_height = parseInt(per_height * line) + 1;
    var per_line = parseInt(cnt / line) + 1;
    var total_width = parseInt(per_width * (per_line + 1)) + 1;
    for (i = 0 ; i < max_height && flag; i++)
      for (j = 0 ; j < max_width && flag; j++)
    {
      var x1 = i + 1 , y1 = j + 1;
      var x2 = x1 + total_height , y2 = y1 + total_width;
      if (x2 > max_height || y2 > max_width) continue;

      var tmp = getsum(n,x2,y2) - getsum(n,x1-1,y2) - getsum(n,x2,y1-1) + getsum(n,x1-1,y1-1);
      var count = (x2 - x1 + 1) * (y2 - y1 + 1);
      if (tmp < 255 * count * 1 / 100)
      {
	start_height = x2;
	start_width = y1;
	flag = false;
	x3 = x1 , y3 = y1;
	x4 = x2 , y4 = y2;
      }
    }
  }

  if (!flag)
  {
    var now = 0;
    console.log("Success! "+start_height.toString()+" "+start_width.toString());
    for (i = 0 ; i < string.length ; i++)
    {
      if (isChinese(string[i]) && now % per_line == per_line - 1) now++;
      var height = start_height + (parseInt(now / per_line)) * per_height;
      var width = start_width + (now % per_line) * per_width;
      ctx.fillText(string[i],width,height);
      if (isChinese(string[i]) == true) now += 2;
      else now++;
    }

    imageInfo = GetGrayImageInfo(canvas);
    canvasData = imageInfo[0];
    for (i = x3 ; i <= x4 ; i++)
      for (j = y3 ; j <= y4 ; j++)
    {
      var x = i , y = j ;
      var ids = (y + x * canvasData.width)*4;
      var r = canvasData.data[ids];
      if (r == 255) r = 0;
      else r = 255;
      update(n,i,j,r);
    }
  }
  else console.log("Fail!"+n.toString());
}
