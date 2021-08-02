let txts = []
let ft
let webGLGraphics,webGLGraphics2

let overAllTexture
let texture1,texture2 
let bgm
let lightImg
let theShader;
let loadingFactor=0,targetLoadingFactor=0
let checkbox,checkbox1
let canvasTexture
let textureCount = 3
let showText = true
let bgAudio,amplitude
let aboutPan = 0, aboutOpacity = 0
let showAbout = false

function preload(){
	// ft = loadFont("IBMPlexMono-Bold.ttf")
	// bgm = loadSound("201102 New Dimensions.mp3")
	// 載入材質
	lightImg = loadImage("radial-gradient.png")
	canvasTexture = loadImage("canvasTexture.jpg")
	overAllTexture = loadImage("texture.png")
	texture1=loadImage("texture1.png")
	texture2=loadImage("texture2.png")
	bgAudio = loadSound("noise1min.mp3")
	
	
	theShader = new p5.Shader(this.renderer,vert,frag)
}
// function mousePressed(){
// 	bgAudio.play()
// }
let textureHeight = 500
let btnConnent
let checkStartCondition=()=>false
let elementDialog
function setup() {
	textFont('serif')
	//初始化畫布
	createCanvas(windowWidth,windowHeight);
	pixelDensity(1)
	
	//Webgl用圖層
	webGLGraphics = createGraphics(width,height,WEBGL);
	webGLGraphics2 = createGraphics(width,height,WEBGL);
	webGLGraphics.background(255);
	
	
	bgAudio.play()
	amplitude = new p5.Amplitude();
	
	// initialize 控制項
	checkbox = createCheckbox('toggleLoading', true);
	checkbox.position(width-240,160)
	checkbox.style("color","white")
	checkbox.style("display","none")
	checkbox.changed(()=>{
		targetLoadingFactor = checkbox.checked()?1:0
	})
	checkbox1= createCheckbox('toggleText', true);
	checkbox1.position(width-240,190)
	checkbox1.style("color","white")
	checkbox1.style("display","none")
	checkbox1.changed(()=>{
		showText = checkbox1.checked()
	})
	
	elementDialog = createDiv("#連接錯誤<br>尚未到指定時間!")
	elementDialog.addClass("dialog") 
	elementDialog.addClass("hide")
	
	
	btnConnent = createButton("嘗試連接衛星")
	btnConnent.addClass("connectBtn")
	btnConnent.position(width-240,height-200)
	btnConnent.mousePressed(()=>{
		let counter =0
		btnConnent.html("連接中")
		//開始淡出動畫
		setTimeout(()=>{
			targetLoadingFactor=0
		},500)
		//連接中效果
		let connectInterval = setInterval(()=>{
			counter++
			btnConnent.html("連接中"+Array.from({length: counter %5}).map(a=>".").join(""))
			if (counter>15){
				if (!checkStartCondition()){
					btnConnent.html("再次嘗試連接衛星")
					targetLoadingFactor=1
					
					// alert("尚未到指定時間!")
					elementDialog.removeClass("hide")
					setTimeout(()=>{
						elementDialog.addClass("hide")
					},3000)
				}else{
					//如果時間到了就跳轉
				}
				clearInterval(connectInterval)
			}
		},300)
	})
		
	
	// 初始化材質圖層
	for(var i=0;i<textureCount;i++){
		txts[i] = createGraphics(1200,textureHeight)
	}
	background(0)
	
	//設定 loading Factor控制載入縮放
	setTimeout(()=>{
		targetLoadingFactor=1
	},500) 
	noCursor()
}

function draw() {
	background(0);

	//取得音量
  let audioLevel = amplitude.getLevel();
	loadingFactor = lerp(loadingFactor,targetLoadingFactor,0.04)
	
	//設定Shader uniforms
	// theShader.setUniform('u_resolution',[width/1000,height/1000])
	// theShader.setUniform('u_time',millis()/1000)
	// theShader.setUniform('u_mouse',[mouseX/width,mouseY/height])
	// theShader.setUniform('tex0',webGLGraphics)
	// theShader.setUniform('tex1',canvasTexture)
	
	// webGLGraphics2.shader(theShader)
	// webGLGraphics2.rect(-width/2,-height/2,width,height)
	 
	//更新材質
	for(var i=0;i<textureCount;i++){
		//有一定機率會更新那一條材質
		if (random()<0.5+audioLevel*1){
			txts[i].clear(1200,textureHeight)
			for(var o=0;o<1200;o+=1){
				//畫音波
				if (random()<0.9+audioLevel*1){
					txts[i].rectMode(CENTER)
					txts[i].noStroke()
					let kk = noise(i/50+frameCount/50+mouseX/500,o/10)*
										sin(mouseY/300+frameCount/(30+audioLevel*1)+i/5+o/(50+noise(i*50)*50))
					
					txts[i].fill(255,random(0.95,1)*kk*320+100*audioLevel)
					txts[i].rect(o,textureHeight/2,1,
													textureHeight/10*kk+5+20*random()*audioLevel)
					
					txts[i].fill(255,random(0.95,1)*kk*40+10)
					txts[i].rect(o,textureHeight/2,2,
													textureHeight/10*kk*1.1*(0.5+audioLevel)+5+20*random()*audioLevel)
					if (random()<0.8){
						txts[i].rect(o+random(-100,100),textureHeight/2+random(-5,5),
												 random(1),random(1))
					}
				}
			}
		} 
	} 
	
	//繪製球體在圖層上
	webGLGraphics.push()
	webGLGraphics.clear(0,0,width,height)
	webGLGraphics.fill(0)
	
	//計算整個世界地球旋轉角度
	let getEarthAngles = ()=>[
		sin(frameCount/500 + mouseX/600),
		cos(frameCount/200+ mouseY/600),
		cos(frameCount/200)
	]
	let earthAngles = getEarthAngles()
	webGLGraphics.rotateX(earthAngles[0])
	webGLGraphics.rotateY(earthAngles[1])
	webGLGraphics.rotateZ(earthAngles[2])
	webGLGraphics.stroke(0)
	
	webGLGraphics.noFill()
	webGLGraphics.box(50)
	webGLGraphics.noStroke()
	let audioWaveCount = 8
	
	//取得單一個音波層的角度旋轉
	let getLayerAngles = (i)=>[
		sin(frameCount/500)+i + noise(i*50)*2*PI,
		cos(frameCount/300+i*5)+ noise(i*50,30)*2*PI,
		cos(frameCount/300+i*3)+ noise(i*50,5000)*2*PI
	]
	
	//化總共八層音波
	for(var i=0;i<audioWaveCount;i++){
		let angles = getLayerAngles(i)
		webGLGraphics.push()
			webGLGraphics.texture(txts[i%textureCount])
			webGLGraphics.rotateX(angles[0])
			webGLGraphics.rotateY(angles[1])
			webGLGraphics.rotateZ(angles[2])
			webGLGraphics.sphere(loadingFactor*(height/5.2+i*15 + noise(i,frameCount/50)*20),32)
		webGLGraphics.pop()
	}
	webGLGraphics.pop()
	
	//--------
	//更新主畫面背景
	fill(10)
	rect(0,0,width,height)
	
	//使用有經過 GLSL 的webGLGraphics2
	//圖層處理 主圖像 (webGLGraphics) -> GLSL Shader (的webGLGraphics2) -> 主畫布
	// image(webGLGraphics2,0,0,width,height)
	
	//舊的overlay 材質
	// push()
	// 	blendMode(SCREEN)
		// image(texture1,0,0,width,height)
		// image(texture1,0,0,width,height)
		// image(texture1,0,0,width,height)
		// image(texture2,0,0,width,height)
	
	// pop()
	
	
	//stars
	push() 
		noStroke()
		for(var i=0;i<200*loadingFactor;i++){
			
			//取得根據index的亂數位置位置
			let x = map(noise(i,50),0,1,-width/2,width*1.5)
			let y = map(noise(i,1000),0,1,-height/2,height*1.5)
			
			//取得噪聲透明度
			fill(noise(i,2000)*200)
			
			//如果不在球體範圍內再畫星星
			if (dist(x,y, width/2,height/2)>300){
				circle(x,y,noise(i,10000,frameCount/50)*6)
			}
		}
	pop()
	
	//繪製旁邊的網格
	push()
		stroke(255,10)
	
		//x方向網格 
		for(var x=0;x<width*loadingFactor;x+=10){

			strokeWeight(x%100==0?2:1)
			stroke(255,x%100==0?50:10)
			line(x,0,x,height)
		}
	
		//y方向網格 
		for(var y=0;y<height*loadingFactor;y+=10){
			strokeWeight(x%100==0?2:1)
			stroke(255,y%100==0?50:10)
			line(0,y,width,y)
		}
	
		//右下角deco
		stroke(255)
		line(width-50-250*loadingFactor,height-50,width-50,height-50)
		line(width-50,height-50-250*loadingFactor,width-50,height-50)
	
		//繪製 球體旁邊的旋轉刻度
		push()
			translate(width/2,height/2)
			scale(loadingFactor)
			let ang = noise(frameCount/80)*1
			rotate(ang)
			//中心Ｘ記號
			line(-30,-30,+30,+30)
			line(+30,-30,-30,+30)
			noFill()
			
			//4個旋轉刻度
			for(var i=0;i<4;i++){
				rotate(PI/2)
				strokeWeight(2)
				stroke(255,200)
				line(450,0,480,0)
				line(480,10,480,-10)
				if (i==3){
					push()
						fill(255)
						noStroke()
						text(int(ang*360)+"°",580,10)
					pop()
				}
			}
		pop()

		//x方向刻度 
		for(var x=0;x<width*loadingFactor;x+=10){

			stroke(255,x%100==0?80:20)
			strokeWeight(3)
			line(x,height-50,x,height-20)
		}
		
		//y方向刻度 
		for(var y=0;y<height*loadingFactor;y+=10){

			stroke(255,y%100==0?80:20)
			strokeWeight(5)
			line(width-50,y,width-20,y)
		}
	pop()
	
	
	//顯示裝飾文字
	if (showText){
		fill(255)

		noStroke()
		// textFont(ft)
		textSize(20)	
		push()
			textStyle(NORMAL)
			text((new Date()).toISOString().slice(50*-loadingFactor-1),100,height-150)
		pop()

// 		push()
// 			textStyle(BOLD)
// 			textSize(20)
// 			text(("ROTATE X: "+sin(frameCount/200+i) + "\n"
// 					 +"ROTATE Y: "+cos(frameCount/100+i*5) + "\n"
// 					 +"ROTATE Z: "+cos(frameCount/100+i*3) + "\n").slice(300*-loadingFactor-1)
// 						, 40,height-100)
// 			text("................".slice(20-frameCount%20-1),width-200,height-60)
// 		pop()

		// textSize(25)
		// text("2020-12-30--10-12-11--593_pX.fots".slice(100*-loadingFactor-1)
		// 			, width-500 + (random()<0.05?10:0),50)
		// textSize(100)
		// textStyle(BOLD)
		// text("NORAD".slice(10*-loadingFactor-1)
		// 			, width-400 + (random()<0.1?10:0),150)


// 		textSize(15)
// 		text(txtData.slice(txtData.length*-loadingFactor-1),40,40)
		push()
		
			translate(100,height/2-70)
			textFont('serif')
			textSize(35)
			text("THE EARTH IS AN IMAGE",0,0)
			translate(0,80)
			textSize(80)
			scale(0.6,1)
			text("地表之下 別 無 他物",0,0)
			textSize(36)
			text("劉昕作品".slice(10*-loadingFactor-1),0,60)
		pop()
		
		
		push()	
		
			textAlign(LEFT);
			translate(width-400,height/2-50)
			scale(0.6,1)
			textFont('serif')
			textSize(48)
			text("The satelite will pass at:".slice(50*-loadingFactor-1),0,0)
			textSize(60)
			text("下次衛星經過時間".slice(50*-loadingFactor-1),0,60)
			textSize(50)
			text("2021-0721-23:13:03UTC".slice(50*-loadingFactor-1),0,120)   
		pop()
	}
	
	//繪製球體中心的光源，疊很多層
	push()
		
		blendMode(SCREEN)
		for(var i=0;i<height;i+=10){
			fill(255,3+ map(log(i),0,5,80,0,true))
			noStroke()
			let r = i/2+noise(i/100+frameCount/(20+sin(i/50-frameCount/50)))*50
			circle(width/2,height/2,r*loadingFactor)
		} 
	
		//疊上材質檔案
		blendMode(MULTIPLY)
		image(overAllTexture,random([-10,10]),random([-10,10]),width+20,height+20)
	
	
// 		if (random()<0.3){
// 			let xx = int(random(0,width))
// 			let yy = int(random(0,height))
// 			let xx2 = int(xx + random(-50,50))
// 			let yy2 = int(yy+ random(-50,50))
// 			let ww = int(random(0,80))
// 			let hh = int(random(0,30))
// 			copy(xx,yy,ww,hh,xx2,yy2,ww,hh)
// 		}
	pop()
	
	let labels = [
		["LONGITUDE [km]: ","緯度"],
		["ALTITUDE [km]: ","經度"],
		["ALTITUDE [mi]","海拔"],
		["SPEED [KM/S]: ","速度"],
		["ELEVATION: ","方位角"],
		["RIGHT ASCENSION: ","相對高度"],
		["DECLINATION: ","赤經"],
		["Local Sidereal Time: ","赤緯"],
	]
	
	if (aboutOpacity<0.5){
		//動態立體文字
		for(var i=0;i<7;i++){
			push()
			translate(width/2,height/2)
			let angles = getLayerAngles(i)
			let rr = height/3*loadingFactor
			rotate(angles[2]+earthAngles[2])
			let xx = cos(angles[0]-earthAngles[0])*rr
			let yy = sin(angles[1]-earthAngles[1])*rr
			translate(xx,yy)
			rotate(-angles[2]-earthAngles[2])
			fill(255,map(aboutOpacity,0,1,255,0))
			textSize(22*loadingFactor)
			scale(0.6,1)
			text(labels[i][0]+ (noise(i,frameCount/50)*10).toFixed(2)+"\n"+labels[i][1],0,0)
			pop()
		}
	}
	
	//鼠標
	push()
		stroke(255,100)
		line(mouseX,0,mouseX,height)
		line(0,mouseY,width,mouseY)
		
	
		translate(mouseX,mouseY)
		text(int(mouseX)+","+int(mouseY),10,20)
		stroke(255)
		line(-50,0,50,0)
		line(0,50,0,-50)
		noFill()
		rect(-5,-5,10,10)
	pop()
	
	//About內容 
	push()
		let textWidth = width/25
		textSize(textWidth)
		let textH = 0
		let textW = 0
		translate(0,-aboutPan+500)
		background(0,aboutOpacity*155)
		for(var i=0;i<aboutText.length;i++){
			fill(255,aboutOpacity*255)
			push()
				textAlign(LEFT)
				translate(textW,textH)
				scale(1,1.34)
				
				text(aboutText[i],0,0)
				if (textW>width){
					textH+=textWidth*1.34*1.2
					textW=0
				}else{
					textW+=textWidth
				}
				
			pop()
		}
	pop()
	if (dist(mouseX,mouseY,width/2,height/2)<300 && loadingFactor>0.9){
		showAbout = true
		aboutPan+=1
		aboutOpacity = lerp(aboutOpacity,1,0.1)
	}else{
		showAbout =false
		if (aboutPan>0){
			aboutPan-=1
		}
		aboutOpacity = lerp(aboutOpacity,0,0.1)
	}
	// text(aboutText,0,0,width,height)
	
	// ellipse(mouseX, mouseY, 20, 20);
}