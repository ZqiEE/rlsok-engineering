
document.querySelectorAll('.chart').forEach(function(box){
 var svg=box.querySelector('svg'),tip=box.querySelector('.tip'),pts=JSON.parse(box.dataset.pts),
 x0=+box.dataset.x0,x1=+box.dataset.x1,y0=+box.dataset.y0,y1=+box.dataset.y1,L=48,R=12,T=10,B=26,W=520,H=200,
 cross=svg.querySelector('.cross'),dot=svg.querySelector('.dot');
 function sx(x){return L+(x-x0)/(x1-x0||1)*(W-L-R)} function sy(y){return T+(1-(y-y0)/(y1-y0||1))*(H-T-B)}
 svg.addEventListener('mousemove',function(e){var r=svg.getBoundingClientRect(),px=(e.clientX-r.left)/r.width*W,
  t=x0+(px-L)/(W-L-R)*(x1-x0),best=pts[0];for(var i=0;i<pts.length;i++){if(Math.abs(pts[i][0]-t)<Math.abs(best[0]-t))best=pts[i]}
  cross.setAttribute('x1',sx(best[0]));cross.setAttribute('x2',sx(best[0]));cross.style.display='';dot.setAttribute('cx',sx(best[0]));dot.setAttribute('cy',sy(best[1]));dot.style.display='';
  tip.style.display='block';tip.textContent=(box.dataset.logx==='1'?'f='+Math.pow(10,best[0]).toPrecision(4)+' Hz   ':'t='+best[0].toPrecision(4)+' s   ')+box.dataset.name+'='+best[1].toPrecision(5);
  tip.style.left=Math.min(r.width-160,(sx(best[0])/W*r.width)+8)+'px';tip.style.top='4px'});
 svg.addEventListener('mouseleave',function(){tip.style.display='none';cross.style.display='none';dot.style.display='none'})});
