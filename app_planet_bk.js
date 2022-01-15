export class Calculate{
    constructor(){}

    static distanceLineToPoint(x3,y3,z3,x_polar,y_polar,z_polar){
            //벡터와 한 점의 최단거리 (외적을 통한 계산)  
    let expo_x = (y_polar*z3) - (z_polar*y3);
    let expo_y = (x_polar*z3) - (z_polar*x3);
    let expo_z = (x_polar*y3) - (y_polar*x3);
    
    let numer = Math.pow(expo_x,2)+Math.pow(expo_y,2)+Math.pow(expo_z,2);
    let denom = Math.pow(x_polar,2)+Math.pow(y_polar,2)+Math.pow(z_polar,2);
    let d = Math.sqrt(numer/denom);

    return d;
    }

    static distancePointToPoint(x1,y1,z1,x2,y2,z2){
        let d = Math.sqrt(Math.pow(x1-x2,2)+Math.pow(y1-y2,2)+Math.pow(z1-z2,2));
        return d;
    }

    static directionVectorPlanetToSun(vx,vy,vz,windowRadius,sunx,suny){
        //구의 중심(vx,vy,vz)에서 항성계 중심(0,0,0)을 이었을때, 방향 벡터 반환
        //window 중심을 중심으로
        //var x1 = (-1)vx;
        //var y1 = (-1)*vy;
        //var z1 = (-1)*vz;
        //var x1 = canvas.width/2-vx;
        let x1 = sunx-vx;
        //var y1 = canvas.height/2-vy;
        let y1 = suny-vy;
        let z1 = -1*vz;
    
        let squrt = Math.sqrt(Math.pow(x1,2)+Math.pow(y1,2)+Math.pow(z1,2));
        
        let xp = x1/squrt*windowRadius;
        let yp = y1/squrt*windowRadius;
        let zp = z1/squrt*windowRadius;
        //console.log("xp:"+xp +"  yp:"+ yp + "  zp:" + zp + "   r:"+ windowRadius);

        return{
            x :xp,
            y :yp,
            z :zp
        };
    
    }

    static orthogonalVector(refx,refy,refz,tox,toy,toz){
        let sll = { x:0, y:0, z:0 };

        let vv = refx*refx + refy*refy + refz*refz;
        let sv = tox*refx + toy*refy + toz*refz;
        let k = sv/vv;

        sll.x = k*refx;
        sll.y = k*refy;
        sll.z = k*refz;  
        
        let xp = tox - sll.x;
        let yp = toy - sll.y;
        let zp = toz - sll.z;
        return{
            x :xp,
            y :yp,
            z :zp
        };
    }

    static axisRotation(axisX,axisY,axisZ,x1,y1,z1,angle){

        let arr1 = [[[],[],[]],[[],[],[]],[[],[],[]]];
        let arr2 = [[x1],[y1],[z1]];

        arr1[0][0] = Math.cos(angle)+(1-Math.cos(angle))*Math.pow(axisX,2);
        arr1[0][1] = (1-Math.cos(angle))*axisX*axisY - Math.sin(angle)*axisZ;
        arr1[0][2] = (1-Math.cos(angle))*axisX*axisZ + Math.sin(angle)*axisY;

        arr1[1][0] = (1-Math.cos(angle))*axisX*axisY + Math.sin(angle)*axisZ;
        arr1[1][1] = Math.cos(angle) + (1-Math.cos(angle))*Math.pow(axisY,2);
        arr1[1][2] = (1-Math.cos(angle))*axisY*axisZ - Math.sin(angle)*axisX;

        arr1[2][0] = (1-Math.cos(angle))*axisX*axisZ - Math.sin(angle)*axisY;
        arr1[2][1] = (1-Math.cos(angle))*axisY*axisZ + Math.sin(angle)*axisX;
        arr1[2][2] = Math.cos(angle) + (1-Math.cos(angle))*Math.pow(axisZ,2);

        let answer = this.matrixProduct(arr1,arr2);

        return {
            x : answer[0][0],
            y : answer[1][0],
            z : answer[2][0]
        };
    }

    static matrixProduct(arr1, arr2){
        let answer = [];
        let row1 = arr1.length;
        let col1 = arr1[0].length;
        let col2 = arr2[0].length;

        for(var s=0; s<row1; s++){
            answer.push([]);
            for(var n=0; n<col2; n++){
                answer[s].push(0);
            }
        }

        for(var i=0; i<row1; i++){
            for(var j=0; j<col2; j++){
                for(var k=0; k<col1; k++){
                    answer[i][j] = answer[i][j] + arr1[i][k]*arr2[k][j];
                }
            }
        }

        return answer;

    }

}

export class PlanetGroup{
    constructor(){
        this.array = [];
    }

    pushing(planet){
        this.array.push(planet);
        this.sorting(this.array);
    }

    sorting(array){
        array.sort(function(a,b){
            return a.spaceZ - b.spaceZ;
        });
    }
}

export class Planet {
    constructor(canvas,event,spaceRadius,planetR,sunx,suny,stageWidth,stageHeight){
        this.stageWidth = stageWidth;
        this.stageHeight = stageHeight;
        this.planetR = planetR;
        this.event = event;
        this.canvas = canvas;

        this.portionX = this.event.clientX/this.canvas.width;
        this.portionY = this.event.clientY/this.canvas.height;

        this.ctx = this.canvas.getContext('2d');
        this.spaceX = 0;
        this.spaceY = 0;
        this.spaceZ = 0;
        this.spaceRadius = spaceRadius;
        this.colorRed = 0;
        this.colorGreen = 0;
        this.colorBlue = 0;
        this.polarX = 0;
        this.polarY = 0;
        this.polarZ = 0;
        
        this.shadePolor = 0;
        
        this.sunx = sunx;
        this.suny = suny;
        
        this.spacePosition(this.event.clientX,this.event.clientY);

        this.windowRadius = (this.spaceRadius*2 + this.spaceZ)/(this.spaceRadius*4)*this.planetR;

        this.generatePolar();
        this.colorSet();

        //window_r = (space_r*2 + space_pos.z)/(space_r*4)*r;
        this.windowX = this.spaceX;
        this.windowY = this.spaceY;

        this.genOrbit();

    }

    resize(){
        this.spaceX = this.canvas.width * this.portionX;
        this.spaceY = this.canvas.height * this.portionY;
        this.windowX = this.spaceX;
        this.windowY = this.spaceY;
    }

    generatePolar(){      
    //반지름 r내부에 랜덤 극점 point 생성
    let polar_r =  this.windowRadius*Math.random();
    let radian = Math.PI*2*Math.random();
    this.polarX = Math.round(polar_r*Math.cos(radian));
    this.polarY = Math.round(polar_r*Math.sin(radian));
        //해당 정사영에서 구 위의 Z point 계산 
    this.polarZ = Math.sqrt(Math.abs(Math.pow(this.windowRadius,2)-Math.pow(this.polarX,2)-Math.pow(this.polarY,2)));
    //console.log(this.polarX +"  "+ this.polarY +"  "+this.polarZ);
    }

    colorSet(){

        this.colorRed = Math.random() < 0.5 ?  2*Math.random()+0.1: -2*Math.random()+0.1;
        this.colorGreen = Math.random() < 0.5 ?  2*Math.random()+0.1: -2*Math.random()+0.1;
    
        if(Math.sign(this.colorRed)*Math.sign(this.colorGreen)==-1){
            this.colorBlue = Math.random() < 0.5 ?  2*Math.random()+0.1: -2*Math.random()+0.1;
        }
        else{
            this.colorBlue = Math.sign(this.colorRed) < 0 ? 2*Math.random()+0.1: -2*Math.random()+0.1;
        }
        
    }

    spacePosition(clientX,clientY){
        let radian = 2*Math.PI*Math.random();
        // 뒤에 space 텀은 window 좌표 더해주기
        this.spaceX = clientX;
        this.spaceY = clientY;
        //this.spaceX = Math.round(Math.random()*(this.stageWidth/2)*Math.cos(radian))+this.stageWidth/2;
        //this.spaceY = Math.round(Math.random()*this.spaceRadius*Math.sin(radian))+this.stageHeight/2;
    
        //일단은 반달 잘 나오는지 확인하기 위해 고도는 낮게
        this.spaceZ = (this.spaceRadius*2)*Math.random()-this.spaceRadius;


    }
    
    renderingPlanet(sunx,suny,stageWidth,stageHeight){

        this.sunx = sunx;
        this.suny = suny;
        this.shadePolor = Calculate.directionVectorPlanetToSun(this.spaceX,this.spaceY,this.spaceZ,this.windowRadius,this.sunx,this.suny);

        for(var i=(this.windowX-this.windowRadius);i<=(this.windowX+this.windowRadius);i+=2){
            for(var j=(this.windowY-this.windowRadius);j<=(this.windowY+this.windowRadius);j+=2){
                
                let pos = Math.pow(i-this.windowX,2)+Math.pow(j-this.windowY,2);
                let circle = Math.pow(this.windowRadius,2);
    
                //원 안에있는지 확인
                if(pos<=circle) {
                    
                    var x3 = i-this.windowX;
                    var y3 = j-this.windowY;
                    //3차원 구 위의 z좌표 추가 space 공간상에서는 -좌표까지 고려해야 함 광원에서 반대인 부분의 구를 스캔예정
                    //if(z1>0){
                    var z3 = Math.sqrt(Math.pow(this.windowRadius,2)-Math.pow(x3,2)-Math.pow(y3,2));
                    //}
                    //else{
                       //var z3 = -1*Math.round(Math.sqrt(Math.pow(r_win,2)-Math.pow(x3,2)-Math.pow(y3,2)));
                    //}
                    
                    //극점과 화면을 스캔하는 점의 거리는 반대 반구일 경우 루트2*반지름 보다 멀다 해당 사실을 가지고 조건문
                    let decisionHalfSphere = Calculate.distancePointToPoint(this.shadePolor.x,this.shadePolor.y,this.shadePolor.z,x3,y3,z3);
                    //var d = Calculate.distanceLineToPoint(x3,y3,Math.abs(z3),this.polarX,this.polarY,this.polarZ);
                    var d = Calculate.distanceLineToPoint(x3,y3,z3,this.polarX,this.polarY,this.polarZ);

                    //console.log(d);
                    
                    
                    if(decisionHalfSphere>=Math.sqrt(2)*this.windowRadius){
    
                        //해당 구 위 점에서 극점 법선벡터(선분)와의 거리 계산(외적사용) |v(x3,y3,z3)*polar_v(x,y,z)| / |polar_v(x,y,z)|       d의 범위 : 0 ~ r
    
                        var d_shade = Calculate.distanceLineToPoint(x3,y3,z3,this.shadePolor.x,this.shadePolor.y,this.shadePolor.z);
    
                        //같은 거리의 집합을 같은색으로 칠할 경우 구와 면이 접하여 생성된 원과 같음 단, 북반구/남반구가 색 대칭
    
                        if(this.colorRed>0){
                            var r_c = Math.round((d/(this.colorRed*this.windowRadius)*255));
                        }
                        else
                        {
                            var r_c = Math.round(255+(d/(this.colorRed*this.windowRadius)*255));
                        }
    
                        if(this.colorGreen>0){
                            var g_c = Math.round((d/(this.colorGreen*this.windowRadius)*255));
                        }
                        else
                        {
                            var g_c = Math.round(255+(d/(this.colorGreen*this.windowRadius)*255));
                        }
    
                        if(this.colorBlue>0){
                            var b_c = Math.round((d/(this.colorBlue*this.windowRadius)*255));
                        }
                        else
                        {
                            var b_c = Math.round(255+(d/(this.colorBlue*this.windowRadius)*255));
                        }
                        
                        //shade algorithm
                        var shadow_radian = Math.PI*2/30;
                        var boundryD = this.windowRadius*Math.cos(shadow_radian)
                        if(d_shade<boundryD){
                            r_c = 0;
                            g_c = 0;
                            b_c = 0;
                        }
                        else{
                            var maxmax = Math.max(r_c,g_c,b_c);
                            var minmin = Math.min(r_c,g_c,b_c);
                            
                            let ratio_shade = (d_shade-boundryD)/(this.windowRadius-boundryD);
                            r_c = r_c*(ratio_shade);
                            g_c = g_c*(ratio_shade);
                            b_c = b_c*(ratio_shade);
                            
                            
                        }
                        
                        /*
                        this.ctx.clearRect(i,j,2,2);
                        this.ctx.fillStyle = "rgb(" +r_c+ "," +g_c+ "," +b_c+ ")";
                        this.ctx.fillRect(i,j,2,2);
                        */
                        this.ctx.fillStyle = "rgba(" +r_c+ "," +g_c+ "," +b_c+ ",1)";
                        this.ctx.beginPath();
                        this.ctx.arc(
                            i, //* ratio_w,
                            j, //* ratio_h,
                            2,
                            0 * 2/8 * Math.PI, 8 * 2/8 * Math.PI
                            );
                        this.ctx.fill();


                    }
                    else{
    
                        if(this.colorRed>0){
                            var r_c = Math.round((d/(this.colorRed*this.windowRadius)*255));
                        }
                        else
                        {
                            var r_c = Math.round(255+(d/(this.colorRed*this.windowRadius)*255));
                        }
    
                        if(this.colorGreen>0){
                            var g_c = Math.round((d/(this.colorGreen*this.windowRadius)*255));
                        }
                        else
                        {
                            var g_c = Math.round(255+(d/(this.colorGreen*this.windowRadius)*255));
                        }
    
                        if(this.colorBlue>0){
                            var b_c = Math.round((d/(this.colorBlue*this.windowRadius)*255));
                        }
                        else
                        {
                            var b_c = Math.round(255+(d/(this.colorBlue*this.windowRadius)*255));
                        }
                        
                        /*
                        this.ctx.clearRect(i,j,2,2);
                        this.ctx.fillStyle = "rgb(" +r_c+ "," +g_c+ "," +b_c+ ")";
                        //this.ctx.fillStyle = "rgb(" +0+ "," +0+ "," +0+ ")";
                        this.ctx.fillRect(i,j,2,2);
                        */
                        this.ctx.fillStyle = "rgb(" +r_c+ "," +g_c+ "," +b_c+ ",1)";
                        
                        this.ctx.beginPath();
                        this.ctx.arc(
                            i, //* ratio_w,
                            j, //* ratio_h,
                            2,
                            0 * 2/8 * Math.PI, 8 * 2/8 * Math.PI
                            );
                        this.ctx.fill();

                    }
                }
            }
        }
    }

    genOrbit(){
        //임의의 seed vector를 활용하여, 현재 스페이스 공간에 위치한 행성 벡터와 수직인 벡터 ref 를 찾는다 
        //ref벡터를 중심으로 회전 시킨다.
        //this.axisOrbit = { x:0, y:0, z:0 };

        let seedVector = {x:Math.random(),y:Math.random() ,z:Math.random() };
        /*
        let sll = { x:0, y:0, z:0 };

        let vv = this.spaceX*this.spaceX + this.spaceY*this.spaceY + this.spaceZ*this.spaceZ;
        let sv = seedVector.x*this.spaceX + this.seedVector.y*this.spaceY + this.seedVector.z*this.spaceZ;
        let k = sv/vv;

        sll.x = k*this.spaceX;
        sll.y = k*this.spaceY;
        sll.z = k*this.spaceZ;  
        */
        this.axisOrbit = Calculate.orthogonalVector((this.spaceX-this.sunx),(this.spaceY-this.suny),this.spaceZ,seedVector.x,seedVector.y,seedVector.z);

        console.log((this.spaceX-this.sunx) +" "+ (this.spaceY-this.suny) +"  "+this.spaceZ);

        console.log(this.axisOrbit);

        //https://m.blog.naver.com/PostView.naver?isHttpsRedirect=true&blogId=spacebug&logNo=221839553172

    }

    fallPlanet(){
        //this.spaceX = 0;
        //this.spaceY = 0;
        //this.spaceZ = 0;
        this.angleSpeed = 2*Math.PI/360;
        // 로드리게스 회전 공식
        //https://oksujay1127.tistory.com/75

        this.spaceStep = Calculate.axisRotation(this.axisOrbit.x,this.axisOrbit.y,this.axisOrbit.z,(this.spaceX-this.sunx),(this.spaceY-this.suny),this.spaceZ,this.angleSpeed);
        //console.log(this.spaceStep);

        this.spaceX = this.spaceStep.x + this.sunx;
        this.spaceY = this.spaceStep.y + this.suny;
        this.spaceZ = this.spaceStep.z;
        this.windowX = this.spaceX;
        this.windowY = this.spaceY;
        this.windowRadius = (this.spaceRadius*2 + this.spaceZ)/(this.spaceRadius*4)*this.planetR;
        //this.polarZ = Math.sqrt(Math.pow(this.windowRadius,2)-Math.pow(this.polarX,2)-Math.pow(this.polarY,2));

        //console.log(this.polarZ);

        //console.log(this.spaceX +"    "+ this.spaceY+"     "+this.spaceZ);
        //console.log(this.spaceX);

    }

}
