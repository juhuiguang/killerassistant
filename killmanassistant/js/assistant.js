/**
 * Created by 橘 on 2016/6/26.
 */
(function(){
    'use strict';
    var killerapp=angular.module("killer",[]);
    killerapp.controller("killergame",function($scope){
        $scope.roles=["警察","杀手","秘密警察","医生","平民","花蝴蝶","狙击手","森林老人"];
        $scope.players=[];
        $scope.alivecount=0;//存活总人数
        $scope.goodmancount=0;//好人阵营人数
        $scope.badmancount=0;//坏人阵营人数
        $scope.peplecount=0;//平民阵营人数
        $scope.winner="";
        $scope.game={
            isover:0,//游戏是否结束
            policechance:true,//秘密警察机会
            sniperchance:true//狙击手机会
        };

        function getPlayerByRole(role){
            var ps=[];
            for(var i=0;i<$scope.players.length;i++){
                if($scope.players[i].role==role){
                    ps.push( $scope.players[i]);
                }
            }
            return ps;
        }

        $scope.newgame=function(){
            $scope.game={
                isover:0,//游戏是否结束
                policechance:true,//秘密警察机会
                sniperchance:true//狙击手机会
            };
            var n=$scope.players.length;
            if(n==0){
                n=8
            }else{
                $scope.players=new Array();
            }
            for(var i=0;i<n;i++){
                $scope.players.push(new player(i));
            }
            getresult();
        }
        //默认创建新游戏
        $scope.newgame();
        //添加玩家
        $scope.addplayer=function(){
            $scope.players.push(new player());
            getresult();
        }
        //减少玩家
        $scope.removeplayer=function(number){
            $scope.players.splice(number,1);
            getresult();
        }
        //杀人
        $scope.kill=function(player){
            player.isdead=true;
            if(player.protectplayer!=null){//如果存在被保护的人
                $scope.kill(player.protectplayer)
            }
            getresult();
        }

        //救人
        $scope.rescue=function(player){
            if(!player.isdead){
                player.rescuedcount++;
                if(player.rescuedcount>1){
                    player.isdead=true;
                }
            }else{
                if(player.rescuedcount==2){
                    player.rescuedcount=0;
                }
                player.isdead=false;
            }
            if(player.protectplayer!=null){//如果存在被保护的人
                $scope.rescue(player.protectplayer)
            }
            getresult();
        }

        //取消救人
        $scope.derescue=function(player){
            if(player.rescuedcount>0){
                player.rescuedcount-=1;
                if(player.isdead){
                    player.isdead=false;
                }
            }
            if(player.protectplayer!=null){//如果存在被保护的人
                $scope.derescue(player.protectplayer);
            }
        }

        function getresult(){
            $scope.alivecount=0;
            $scope.goodmancount=0;
            $scope.badmancount=0;
            $scope.peplecount=0;
            for(var i=0;i<$scope.players.length;i++){
                var p=$scope.players[i];
                if(!p.isdead){
                    $scope.alivecount++;
                    if(p.role=="警察"||p.role=="秘密警察"||p.role=="医生"||p.role=="狙击手"||p.role=="花蝴蝶"||p.role=="森林老人"){
                        $scope.goodmancount++;
                    }
                    if(p.role=="杀手"){
                        $scope.badmancount++;
                    }
                    if(p.role=="平民"){
                        $scope.peplecount++;
                    }
                }
            }
            if(getPlayerByRole("未知").length>0){//如果身份没有标注完全，游戏不结束
                $scope.game.isover=0;
            }else{
                if($scope.alivecount==$scope.players.length)return;//游戏没有人死，不进行判定
                if($scope.goodmancount<1||($scope.badmancount>=($scope.goodmancount+$scope.peplecount))){
                    console.log("game over,killer win");
                    $scope.game.isover=1;
                    $scope.winner="杀手";
                }else if($scope.badmancount<1){
                    console.log("game over,police win");
                    $scope.game.isover=1;
                    $scope.winner="警察及平民";
                }else{
                    console.log("game continue");
                    $scope.game.isover=0;
                }
            }

        };

        //判断是否具有特殊角色
        $scope.hasrole=function(role){
            return (getPlayerByRole(role).length>0);
        }
        $scope.days=[];

        $scope.newday=function(){
            var d=new dayitem();
            $scope.days.push(d);
        }

        //玩家对象
        function player(number){
            var _this=this;
            this.role="未知";//默认角色未知
            this.number=number!=null?number:$scope.players.length;//增加玩家时根据当前玩家人数自动增加人数
            this.isdead=false;//是否被杀
            this.beprotect=false;
            this.rescuedcount=0;//被救次数
            this.protectplayer=null;//花蝴蝶保护对象，默认为空
            this.$rolebtn=false;//是否显示角色选择
            this.$roleclick=function(){//点击角色选择时，控制角色选择面板显示
                _this.$rolebtn=true;
            }
            this.setrole=function(role){//选择角色后，给角色赋值
                _this.role=role;
                _this.$rolebtn=false;
                getresult();//刷新游戏人数、阵营人数
            }
        }

        //每个游戏日对象
        function dayitem(){
            this.killplayer=null;//杀手杀的玩家
            this.rescueplayer=null;//医生救的玩家
            this.protectplayer=null;//花蝴蝶保护的玩家
            this.sniperkill=null;//狙击手杀的玩家
            this.specialkill=null;//秘密警察杀的玩家
            this.policevalidateplayer=null;//警察验证的玩家
            this.deniedplayer=null;//被禁言的玩家
            this.voteplayer=null;//投票死的玩家
            this.$passed=false;//这一天有没有过去
            this.$day=false;
            this.$actived=false;
            var _this=this;

            this.activeday=function(){
                for(var i=0;i<$scope.days.length;i++){
                    if($scope.days[i].$actived){
                        $scope.days[i].$actived=false;
                    }
                }
                _this.$actived=true;
            }
            _this.activeday();
            this.vote=function(player){
                $scope.kill(player);
                _this.voteplayer=player;
            }


            this.validate=function(player){
                _this.policevalidateplayer=player;
                return (player.role=="杀手")
            }

            //夜晚结果
            this.nightresult=function(){
                //处理花蝴蝶功能
                if(_this.protectplayer!=null){
                    var kitep=getPlayerByRole("花蝴蝶");
                    kitep.protectplayer=_this.protectplayer;
                    _this.protectplayer.beprotect=true;
                }
                //处理杀手杀人
                if(_this.killplayer!=null){
                    if(!_this.killplayer.beprotect){
                        $scope.kill(_this.killplayer)
                    }//如果没有被保护
                }
                //处理秘密警察杀人
                if(_this.specialkill!=null){
                    if(_this.specialkill.role=="杀手"){
                        if(!_this.specialkill.beprotect){
                            $scope.kill(_this.specialkill);
                        }
                    }
                }
                //处理狙击手杀人
                if(_this.sniperkill!=null){
                    if(!_this.sniperkill.beprotect){
                        $scope.kill(_this.sniperkill);
                    }
                }
                //处理医生救人
                if(_this.rescueplayer!=null){
                    //如果该玩家被保护
                    if(_this.rescueplayer.beprotect){
                        //不执行救治
                    }else{
                        //如果救的人是杀手，且秘密警察与狙击手都杀了此人
                        if(_this.rescueplayer.role=="杀手"&&
                            (
                                (_this.rescueplayer===_this.specialkill&&_this.rescueplayer===_this.sniperkill) ||
                                (_this.rescueplayer===_this.killplayer&&_this.rescueplayer===_this.sniperkill)  ||
                                (_this.rescueplayer===_this.killplayer&&_this.rescueplayer===_this.specialkill)
                            )
                        ){
                            //被杀两次，直接死
                        }else if(_this.rescueplayer.role!="杀手"&&_this.rescueplayer===_this.killplayer&&_this.rescueplayer===_this.sniperkill){
                            //被杀两次，直接死
                        }//如果被救治的不是杀手，且杀手与狙击手同时杀了此人
                        else{//正常救治
                            $scope.rescue(_this.rescueplayer);
                        }
                    }
                }
                var result=[];
                if(_this.killplayer!=null&&_this.killplayer.isdead){
                    result.push("玩家"+(_this.killplayer.number+1)+",被杀手杀");
                }
                if(_this.specialkill!=null&&_this.specialkill.isdead){
                    result.push("玩家"+(_this.specialkill.number+1)+",被秘密警察杀");
                }
                if(_this.sniperkill!=null&&_this.sniperkill.isdead){
                    result.push("玩家"+(_this.sniperkill.number+1)+",被狙击手杀");
                }
                if(_this.rescueplayer!=null&&_this.rescueplayer.isdead){
                    result.push("玩家"+(_this.rescueplayer.number+1)+",救治无效身亡");
                }
                if(_this.protectplayer!=null&&_this.protectplayer.isdead){
                    result.push("玩家"+(_this.protectplayer.number+1)+",被保护致死");
                }
                return result;
            }

        }

    });
})();

