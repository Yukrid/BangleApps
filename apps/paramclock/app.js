const N = 176;
const BIN = 0.03;
const SIZE = Math.floor(2.0*Math.PI/BIN)+1;
const OFSET_X = 88.5;
const OFSET_Y = 75;
const MONTH_NUM = [-2, 1, -4, 3, -6, 5, -3, 2, -5, 4, -7, 6];

let drawTimeout;
let disp_on = true;

g.drawRect(0, 0, 176, 176);

function queueDraw() {
  let val;
  if(disp_on) val =  15000 - (Date.now() %  15000);
  else        val = 300000 - (Date.now() % 300000)
  if (drawTimeout) clearTimeout(drawTimeout);
  drawTimeout = setTimeout(function() {
    drawTimeout = undefined;
    draw();
  }, val);
}


function sin_x1(t,a,b){
  return Math.sin(t); 
}

function sin_x2(t,a,b){
  return Math.sin(t+b*Math.PI); 
}

function lissajous_x1(t,a,b){
  return Math.sin((a+1)*t); 
}

function lissajous_x2(t,a,b){
  return Math.sin(a*t+b*Math.PI/(a+1));
}

function trochoid_x1(t,a,b){
  return a*Math.cos(t)+(1-a)*Math.cos(b*t); 
}

function trochoid_x2(t,a,b){
  return a*Math.sin(t)-(1-a)*Math.sin(b*t);
}

let draw = function(){

  g.clear(1);
  g.reset();
  //console.log(g.theme.dark);

  g.setColor(0, 0, 0);
  g.fillRect(0, 0, 175, 175);
  
  
  let date = new Date();
  let date2 = new Date(date.getTime());
  date2.setMonth(date2.getMonth()+1, 0);
  let last = date2.getDate();
  let month = date.getMonth();
  let day = date.getDate();
  let hour = date.getHours();
  let qhour = hour%6;
  let min = date.getMinutes();
  let sec = date.getSeconds();
  let week = date.getDay();

  {
    let a = (last-(day+hour/24))/last;
    let b = MONTH_NUM[month-1];
    let pos_x1 = Math.floor(44*trochoid_x1(0,a,b)+OFSET_X);
    let pos_y1 = Math.floor(44*trochoid_x2(0,a,b)+OFSET_Y);
    g.setColor(0.0, 1.0, 0.0);

    for(i=0; i<SIZE; i+=1){
      let t=i*BIN;
      let pos_x2 = Math.floor(44*trochoid_x1(t,a,b)+OFSET_X);
      let pos_y2 = Math.floor(44*trochoid_x2(t,a,b)+OFSET_Y);
      if(pos_x1 != pos_x2 || pos_y1 != pos_y2){
        g.drawLine(pos_x1,pos_y1,pos_x2,pos_y2);
        pos_x1=pos_x2;
        pos_y1=pos_y2;
      }
    }
  }

  {
    let a;
    let b;
    let func_x;
    let func_y;

    if(hour==0){
      a = 1;
      b = (60*min+sec)/3600;
      func_x = sin_x1;
      func_y = sin_x2;
    }else if(qhour==0){
      if(hour<12){
        a = 6;
        b = (60*(min+30)+sec)/3600;
        func_x = lissajous_x1;
        func_y = lissajous_x2;
      }else{
        a = 6;
        b = (60*(min+30)+sec)/3600;
        func_x = lissajous_x2;
        func_y = lissajous_x1;
      }
    }else if(hour<12){
      a = qhour;
      b = (60*(min+30)+sec)/3600;
      func_x = lissajous_x1;
      func_y = lissajous_x2;
    }else{
      a = qhour;
      b = (60*(min+30)+sec)/3600;
      func_x = lissajous_x2;
      func_y = lissajous_x1;
    }

    let pos_x1 = Math.floor(60*func_x(0,a,b)+OFSET_X);
    let pos_y1 = Math.floor(60*func_y(0,a,b)+OFSET_Y);
    g.setColor(1, 1, 0);

    for(i=0; i<SIZE; i+=1){
      let t=i*BIN;
      let pos_x2 = Math.floor(60*func_x(t,a,b)+OFSET_X);
      let pos_y2 = Math.floor(60*func_y(t,a,b)+OFSET_Y);
      if(pos_x1 != pos_x2 || pos_y1 != pos_y2){
        g.drawLine(pos_x1,pos_y1,pos_x2,pos_y2);
        pos_x1=pos_x2;
        pos_y1=pos_y2;
      }
    }
  }

  g.setColor(1, 1, 1);
  let hhour = hour;
  if(hour>=12) hhour -= 12;
  for(i=0; i<13; i+=1){
    let x = i*12+16;
    let pos1_y, pos2_y;
    if(i%2){
      pos1_y = 160;
      pos2_y = 150;
    }else{
      pos1_y = 163;
      pos2_y = 147;
    }
    g.drawLine(x,pos1_y,x,pos2_y);
  }
  g.setColor(0.5, 0.5, 0.5);
  g.drawLine(16,145,160,145);
  g.drawLine(16,155,160,155);
  g.drawLine(16,165,160,165);
  let xw = Math.floor(week*144/6+16);
  let xh = Math.floor((hhour*60+min)/720*144+16);
  let xm = Math.floor((min*60+sec)/3600*144+16);
  g.setColor(1.0, 1.0, 1.0);
  g.fillRect(xw-2, 143, xw+2, 147);
  g.fillRect(xh-2, 153, xh+2, 157);
  g.fillRect(xm-2, 163, xm+2, 167);

  g.setColor(0, 0.26, 0);
  let bat = E.getBattery();
  g.fillRect(16, 170, 16+72*bat/100, 175);

  let steps = Bangle.getHealthStatus('day').steps;
  if(steps<8000){
    g.setColor(0.26, 0, 0);
  }else{
    g.setColor(0, 0, 0.26);
    steps = 8000;
  }
  g.fillRect(88, 170, 88+72*steps/8000, 175);

  queueDraw();
};


  //console.log(date);


Bangle.on('backlight', function(on) {
  if (on) {
    disp_on = true;
    draw();
  } else {
    disp_on = false;
  }
});

Bangle.setUI("clock");
draw();
