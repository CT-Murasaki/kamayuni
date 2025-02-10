let y_limit = 80;
let overlap_threshold = 45;
let broadcasterPlayerId = "";
let resolvePlayerInfo = require("@akashic-extension/resolve-player-info");
let tween_animation = require("@akashic-extension/akashic-timeline");

let PlayerDatas = [{}];
let PlayerIds = [];

let font = new g.DynamicFont({
  game: g.game,
  fontFamily: "sans-serif",
  size: 45
});

function main(param) {
  let assetIds = ["host_player","main_player","npc_player","haikei",
                    "body1", "body2", "body3", "body4", "body5", "body6", "body7", "body8","body9","yazi_migi","yazi_hidari"];
  let scene = new g.Scene({ game: g.game ,assetIds: assetIds});
  let timeline = new tween_animation.Timeline(scene);

  let sotugyolabels = [];
  let taigakulabels = [];

  let startThen = false;
  let gameNowThen = false;
  let waitthen = false;
  let gameendThen = false;

  let gamesecond = 15;
  let waittime = 0;

  let gametime = 0;
  let findObjs,sankaObj,startObj,playercntObj
  let backlayer = new g.E({ scene: scene, parent: scene });   //背景
  let buttonlayer = new g.E({ scene: scene, parent: scene });   //ボタン

  let bodyNo = 1;
  let partsId = 0;

  scene.onLoad.add(() => {

    ///////////////////
    ////タイトル画面////
    ///////////////////
    let background = new g.FrameSprite({scene: scene, src: scene.assets["haikei"], parent: backlayer,opacity: 0.5, touchable: false});

    ///////////////////
    ///ユニちゃん関連///
    ///////////////////
    //メイン画像
    let backbody = new g.FrameSprite({scene: scene, src: scene.assets["body" + bodyNo],
      x: g.game.width/2, y: g.game.height/2,anchorX: 0.5, anchorY: 0.5, hidden : true, touchable: false});
    scene.append(backbody);

    //当たり判定(普段は見えない)
    //ターゲットラベル
    let t_list = createTargetList(bodyNo);
    let find1 = new g.FilledRect({scene: scene,x:t_list[1][0], y:t_list[1][1], width: t_list[1][2], height:t_list[1][3], angle:t_list[1][4], cssColor: "black", hidden : true ,opacity:0.2});
    let find2 = new g.FilledRect({scene: scene,x:t_list[2][0], y:t_list[2][1], width: t_list[2][2], height:t_list[2][3], angle:t_list[2][4], cssColor: "blue", hidden : true ,opacity:0.2});
    let find3 = new g.FilledRect({scene: scene,x:t_list[3][0], y:t_list[3][1], width: t_list[3][2], height:t_list[3][3], angle:t_list[3][4], cssColor: "green", hidden : true ,opacity:0.2});
    let find4 = new g.FilledRect({scene: scene,x:t_list[4][0], y:t_list[4][1], width: t_list[4][2], height:t_list[4][3], angle:t_list[4][4], cssColor: "yellow", hidden : true ,opacity:0.2});
    let find5 = new g.FilledRect({scene: scene,x:t_list[5][0], y:t_list[5][1], width: t_list[5][2], height:t_list[5][3], angle:t_list[5][4], cssColor: "red", hidden : true ,opacity:0.2});
    let find6 = new g.FilledRect({scene: scene,x:t_list[6][0], y:t_list[6][1], width: t_list[6][2], height:t_list[6][3], angle:t_list[6][4], cssColor: "purple", hidden : true ,opacity:0.2});
    scene.append(find1);
    scene.append(find2);
    scene.append(find3);
    scene.append(find4);
    scene.append(find5);
    scene.append(find6);
    findObjs = [find1,find2,find3,find4,find5,find6];


    /////////////////
    ////放送主判定////
    /////////////////
    g.game.onJoin.add(ev => {
      broadcasterPlayerId = ev.player.id; // 放送者のプレイヤーID
      // 自分が放送者なら、「締め切る」ボタンを表示。
      if (g.game.selfId === broadcasterPlayerId) {
        //参加処理
        resolvePlayerInfo.resolvePlayerInfo({ raises: true });
        sankaObj.forEach(Obj => {Obj.touchable = false; Obj.hide();});
        sankaObj.forEach(Obj => {Obj.modified();});
      }
      else{
        startObj.forEach(Obj => {Obj.hide(); Obj.touchable = false;});
      }
      startObj.forEach(Obj => {Obj.modified();});
    });

    ///////////////////////////////////////////
    ////操作キャラ表示優先度制御用オブジェクト////
    ///////////////////////////////////////////
    const players_back = new g.E({scene: scene, x: 0, y: 0, width: g.game.width, height: g.game.height, touchable: false, local: true});
    scene.append(players_back);

    const players_front = new g.E({scene: scene, x: 0, y: 0, width: g.game.width, height: g.game.height, touchable: false, local: true});
    scene.append(players_front);

    ///////////////////////////////////////
    ////操作キャラ生成・プレイヤー情報記録////
    ///////////////////////////////////////
    g.game.onPlayerInfo.add((ev) => {
    // リログ時にプレイヤーが多重生成されるので対応
    // PlayerIds内に入力されたプレイヤーIDが無い時のみ処理
    if (PlayerIds.indexOf(ev.player.id) == -1){
        // 各プレイヤーが名前利用許諾のダイアログに応答した時、通知されます。
        // ev.player.name にそのプレイヤーの名前が含まれます。
        // (ev.player.id には (最初から) プレイヤーIDが含まれています)

        const isLocalPlayer = ev.player.id === g.game.selfId;
        const Nushi_Then = ev.player.id === broadcasterPlayerId;
        const isHighPriority = isLocalPlayer || Nushi_Then;

        // プレイヤー画像
        const imageObj = scene.assets[isLocalPlayer ? "main_player" : Nushi_Then ? "host_player" : "npc_player"];

        PlayerIds.push(ev.player.id);
        let playerImage = new g.FrameSprite({scene: scene, src: imageObj,
          x: getrandom(22.5,1240,-1), y: 700, opacity: 1, local: true, hidden:true});
          (isHighPriority ? players_front : players_back).append(playerImage);
        playerImage.invalidate();

        let name = ev.player.name;
        // 名前はnullになることがあるので、その対策としてデフォルト値を設定
        if (name == null) {
        name = "██████████";
        }

        PlayerDatas[ev.player.id] = {
        Name:name,
        Main_Player:playerImage,
        moveX:0,
        moveY:0,
        imageD:0,
        sotuThen:false,
        destoroyed:false,
        images:imageObj
        };
        playercntLabel.text = String(PlayerIds.length) + "人",
        playercntLabel.invalidate();
      }
      });

      ////////////////////////////
      ////プレイヤー人数カウント////
      ////////////////////////////
      let playercntBack = new g.FilledRect({scene: scene,x: g.game.width*0.73, y: g.game.height/5,
      width: 300, height: 300, cssColor: "gray", opacity: 0.5, parent:backlayer,touchable:false});
      scene.append(playercntBack);

      let playercntLabel = new g.Label({
      scene: scene, x: g.game.width*0.8, y: g.game.height/2.65, font: font, text: 1 + "人",
      fontSize: 75, textColor: "black", touchable: false,opacity: 1,local: false
      });
      scene.append(playercntLabel);

      let playercntHedder = new g.Label({
      scene: scene, x: g.game.width*0.77, y: g.game.height/4, font: font, text: "参加人数",
      fontSize: 50, textColor: "black", touchable: false,opacity: 1
      });
      scene.append(playercntHedder);

      playercntObj = [playercntBack,playercntHedder,playercntLabel]

    /////////////////
    ////参加ボタン////
    /////////////////
    let sankaBack = new g.FilledRect({scene: scene,x: g.game.width*0.9 -10, y: g.game.height * 0.9,
      width: 120, height: 60, cssColor: "black", opacity: 0.3, touchable: true, local: true});
    scene.append(sankaBack);
    let sankaButton = new g.Label({
      scene: scene, x: g.game.width*0.9, y: g.game.height * 0.9, font: font, text: "参加",
      fontSize: 50, textColor: "black",opacity: 1, parent:buttonlayer, local: true
    });
    scene.append(sankaButton);
    sankaBack.onPointDown.add(() => {
      resolvePlayerInfo.resolvePlayerInfo({ raises: true });
      sankaObj.forEach(Obj => {Obj.touchable = false; Obj.hide();});
    });
    sankaObj = [sankaBack,sankaButton];

    /////////////////
    ////開始ボタン////
    /////////////////
    let startBack = new g.FilledRect({scene: scene,x: g.game.width*0.1 -10, y: g.game.height * 0.9,
      width: 215, height: 60, cssColor: "gray", opacity: 0.3, touchable: true, local: true});
    scene.append(startBack);
    let startButton = new g.Label({
      scene: scene, x: g.game.width*0.1, y: g.game.height * 0.9, font: font, text: "締め切る",
      fontSize: 50, textColor: "black", parent:buttonlayer, local: true
    });
    scene.append(startButton);
    startBack.onPointDown.add(() => {
      g.game.raiseEvent(new g.MessageEvent({ message: "GameStart" }));
    });
    startObj = [startBack,startButton];

    // 残り時間表示用ラベル
    let timeLabel = new g.Label({
      scene: scene, x: g.game.width * 0.05, font: font, text: gamesecond, hidden:true,
      fontSize: 50, textColor: "black", touchable: false,opacity: 1, parent:buttonlayer,local: false
    });
    scene.append(timeLabel);

    ///////////////////
    ////クリック処理////
    ///////////////////
    scene.onPointDownCapture.add((ev) =>{
      if (gameNowThen == true){
        //クリックした位置に移動
        if (PlayerIds.indexOf(ev.player.id) != -1){  
          //枠外飛び出し防止処理
          let NextX = ev.point.x - 22.5;
          if (NextX < 1){
            NextX = 1;
          }
          else if (NextX > 1240){
            NextX = 1240;
          }

          let NextY = ev.point.y - 29.5;
          if (NextY < y_limit){
            NextY = y_limit;
          }
          else if (NextY > 670){
            NextY = 670;
          }

          //斜辺を求める(速度を一定にしたいので)
          let imageD = Math.abs(Math.sqrt(Math.pow(Math.abs(PlayerDatas[ev.player.id].Main_Player.x - NextX),2) + Math.pow(Math.abs(PlayerDatas[ev.player.id].Main_Player.y - NextY),2)));

          //移動処理
          if(PlayerDatas[ev.player.id].moveTween){
            PlayerDatas[ev.player.id].moveTween.cancel();
          }
          PlayerDatas[ev.player.id].moveTween = timeline.create(PlayerDatas[ev.player.id].Main_Player).moveTo(NextX, NextY, imageD * 5);
        }
      }
    });


    /////////////////////////
    ////卒業(退学)リスト用////
    /////////////////////////
    let backLabel = new g.FilledRect({scene: scene,hidden:true, local : true,
      width: g.game.width, height: g.game.height, cssColor: "black", opacity: 1});
    scene.append(backLabel);

    let strLabel = new g.Label({scene: scene,x: 0,y: 20,font: font,widthAutoAdjust:false, width:g.game.width,local : true,
      textAlign:"center" ,text: "卒業",fontSize: 50, textColor: "white",opacity: 1,touchable: true ,hidden:true});
    scene.append(strLabel);
    

    ////////////////////////////
    ////オブジェクト初期化処理////
    ////////////////////////////
    findObjs.forEach(Obj => {Obj.modified();});
    startObj.forEach(Obj => {Obj.modified();});
    sankaObj.forEach(Obj => {Obj.modified();});
    playercntObj.forEach(Obj => {Obj.modified();});
    background.invalidate();
    backLabel.modified();


    /////////////////////
    ////グローバル処理////
    /////////////////////
    scene.message.add((ev) =>{
      switch (ev.data.message){
        case "GameStart":
          timeLabel.text = String(gamesecond);
          timeLabel.show();
          timeLabel.invalidate();
          startThen = true;
          backbody.show();
          findObjs.forEach(Obj => {Obj.show();});
          break;

        case "secondUpdate":
          //制限時間設定を全体に反映
          gamesecond += ev.data.PulsSecond;
          if (gamesecond < 1){
            gamesecond = 1;
          }
          else if (gamesecond > 60){
            gamesecond = 60;
          }
          gamesecondLabel.text = gamesecond + "秒";
          gamesecondLabel.invalidate();
          break;

        default:
          break;
      }
    });


    /////////////////
    ////ゲーム動作////
    /////////////////
    scene.onUpdate.add(() => {
      if (startThen == true){
        //開始処理
        //タイトル・設定項目削除
        startObj.forEach(Obj => {Obj.touchable = false; Obj.hide();});
        sankaObj.forEach(Obj => {Obj.touchable = false; Obj.hide();});
        playercntObj.forEach(Obj => {Obj.touchable = false; Obj.hide();});
        
        //半透明にしていた背景を非透明化
        background.opacity = 1;
        background.invalidate();

        //プレイヤーオブジェクト生成
        PlayerIds.forEach(Id => {
          PlayerDatas[Id].Main_Player.invalidate();
          PlayerDatas[Id].Main_Player.show();
        });
        startThen = false;
        gameNowThen = true;
      }


      if (gameNowThen == true){
        //ゲームメイン処理
        gametime += 1 / g.game.fps; 
        if ((gamesecond - gametime) > 0){
          //時間更新
          timeLabel.text = String((Math.ceil(gamesecond - gametime)));
          timeLabel.invalidate();
        }
        else{
          //タイムアップ(gametimeが０以下になれば)したらこちらに遷移
          gameNowThen = false;
          waitthen = true;

          //タイマー削除
          timeLabel.hide();

          PlayerIds.forEach(Id => {
            //全プレイヤーの移動を強制停止
            if(PlayerDatas[Id].moveTween){
              PlayerDatas[Id].moveTween.cancel();
            }
          });

          let sotugyoY = 0;
          let taigakuY = 0;
          PlayerIds.forEach(Id => {
            //卒業・退学リスト作成
            if (PlayerDatas[Id].sotuThen == true){
              sotugyolabels.push(user_add(scene,PlayerDatas[Id].Name,sotugyoY));
              sotugyoY += 60;
            }
            else{
              taigakulabels.push(user_add(scene,PlayerDatas[Id].Name,taigakuY));
              taigakuY += 60;
            }
          });
        }
      }

      if (waitthen == true){
        waittime += 1 / g.game.fps;
        if (waittime > 5){
          waitthen = false;

          PlayerIds.forEach(Id => {
            //プレイヤーオブジェクト削除
            PlayerDatas[Id].Main_Player.hide();
          });

          //背景削除
          background.hide();
          timeLabel.hide();

          //卒業・退学リスト用背景・ヘッダー生成
          backLabel.show();
          strLabel.show();
          strLabel.invalidate();

          gameendThen = true;
        }
      }


      if (gameendThen == true){
        //エラー処理
        if (sotugyolabels == undefined || taigakulabels == undefined){
          console.error("UserLabel undefined");
          return;
        }

        //卒業・退学一覧処理
        let sotuNow = true;
        let taiNow = false;
        let endThen = false;

        //卒業
        if (sotugyolabels.length > 0){
          if (sotuNow == true){
            sotugyolabels = userList_show(sotugyolabels);
            if (showEnd_Then(sotugyolabels) == true){
              sotuNow = false;
              taiNow = true;
            }
          }
        }
        else{
          sotuNow = false;
          taiNow = true;
        }

        //退学
        if (taigakulabels.length > 0){
          if (taiNow == true){
            strLabel.text = "退学";
            strLabel.invalidate();
            taigakulabels = userList_show(taigakulabels);
            if (showEnd_Then(taigakulabels) == true){
              taiNow = false;
              endThen = true;
            }
          }
        }
        else if (sotuNow == false){
          taiNow = false;
          endThen = true;
        }
        
        //最終処理に遷移(オブジェクト削除)
        if (endThen == true){
          gameendThen = false;
          strLabel.hide();
          backLabel.hide();
          sotugyoThen = true;
        }
      }
    });
  });

  g.game.pushScene(scene);
};


module.exports = main;


//乱数生成機
function getrandom(min,max,exc){
  let int = g.game.random.get(min, max);
  while(exc != -1 && exc == int){
      int = g.game.random.get(min, max);
  }
  return int
};


//卒業(退学)リスト作成用
function user_add(scene,Nametxt,plusY){
  let userLabel = new g.Label({textAlign: "center",widthAutoAdjust : false,local : true,
    scene: scene, x: 0, y: g.game.height + plusY, font: font, text: Nametxt, fontSize: 50, 
    textColor: "white", opacity: 1,touchable: false, hidden:true, width:g.game.width});
  userLabel.invalidate();
  scene.append(userLabel);
  return userLabel;
}

function userList_show(labels){
  let labelwait = 2;
  labels.forEach(label =>{
    if (label.y < 70){
      label.hide();
    }
    else if (label.y <= g.game.height){
      label.show();
    }
    label.y -= labelwait;
    label.invalidate();
  });
  return labels
}

function showEnd_Then(labels){
  let result = true;
  labels.forEach(label =>{
    if (label.visible() == true){
      result = false;
    }
  });
  return result;
}


function crateTargetStr(bodyNo){
    let t_str = [""]

    switch (bodyNo){
        case 1:
            t_str.push("パーカー(左)");
            t_str.push("パーカー(右)");
            t_str.push("シャツ(むね)");
            t_str.push("短パン");
            t_str.push("タイツ(左)");
            t_str.push("タイツ(右)");
            break;

        case 2:
            t_str.push("シャツそで(左)");
            t_str.push("シャツそで(右)");
            t_str.push("シャツ(むね)");
            t_str.push("短パン");
            t_str.push("タイツ(左)");
            t_str.push("タイツ(右)");
            break;

        case 3:
            t_str.push("シャツそで(左)");
            t_str.push("シャツそで(右)");
            t_str.push("シャツ(むね)");
            t_str.push("短パン");
            t_str.push("タイツ(左)");
            t_str.push("タイツ(右)");
            break;

        case 4:
            t_str.push("シャツそで(左)");
            t_str.push("シャツそで(右)");
            t_str.push("シャツ(むね)");
            t_str.push("短パン");
            t_str.push("タイツ(左)");
            t_str.push("タイツ(右)");
            break;

        case 5:
            t_str.push("シャツ(左むね)");
            t_str.push("シャツ(右むね)");
            t_str.push("シャツそで(左)");
            t_str.push("ブラ");
            t_str.push("パンツ");
            t_str.push("タイツ(左)");
            t_str.push("タイツ(右)");
            break;

        case 6:
            t_str.push("さきっちょ(左)");
            t_str.push("さきっちょ(右)");
            t_str.push("ぱんつ");
            break;
    }

    return t_str;
}

function createTargetList(bodyNo){
    let t_list = [""];

    switch (bodyNo){
        case 1:
            //x,y,width,height,angle
            t_list.push([445,230,185,425,8]); //パーカー(左)
            t_list.push([665,247,160,420,-5]); //パーカー(右)
            t_list.push([595,236,85,158,0]); //シャツ(むね)
            t_list.push([580,392,110,163,0]); //短パン
            t_list.push([550,554,93,164,0]); //ひだりタイツ
            t_list.push([650,554,70,164,-5]); //みぎタイツ
            break;

        case 2:
            t_list.push([450,270,110,160,-20]); //シャツそで(左)
            t_list.push([730,247,100,160,20]); //シャツそで(右)
            t_list.push([570,240,150,158,0]); //シャツ(むね)
            t_list.push([545,392,199,163,0]); //短パン
            t_list.push([550,554,93,164,0]); //ひだりタイツ
            t_list.push([640,554,93,164,0]); //みぎタイツ
            break;

        case 3:
            t_list.push([470,270,90,160,-20]); //シャツそで(左)
            t_list.push([730,247,100,160,20]); //シャツそで(右)
            t_list.push([570,240,150,158,0]); //シャツ(むね)
            t_list.push([550,392,195,163,0]); //短パン
            t_list.push([550,554,93,164,0]); //ひだりタイツ
            t_list.push([640,554,93,164,0]); //みぎタイツ
            break;

        case 4:
            t_list.push([470,270,90,160,-20]); //シャツそで(左)
            t_list.push([720,270,80,130,20]); //シャツそで(右)
            t_list.push([570,240,150,158,0]); //シャツ(むね)
            t_list.push([575,392,160,163,0]); //短パン
            t_list.push([550,554,93,164,0]); //ひだりタイツ
            t_list.push([640,554,93,164,0]); //みぎタイツ
            break;

        case 5:
            t_list.push([565,260,60,120,0]); //シャツ(左むね)
            t_list.push([645,235,65,150,0]); //シャツ(右むね)
            t_list.push([520,330,65,75,0]); //シャツそで(左)
            t_list.push([620,285,40,65,0]); //ブラ
            t_list.push([560,440,155,65,0]); //ぱんつ
            t_list.push([555,555,80,165,0]); //ひだりタイツ
            t_list.push([645,555,90,160,0]); //みぎタイツ
            break;

        case 6:
            t_list.push([570,280,55,65,0]); //さきっちょ(左)
            t_list.push([660,280,50,65,0]); //さきっちょ(右)
            t_list.push([560,445,150,65,0]); //ぱんつ
            break;
    }

    return t_list;
}